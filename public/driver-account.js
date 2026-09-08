/**
 * Водительский аккаунт: PIN, смена, машина.
 * Грузится до бандла. Бандл вызывает window.__tpEnsureDriver / __tpPickShift / __tpPickVehicle.
 */
(function () {
  if (window.__tpDrvGate) return;
  window.__tpDrvGate = true;

  const DID_KEY = "crm.deviceId";
  const TOK_KEY = "tp.drv.token";
  const WHO_KEY = "tp.drv.who";
  const FALLBACK_CARS = [
    { id: "gazelle_business", name: "Газель Бизнес", plate: "ДЕМО 01" },
    { id: "gazelle_next_gas", name: "Газель Next · бензин", plate: "ДЕМО 02" },
    { id: "gazelle_next_diesel", name: "Газель Next · дизель", plate: "ДЕМО 03" },
    { id: "gazon_next", name: "Газон Next", plate: "ДЕМО 06" },
  ];

  let memDid = "";
  let overlay = null;
  let lastMe = null;

  function cookieGet(n) {
    try {
      const m = document.cookie.match(new RegExp("(?:^|; )" + n.replace(/[.*+?^$()|[\]\\]/g, "\\$&") + "=([^;]*)"));
      return m ? decodeURIComponent(m[1]) : "";
    } catch (e) {
      return "";
    }
  }
  function cookieSet(n, v, days) {
    try {
      const max = Math.round((days || 180) * 86400);
      document.cookie = n + "=" + encodeURIComponent(v || "") + "; Max-Age=" + max + "; Path=/; SameSite=Lax";
    } catch (e) {}
  }
  function lsGet(k) {
    try {
      return localStorage.getItem(k) || "";
    } catch (e) {
      return "";
    }
  }
  function lsSet(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  }

  function stableDid() {
    if (memDid) return memDid;
    let id = lsGet(DID_KEY) || cookieGet("tp_did") || "";
    if (!id || id.indexOf("dev-") !== 0) {
      id = "dev-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    }
    memDid = id;
    lsSet(DID_KEY, id);
    cookieSet("tp_did", id, 180);
    return id;
  }
  window.__tpStableDid = stableDid;

  function api(path, body, method) {
    const opt = {
      method: method || (body ? "POST" : "GET"),
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json", "X-CRM-Device": stableDid() },
    };
    if (body) opt.body = JSON.stringify(body);
    return fetch(path, opt).then(async (r) => {
      let j = {};
      try {
        j = await r.json();
      } catch (e) {}
      if (!r.ok) {
        const err = new Error(j.detail || j.error || j.message || "Ошибка " + r.status);
        err.status = r.status;
        err.body = j;
        throw err;
      }
      return j;
    });
  }

  function ensureCss() {
    if (document.getElementById("tp-drv-acc-css")) return;
    const s = document.createElement("style");
    s.id = "tp-drv-acc-css";
    s.textContent = `
.tpAccMask{position:fixed;inset:0;z-index:12000;background:#07090e;display:flex;align-items:center;justify-content:center;padding:max(12px,env(safe-area-inset-top)) 12px max(16px,env(safe-area-inset-bottom));touch-action:manipulation;overflow:hidden;overscroll-behavior:none}
@media(min-width:720px){.tpAccMask{align-items:center}}
.tpAccCard{width:min(440px,100%);background:#141820;border:1px solid rgba(251,146,60,.38);border-radius:22px;padding:20px 16px 16px;color:#fff;font-family:Onest,system-ui,sans-serif;box-shadow:0 24px 60px rgba(0,0,0,.45);position:relative}
.tpAccCard h2{margin:0 36px 6px 0;font-size:1.28rem;font-weight:800;letter-spacing:-.02em}
.tpAccCard p.tpAccSub{margin:0 0 14px;color:#cbd5e1;font-size:.92rem;line-height:1.35}
.tpAccErr{min-height:1.2em;color:#fb7185;font-size:.88rem;font-weight:700;margin:8px 0 0;text-align:center}
.tpAccStack{display:flex;flex-direction:column;gap:10px;margin-top:4px}
.tpAccOrange{appearance:none;-webkit-appearance:none;border:0;border-radius:16px;background:linear-gradient(180deg,#fb923c,#ea580c);color:#fff;font-weight:800;font-size:1.06rem;padding:16px 16px;width:100%;min-height:64px;cursor:pointer;box-shadow:0 8px 20px rgba(234,88,12,.35);text-align:left;display:flex;flex-direction:column;gap:2px;touch-action:manipulation}
.tpAccOrange span{font-weight:600;font-size:.82rem;opacity:.92}
.tpAccOrange:active{transform:scale(.98)}
.tpAccGhost{appearance:none;background:transparent;border:1px solid rgba(148,163,184,.35);color:#cbd5e1;border-radius:14px;padding:12px;width:100%;margin-top:10px;font-weight:600;cursor:pointer;min-height:44px;touch-action:manipulation}
.tpAccPad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
.tpAccPad button{appearance:none;border:0;border-radius:14px;background:#1e2633;color:#fff;font-size:1.35rem;font-weight:700;min-height:56px;cursor:pointer;touch-action:manipulation}
.tpAccPad button:active{background:#2a3344}
.tpAccDots{display:flex;justify-content:center;gap:12px;margin:10px 0 8px}
.tpAccDots i{width:14px;height:14px;border-radius:50%;border:2px solid #fb923c;background:transparent;display:block}
.tpAccDots i.on{background:#fb923c}
.tpAccVeh{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.tpAccVeh button{appearance:none;text-align:left;border:0;background:linear-gradient(180deg,#f97316,#c2410c);color:#fff;border-radius:16px;padding:14px 16px;cursor:pointer;font-weight:800;min-height:58px;box-shadow:0 8px 18px rgba(194,65,12,.28);touch-action:manipulation}
.tpAccVeh button small{display:block;font-weight:600;opacity:.9;margin-top:3px}
`;
    document.head.appendChild(s);
  }

  function closeOverlay() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  function openCard(html) {
    ensureCss();
    closeOverlay();
    overlay = document.createElement("div");
    overlay.className = "tpAccMask";
    overlay.innerHTML = '<div class="tpAccCard">' + html + "</div>";
    document.body.appendChild(overlay);
    return overlay;
  }

  function alertCard(title, msg) {
    return new Promise((resolve) => {
      openCard(
        "<h2>" + title + "</h2><p class=\"tpAccSub\">" + (msg || "") + "</p>" +
          '<button type="button" class="tpAccOrange" id="tpAccOk">Понятно</button>'
      );
      overlay.querySelector("#tpAccOk").addEventListener("click", () => {
        closeOverlay();
        resolve();
      });
    });
  }

  function pinPad(title, sub) {
    return new Promise((resolve) => {
      openCard(
        "<h2>" + title + "</h2><p class=\"tpAccSub\">" + sub + "</p>" +
          '<div class="tpAccDots"><i></i><i></i><i></i><i></i></div>' +
          '<div class="tpAccPad">' +
          [1, 2, 3, 4, 5, 6, 7, 8, 9, "←", 0, "OK"]
            .map((x) => '<button type="button" data-k="' + x + '">' + x + "</button>")
            .join("") +
          "</div>" +
          '<div class="tpAccErr" id="tpAccErr"></div>' +
          '<button type="button" class="tpAccGhost" data-k="cancel">Отмена</button>'
      );
      let pin = "";
      const err = overlay.querySelector("#tpAccErr");
      const paint = () => {
        overlay.querySelectorAll(".tpAccDots i").forEach((el, i) => el.classList.toggle("on", i < pin.length));
      };
      overlay.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        const k = b.getAttribute("data-k");
        if (k === "cancel") {
          closeOverlay();
          resolve(null);
          return;
        }
        if (k === "←") {
          pin = pin.slice(0, -1);
          paint();
          return;
        }
        if (k === "OK") {
          if (pin.length !== 4) {
            err.textContent = "Введите 4 цифры";
            return;
          }
          closeOverlay();
          resolve(pin);
          return;
        }
        if (/^[0-9]$/.test(k) && pin.length < 4) {
          pin += k;
          paint();
          if (pin.length === 4) {
            closeOverlay();
            resolve(pin);
          }
        }
      });
    });
  }

  function remember(me) {
    lastMe = me || lastMe;
    if (me && me.driver) {
      lsSet(WHO_KEY, me.driver);
      cookieSet("tp_drv_who", me.driver, 14);
      cookieSet("tp_role", "driver", 180);
      cookieSet("tp_drv", me.driver, 180);
    }
    if (me && me.token) lsSet(TOK_KEY, me.token);
    if (me && me.shiftDate && me.shiftPeriod) {
      window.__tpShiftPicked = { date: me.shiftDate, period: "day", label: "Смена" };
    }
    if (me && me.vehicleId) {
      window.__tpVehicleId = me.vehicleId;
      try { localStorage.setItem("crm.driverVehicle.v1", me.vehicleId); } catch (e) {}
    }
    return me;
  }

  window.__tpEnsureDriver = async function (driverName) {
    const deviceId = stableDid();
    const token = lsGet(TOK_KEY);
    try {
      const me = await api("/api/driver-auth/me", { deviceId, token, driver: driverName || "" });
      if (me && me.occupied) {
        await alertCard("Линия занята", "Войти может только водитель, который сейчас на линии. С другого телефона — после конца смены.");
        return null;
      }
      if (me && me.bound && me.driver && (!driverName || me.driver === driverName || String(me.driver).indexOf(String(driverName).split(" ")[0]) === 0)) {
        return remember(me);
      }
    } catch (e) {}
    const pin = await pinPad(
      "Пароль смены",
      driverName ? "Только для «" + driverName + "» · один раз на это устройство" : "4 цифры · привяжется к этому телефону"
    );
    if (!pin) return null;
    try {
      const res = await api("/api/driver-auth/login", { pin, deviceId, driver: driverName || "" });
      cookieSet("tp_drv_tok", res.token || "", 14);
      return remember(res);
    } catch (e) {
      await alertCard("Не войти", (e && e.message) || "Ошибка");
      return null;
    }
  };

  function mskNow() {
    try {
      const f = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Moscow",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        hourCycle: "h23",
      });
      const p = Object.fromEntries(
        [...f.formatToParts(new Date())].filter((x) => x.type !== "literal").map((x) => [x.type, x.value])
      );
      return { date: p.year + "-" + p.month + "-" + p.day, hour: Number(p.hour) };
    } catch (e) {
      const d = new Date();
      return { date: d.toISOString().slice(0, 10), hour: d.getHours() };
    }
  }
  function shiftOf() {
    const n = mskNow();
    if (n.hour >= 6) return { date: n.date, period: "day", label: "Смена" };
    const dt = new Date(n.date + "T12:00:00+03:00");
    dt.setDate(dt.getDate() - 1);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return { date: y + "-" + m + "-" + day, period: "day", label: "Смена" };
  }

  window.__tpPickShift = function () {
    if (window.__tpShiftPicked && window.__tpShiftPicked.date) {
      window.__tpShiftPicked.period = "day";
      window.__tpShiftPicked.label = "Смена";
      return Promise.resolve(window.__tpShiftPicked);
    }
    if (lastMe && lastMe.shiftDate) {
      const s = { date: lastMe.shiftDate, period: "day", label: "Смена" };
      window.__tpShiftPicked = s;
      return Promise.resolve(s);
    }
    const s = shiftOf();
    window.__tpShiftPicked = s;
    return Promise.resolve(s);
  };

  window.__tpPickVehicle = async function () {
    if (window.__tpVehiclePicked) return window.__tpVehiclePicked;
    let vehicles = [];
    try {
      const cfg = await api("/api/config", null, "GET");
      vehicles = Array.isArray(cfg.vehicles) ? cfg.vehicles : [];
    } catch (e) {}
    if (!vehicles.length) vehicles = FALLBACK_CARS.slice();
    if (lastMe && lastMe.vehicleId) {
      const found = vehicles.find((v) => v.id === lastMe.vehicleId);
      if (found) {
        const label = (found.name || found.label || found.id || "").replace(/^Эвакуатор\s+/i, "");
        const picked = { id: found.id, label: label + (found.plate ? " · " + found.plate : "") };
        window.__tpVehiclePicked = picked;
        window.__tpVehicleLabel = picked.label;
        window.__tpVehicleId = picked.id;
        try { localStorage.setItem("crm.driverVehicle.v1", picked.id); } catch (e) {}
        return picked;
      }
    }
    return new Promise((resolve) => {
      const btns = vehicles
        .map((v) => {
          const label = (v.name || v.label || v.id || "").replace(/^Эвакуатор\s+/i, "");
          const plate = v.plate ? "<small>" + v.plate + "</small>" : "";
          return (
            '<button type="button" data-id="' +
            v.id +
            '" data-label="' +
            label +
            (v.plate ? " · " + v.plate : "") +
            '">' +
            label +
            plate +
            "</button>"
          );
        })
        .join("");
      openCard(
        "<h2>На какой машине?</h2><p class=\"tpAccSub\">Сегодня едете на этой технике</p>" +
          '<div class="tpAccVeh">' +
          btns +
          "</div>" +
          '<button type="button" class="tpAccGhost" data-id="">Отмена</button>'
      );
      overlay.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        const id = b.getAttribute("data-id");
        closeOverlay();
        if (!id) {
          resolve(null);
          return;
        }
        const picked = { id, label: b.getAttribute("data-label") || id };
        window.__tpVehiclePicked = picked;
        window.__tpVehicleLabel = picked.label;
        window.__tpVehicleId = picked.id;
        try { localStorage.setItem("crm.driverVehicle.v1", picked.id); } catch (e) {}
        resolve(picked);
      });
    });
  };

  window.__tpSaveShift = async function (payload) {
    try {
      await api("/api/driver-auth/shift", {
        driver: payload.driver,
        deviceId: stableDid(),
        shiftDate: payload.shiftDate,
        shiftPeriod: payload.shiftPeriod,
        vehicleId: payload.vehicleId || window.__tpVehicleId || "",
      });
    } catch (e) {}
  };
})();
