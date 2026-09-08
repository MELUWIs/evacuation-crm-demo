import {
  createEngine,
  shiftDate,
  drivers,
  dispatchers,
  vehicles,
} from './demo-api.js';
const nativeFetch = window.fetch.bind(window);
const reportShape = await nativeFetch('/original/report-shape.json').then((r) =>
  r.json(),
);
const engine = createEngine({ storage: localStorage, reportShape });
const driverMode =
  location.pathname.startsWith('/driver') ||
  new URLSearchParams(location.search).get('mode') === 'driver';
window.__tpIsDriverEntry = driverMode;
window.tpRuntimeIsTv = false;
const date = shiftDate();
const session = {
  'crm.auth.token.v1': 'demo-local-token',
  'crm.auth.dispatcher.v1': dispatchers[0],
  'crm.dispatcherGate.unlocked.v1': '1',
  'crm.dispatcherGate.unlockedAt.v1': String(Date.now()),
  'crm.dispatcherGate.active.v1': JSON.stringify({
    mode: 'admin',
    companyRole: 'owner',
    dispatcher: dispatchers[0],
    date,
    period: 'day',
  }),
  'crm.view.v20': 'analytics',
  'crm.tab.v20': 'all',
  'crm-theme': 'dark',
  'crm.lastPortalRole': driverMode ? 'driver' : 'company',
  'crm.lastDriver': driverMode ? drivers[0] : '',
  'tp.drv.token': 'demo-driver-token',
  'tp.drv.who': drivers[0],
  'crm.myDriver': drivers[0],
  'crm.driverLockedShift.v1': JSON.stringify(
    Object.fromEntries(
      drivers.map((driver) => [
        driver,
        { date, period: 'day', label: 'Смена' },
      ]),
    ),
  ),
  'crm.deviceId': 'demo-device-local',
  'crm.driverVehicle.v1': vehicles[0].id,
};
Object.entries(session).forEach(([key, value]) =>
  localStorage.setItem(key, value),
);
for (const [key, value] of Object.entries({
  tp_role: driverMode ? 'driver' : 'company',
  tp_drv: driverMode ? drivers[0] : '',
  tp_drv_who: drivers[0],
  tp_drv_tok: 'demo-driver-token',
}))
  document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;
sessionStorage.setItem('crm.view.v20', 'analytics');
sessionStorage.setItem('crm.tab.v20', 'in_progress');
window.__tpShiftPicked = { date, period: 'day' };
window.__tpVehicleId = vehicles[0].id;
window.technoprimeDemo = {
  reset: engine.reset,
  getOrders: () =>
    engine.getOrders().filter((o) => !driverMode || o.driver === drivers[0]),
};
window.fetch = async (input, options = {}) => {
  const url = new URL(
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url,
    location.href,
  );
  if (url.pathname.includes('/api/')) {
    const method =
      options.method || (input instanceof Request ? input.method : 'GET');
    let body = options.body;
    if (
      body === undefined &&
      input instanceof Request &&
      !['GET', 'HEAD'].includes(method)
    )
      body = await input.clone().text();
    try {
      body =
        typeof body === 'string'
          ? JSON.parse(body)
          : body instanceof FormData
            ? Object.fromEntries(body)
            : body || {};
    } catch {
      body = {};
    }
    const response = engine.request(url.href, method, body);
    if (response.status >= 400)
      console.info('[Demo API]', method, url.pathname, response.status);
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ETag: '"demo-' + engine.getState().revision + '"',
        'Cache-Control': 'no-store',
      },
    });
  }
  if (url.origin !== location.origin)
    return new Response('External services are disabled in this local demo.', {
      status: 403,
    });
  return nativeFetch(input, options);
};
class LocalSocket extends EventTarget {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  readyState = 1;
  constructor() {
    super();
    queueMicrotask(() => {
      const event = new Event('open');
      this.dispatchEvent(event);
      this.onopen?.(event);
    });
  }
  send() {}
  close() {
    this.readyState = 3;
  }
}
window.WebSocket = LocalSocket;
window.EventSource = LocalSocket;
try {
  navigator.sendBeacon = () => false;
  if (navigator.serviceWorker)
    navigator.serviceWorker.register = async () => {
      throw Error('Service workers are disabled in this demo');
    };
} catch {}
const driverScript = document.createElement('script');
driverScript.src = '/driver-account.js';
await new Promise((resolve, reject) => {
  driverScript.onload = resolve;
  driverScript.onerror = reject;
  document.head.append(driverScript);
});
await import('/assets/tp-mobile-entry-20260907.js');
const responsive = document.createElement('script');
responsive.src = '/mobile-runtime.js';
document.head.append(responsive);
