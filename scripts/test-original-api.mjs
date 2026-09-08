import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  createEngine,
  shiftDate,
  drivers,
  vehicles,
} from '../public/original/demo-api.js';
const map = new Map();
const storage = {
  getItem: (k) => map.get(k),
  setItem: (k, v) => map.set(k, v),
};
const now = () => new Date('2026-09-08T09:00:00Z');
const shape = JSON.parse(
  fs.readFileSync(
    new URL('../public/original/report-shape.json', import.meta.url),
  ),
);
const options = { storage, now, reportShape: shape };
let api = createEngine(options);
const req = (path, method, body) => api.request('/api' + path, method, body);
assert.equal(shiftDate(new Date('2026-09-08T02:00:00Z')), '2026-09-07');
const before = req('/stats/summary?date=2026-09-08').data;
assert.equal(before.completedCount, 7);
assert.equal(before.periodRevenue, 69000);
assert.equal(before.profit, 34020);
assert.equal(before.expenseTotal, 34980);
assert.equal(
  Object.values(before.byDriver).reduce((n, v) => n + v.revenue, 0),
  before.periodRevenue,
);
assert.equal(req('/config').data.equipmentLines.length, 4);
const created = req('/orders', 'POST', {
  text: 'Тип заказа: Срочный\nАвто: Учебный\nЦена: 10000',
  status: 'in_progress',
  driver: drivers[1],
  dispatcher: 'Диспетчер Demo',
  equipmentLine: vehicles[1].id,
  revenue: 10000,
  paymentMethod: 'cash',
});
assert.equal(created.status, 200);
const order = created.data.order;
assert.equal(
  req('/stats/summary?date=2026-09-08').data.periodRevenue,
  before.periodRevenue,
);
req('/orders/' + order.id + '/driver-done', 'POST', { actualKm: 21 });
assert.equal(req('/orders/' + order.id).data.pendingConfirm, true);
req('/orders/' + order.id, 'PATCH', {
  status: 'completed',
  pendingConfirm: false,
});
assert.equal(
  req('/stats/summary?date=2026-09-08').data.periodRevenue,
  before.periodRevenue + 10000,
);
assert.equal(
  req('/reports/dispatcher?date=2026-09-08').data.revenue.total,
  79000,
);
api = createEngine(options);
assert.equal(req('/orders/' + order.id).data.status, 'completed');
req('/orders/' + order.id, 'DELETE');
assert.equal(req('/stats/summary?date=2026-09-08').data.periodRevenue, 69000);
req('/orders/' + order.id, 'PATCH', { deletedAt: null });
assert.equal(req('/stats/summary?date=2026-09-08').data.periodRevenue, 79000);
const prior = req('/stats/summary?date=2026-09-08').data.expenseTotal;
req('/expenses', 'POST', {
  date: '2026-09-08',
  category: 'fuel',
  amount: 1000,
});
assert.equal(
  req('/stats/summary?date=2026-09-08').data.expenseTotal,
  prior + 1000,
);
assert.equal(req('/stats/summary?date=2026-09-09').data.periodRevenue, 0);
req('/maintenance-journal', 'POST', {
  vehicleId: vehicles[0].id,
  status: 'active',
  comment: 'Учебное ТО',
});
assert.equal(req('/maintenance-journal').data.active.length, 1);
assert.equal(req('/reports/dispatcher/session').data.status, 'active');
assert.equal(
  req('/reports/dispatcher/session/end', 'POST').data.session.status,
  'pending_close',
);
assert.equal(req('/unknown', 'POST', {}).status, 501);
assert.equal(req('/avito/sync', 'POST', {}).data.connected, false);
api.reset();
assert.equal(req('/stats/summary?date=2026-09-08').data.periodRevenue, 69000);
console.log(
  'Original CRM API: shift boundaries, fleet totals, create/complete/restore, persistence, expenses, maintenance and external isolation passed.',
);
