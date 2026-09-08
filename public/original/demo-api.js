/** Local, synthetic API data for the preserved TechnoPrime frontend. No server credentials. */
export const STORAGE_KEY = 'technoprime-demo-original-v2';
export const drivers = ['Альфа', 'Бета', 'Гамма', 'Дельта'];
export const dispatchers = ['Диспетчер Demo', 'Оператор Бета'];
export const vehicles = [
  {
    id: 'gazelle_next_gas',
    name: 'Газель Next (бензин)',
    plate: 'ДЕМО 01',
    label: 'Газель Next (бензин)',
  },
  {
    id: 'gazelle_business',
    name: 'Газель Бизнес',
    plate: 'ДЕМО 02',
    label: 'Газель Бизнес',
  },
  {
    id: 'gazelle_next_diesel',
    name: 'Газель Next (дизель)',
    plate: 'ДЕМО 03',
    label: 'Газель Next (дизель)',
  },
  {
    id: 'gazon_next',
    name: 'Газон Next',
    plate: 'ДЕМО 04',
    label: 'Газон Next',
  },
];
export function shiftDate(now = new Date()) {
  const moscow = new Date(now.getTime() + 3 * 3600000);
  if (moscow.getUTCHours() < 6) moscow.setUTCDate(moscow.getUTCDate() - 1);
  return moscow.toISOString().slice(0, 10);
}
const num = (value) => Number(value) || 0;
const sum = (rows, field) =>
  rows.reduce((total, row) => total + num(row[field]), 0);
const plusDays = (date, days) =>
  new Date(Date.parse(date + 'T12:00:00Z') + days * 86400000)
    .toISOString()
    .slice(0, 10);
const clone = (value) => JSON.parse(JSON.stringify(value));
export function seed(now = new Date()) {
  const date = shiftDate(now);
  const orders = [];
  const cars = [
    'Skoda Octavia',
    'Kia Rio',
    'Volkswagen Polo',
    'Ford Transit',
    'Hyundai Solaris',
    'Lada Vesta',
    'Renault Duster',
    'Toyota Camry',
  ];
  const streets = [
    'Учебная улица, 12',
    'Демонстрационный проспект, 8',
    'Тестовая улица, 24',
    'Макетный переулок, 5',
  ];
  for (let day = -6; day <= 0; day++) {
    for (let i = 0; i < 12; i++) {
      const d = plusDays(date, day),
        seqNo = 1000 + (day + 6) * 12 + i;
      const status =
        day < 0 || i < 7
          ? 'completed'
          : i < 10
            ? 'in_progress'
            : i === 10
              ? 'approval'
              : 'scheduled';
      const revenue = 4500 + ((i * 3 + day + 6) % 8) * 1500;
      const driver = drivers[i % 4];
      const stamp = `${d}T${String(6 + i).padStart(2, '0')}:15:00+03:00`;
      orders.push({
        id: `demo-${seqNo}`,
        seqNo,
        status,
        driver: i > 9 ? '' : driver,
        dispatcher: dispatchers[0],
        originDispatcher: dispatchers[0],
        equipmentLine: vehicles[i % 4].id,
        vehicleId: vehicles[i % 4].id,
        revenue,
        driverPay: revenue * 0.2,
        dispatcherPay: revenue * 0.07,
        paymentMethod: ['cash', 'transfer', 'cashless'][i % 3],
        source: ['Авито', 'Сайт', 'Прямой звонок'][i % 3],
        text: `📌Новый заказ📌\nТип заказа: ${status === 'approval' ? 'Согласование' : 'Заказ Технопрайм'}\nАвто: ${cars[i % cars.length]}\nНачальная точка: ${streets[i % 4]}\nДО: Учебный автосервис, корпус ${(i % 3) + 1}\nКол-во КМ (от точки А до Б): ${14 + i * 3}\nНомер телефона: +7 000 000-00-00\nЦена: ${revenue} руб.\nКоментарий: учебный заказ, все данные вымышлены`,
        createdAt: stamp,
        updatedAt: stamp,
        messageDate: stamp,
        completedAt:
          status === 'completed'
            ? `${d}T${String(7 + i).padStart(2, '0')}:05:00+03:00`
            : null,
        scheduledAt:
          status === 'scheduled' ? `${plusDays(d, 1)}T10:00:00+03:00` : null,
        shiftDate: d,
        shiftPeriod: 'day',
        date: d,
        isPartner: false,
        pendingConfirm: false,
        actualKm: 14 + i * 3,
        distanceKm: 14 + i * 3,
        kmToStart: 3 + i,
        offHours: 0,
        deletedAt: null,
      });
    }
  }
  const assignments = Array.from({ length: 14 }, (_, i) =>
    plusDays(date, i - 6),
  ).flatMap((d) => [
    ...drivers.map((person, i) => ({
      id: `shift-${d}-${i}`,
      date: d,
      period: 'day',
      role: 'driver',
      person,
      vehicleId: vehicles[i].id,
      timeStart: '06:00',
      timeEnd: '06:00',
    })),
    {
      id: `shift-${d}-dispatch`,
      date: d,
      period: 'day',
      role: 'dispatcher',
      person: dispatchers[0],
      timeStart: '06:00',
      timeEnd: '06:00',
    },
  ]);
  return {
    version: 2,
    date,
    revision: 1,
    orders,
    assignments,
    schedules: [],
    expenses: Array.from({ length: 7 }, (_, i) => ({
      id: `expense-${i}`,
      date: plusDays(date, i - 6),
      shiftDate: plusDays(date, i - 6),
      period: 'day',
      category: 'fuel',
      amount: 2400,
      driver: drivers[0],
      dispatcher: dispatchers[0],
      equipmentLine: vehicles[0].id,
      vehicleId: vehicles[0].id,
      comment: 'Учебная заправка',
      createdAt: `${plusDays(date, i - 6)}T08:30:00+03:00`,
    })),
    maintenance: [],
    runs: [],
    partners: [
      {
        id: 'demo-partner-1',
        name: 'Учебный автосервис',
        phone: '+70000000000',
        comment: 'Вымышленная компания',
        active: true,
      },
    ],
    cashTxns: [],
    receipts: [],
    sessions: {},
    reportMeta: {},
    config: {},
  };
}
export function createEngine({
  storage,
  now = () => new Date(),
  reportShape = {},
} = {}) {
  let state;
  try {
    state = JSON.parse(storage?.getItem(STORAGE_KEY) || 'null');
  } catch {}
  if (!state || state.version !== 2 || state.date !== shiftDate(now()))
    state = seed(now());
  const save = () => {
    state.revision++;
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  };
  const current = () => shiftDate(now());
  const matches = (row, q) => {
    const date =
      row.shiftDate ||
      row.date ||
      String(row.messageDate || row.createdAt || '').slice(0, 10);
    return (
      (!q.get('date') || date === q.get('date')) &&
      (!q.get('from') || date >= q.get('from').slice(0, 10)) &&
      (!q.get('to') || date <= q.get('to').slice(0, 10)) &&
      (!q.get('driver') || row.driver === q.get('driver')) &&
      (!q.get('dispatcher') || row.dispatcher === q.get('dispatcher'))
    );
  };
  const active = (q) =>
    state.orders.filter((o) => !o.deletedAt && matches(o, q));
  function stats(q) {
    const rows = active(q),
      completed = rows.filter((o) => o.status === 'completed');
    const expenses = state.expenses.filter((e) => matches(e, q));
    const revenueByPayment = {
      cash: 0,
      transfer: 0,
      cashless: 0,
      partner: 0,
      unknown: 0,
    };
    const countByPayment = { ...revenueByPayment };
    completed.forEach((o) => {
      const k =
        o.paymentMethod in revenueByPayment ? o.paymentMethod : 'unknown';
      revenueByPayment[k] += num(o.revenue);
      countByPayment[k]++;
    });
    const staff = (names) =>
      Object.fromEntries(
        names.map((name) => {
          const own = rows.filter(
              (o) => o.driver === name || o.dispatcher === name,
            ),
            done = own.filter((o) => o.status === 'completed');
          const revenue = sum(done, 'revenue'),
            pay = sum(
              done,
              drivers.includes(name) ? 'driverPay' : 'dispatcherPay',
            );
          return [
            name,
            {
              orders: own.length,
              completed: done.length,
              cancelled: own.filter((o) => o.status === 'cancelled').length,
              revenue,
              expenses: pay,
              profit: revenue - pay,
              payFromOrders: pay,
            },
          ];
        }),
      );
    const revenue = sum(completed, 'revenue'),
      driverPay = sum(completed, 'driverPay'),
      dispatcherPay = sum(completed, 'dispatcherPay'),
      otherExpenseTotal = sum(expenses, 'amount'),
      depreciationTotal = revenue * 0.1,
      technoprimeDeal = completed.length * 150,
      marketerPay = completed.length ? 6000 : 0,
      expenseTotal =
        driverPay +
        dispatcherPay +
        otherExpenseTotal +
        depreciationTotal +
        technoprimeDeal +
        marketerPay;
    const byHour = Array(24).fill(0);
    completed.forEach((o) => byHour[new Date(o.completedAt).getUTCHours()]++);
    return {
      from: q.get('from') || q.get('date') || current(),
      to: q.get('to') || q.get('date') || current(),
      shiftDate: q.get('date') || current(),
      shiftPeriod: 'day',
      shiftDispatcher: dispatchers[0],
      periodCount: rows.length,
      orders: rows.length,
      completed: completed.length,
      todayCount: rows.length,
      yesterdayCount: 12,
      weekCount: state.orders.length,
      monthCount: state.orders.length,
      completedCount: completed.length,
      cancelledCount: rows.filter((o) => o.status === 'cancelled').length,
      conversionRate: rows.length ? (completed.length / rows.length) * 100 : 0,
      cancelRate: 0,
      periodRevenue: revenue,
      ownRevenue: revenue,
      partnerRevenue: 0,
      partnerCompletedCount: 0,
      todayRevenue: revenue,
      weekRevenue: sum(
        state.orders.filter((o) => o.status === 'completed' && !o.deletedAt),
        'revenue',
      ),
      monthRevenue: revenue,
      totalRevenue: revenue,
      expenseTotal,
      driverPay,
      dispatcherPay,
      depreciationTotal,
      technoprimeDeal,
      marketerPay,
      otherExpenseTotal,
      profit: revenue - expenseTotal,
      yandexDirectApi: 0,
      yandexDirectManual: 0,
      yandexDirectByAccount: { alexander: 0, maxim: 0, avito: 0 },
      expenseByCategory: {
        yandex_direct: 0,
        fuel: sum(
          expenses.filter((e) => e.category === 'fuel'),
          'amount',
        ),
        other: 0,
        depreciation: 0,
        other_ads: 0,
        car_wash: 0,
        plan_return: 0,
      },
      expenseByDriver: {},
      expenseByDispatcher: {},
      revenueByPayment,
      countByPayment,
      revenueFilledCount: completed.length,
      byHour,
      byDriver: staff(drivers),
      byDispatcher: staff(dispatchers),
      dayNightSplit: {
        date: current(),
        day: {
          ownRevenue: revenue,
          partnerRevenue: 0,
          periodRevenue: revenue,
          completedCount: completed.length,
        },
        night: {
          ownRevenue: 0,
          partnerRevenue: 0,
          periodRevenue: 0,
          completedCount: 0,
        },
      },
    };
  }
  function report(q) {
    const date = q.get('date') || current(),
      scoped = new URLSearchParams(q);
    scoped.set('date', date);
    const s = stats(scoped),
      rows = active(scoped).filter((o) => o.status === 'completed');
    const r = clone(reportShape);
    const lines = vehicles.map((v) => ({
      id: v.id,
      key: v.id,
      equipmentLine: v.id,
      label: v.name,
      name: v.name,
      amount: sum(
        rows.filter((o) => o.equipmentLine === v.id),
        'driverPay',
      ),
      count: rows.filter((o) => o.equipmentLine === v.id).length,
    }));
    return {
      ...r,
      date,
      dateDisplay: date.split('-').reverse().join('.'),
      period: 'day',
      periodLabel: 'Смена',
      timeStart: '06:00',
      timeEnd: '06:00',
      dispatcher: q.get('dispatcher') || dispatchers[0],
      scheduledDispatcher: dispatchers[0],
      equipmentLines: vehicles.map((v) => ({
        ...v,
        key: v.id,
        count: rows.filter((o) => o.equipmentLine === v.id).length,
      })),
      orderCount: rows.length,
      orders: rows,
      revenue: { ...s.revenueByPayment, total: s.periodRevenue },
      expenses: {
        ...r.expenses,
        depreciation: s.depreciationTotal,
        technoprimeDeal: s.technoprimeDeal,
        marketerPay: s.marketerPay,
        driverPay: s.driverPay,
        dispatcherPayOrders: s.dispatcherPay,
        driverPayLines: lines,
        dispatcherPayByDriver: drivers.map((name) => ({
          driver: name,
          name,
          amount: sum(
            rows.filter((o) => o.driver === name),
            'dispatcherPay',
          ),
        })),
        fuel: s.expenseByCategory.fuel,
        fuelByLine: vehicles.map((v) => ({
          key: v.id,
          label: v.name,
          amount: sum(
            state.expenses.filter(
              (e) =>
                matches(e, scoped) &&
                e.category === 'fuel' &&
                e.vehicleId === v.id,
            ),
            'amount',
          ),
        })),
        total: s.expenseTotal,
      },
      profit: s.profit,
      activeCount: active(scoped).filter((o) => o.status === 'in_progress')
        .length,
      partnerOrderCount: 0,
      shiftStatus: state.sessions[date]?.status || 'open',
      meta: {
        ...r.meta,
        dispatcherName: dispatchers[0],
        ...(state.reportMeta[date] || {}),
      },
    };
  }
  const result = (data, status = 200) => ({ data, status });
  const id = (prefix) => `${prefix}-${now().getTime()}-${state.revision}`;
  function request(path, method = 'GET', body = {}) {
    const url = new URL(path, 'https://local.invalid');
    let p = url.pathname.replace(/^.*?\/api/, '').replace(/\/$/, '') || '/';
    const q = url.searchParams;
    method = method.toUpperCase();
    if (p === '/config')
      return result({
        standalone: true,
        groupInvite: '',
        drivers,
        dispatchers,
        allDrivers: drivers,
        allDispatchers: dispatchers,
        vehicles,
        equipmentLines: vehicles.map((v) => ({
          id: v.id,
          label: v.name,
          vehicleId: v.id,
        })),
        ...state.config,
      });
    if (p.startsWith('/auth/') || p.startsWith('/dispatcher-direct/'))
      return result({
        ok: true,
        authenticated: true,
        token: 'demo-local-token',
        dispatcher: dispatchers[0],
        companyRole: 'owner',
        lock: null,
        scope: 'demo_local',
      });
    if (p.startsWith('/driver-auth/'))
      return result({
        ok: true,
        bound: true,
        authenticated: true,
        driver: body.driver || drivers[0],
        token: 'demo-driver-token',
        shiftDate: body.shiftDate || current(),
        shiftPeriod: 'day',
        vehicleId: body.vehicleId || vehicles[0].id,
        occupied: false,
      });
    if (p === '/orders/rev' || p.endsWith('/rev'))
      return result({ rev: String(state.revision) });
    if (p === '/orders' && method === 'GET')
      return result(state.orders.filter((o) => matches(o, q)));
    if (p === '/orders' && method === 'POST') {
      if (!String(body.text || '').trim())
        return result({ ok: false, error: 'Добавьте описание заказа.' }, 400);
      const order = {
        ...body,
        id: id('demo-order'),
        seqNo: Math.max(...state.orders.map((o) => num(o.seqNo)), 0) + 1,
        status: body.status || 'approval',
        createdAt: now().toISOString(),
        messageDate: now().toISOString(),
        updatedAt: now().toISOString(),
        shiftDate: current(),
        shiftPeriod: 'day',
        deletedAt: null,
      };
      state.orders.push(order);
      save();
      return result({ ok: true, order });
    }
    const match = p.match(/^\/orders\/([^/]+)(?:\/(.*))?$/);
    if (match) {
      const order = state.orders.find(
        (o) => o.id === decodeURIComponent(match[1]),
      );
      if (!order)
        return result({ ok: false, error: 'Учебный заказ не найден' }, 404);
      if (method === 'GET') return result(order);
      if (method === 'DELETE') order.deletedAt = now().toISOString();
      else if (match[2] === 'driver-done')
        Object.assign(order, body, { pendingConfirm: true });
      else Object.assign(order, body);
      if (order.status === 'completed' && !order.pendingConfirm) {
        order.completedAt ||= now().toISOString();
        order.driverPay = num(order.revenue) * 0.2;
        order.dispatcherPay = num(order.revenue) * 0.07;
      }
      order.updatedAt = now().toISOString();
      save();
      return result({ ok: true, order });
    }
    if (p === '/shifts') {
      if (method === 'GET')
        return result({
          assignments: state.assignments,
          schedules: state.schedules,
        });
      if (method === 'DELETE') {
        state.assignments = state.assignments.filter(
          (s) => s.id !== (body.id || q.get('id')),
        );
        save();
        return result({ ok: true });
      }
      const shift = { ...body, id: body.id || id('shift') };
      state.assignments = state.assignments.filter(
        (s) =>
          !(
            s.date === shift.date &&
            s.period === shift.period &&
            s.role === shift.role &&
            s.person === shift.person
          ),
      );
      state.assignments.push(shift);
      save();
      return result({ ok: true, shift });
    }
    if (p === '/shifts/schedule') {
      state.schedules.push({ ...body, id: id('schedule') });
      save();
      return result({ ok: true, schedules: state.schedules });
    }
    if (p.includes('pin'))
      return result({
        ok: true,
        valid: String(body.pin || body.password || '1234') === '1234',
      });
    if (p === '/stats/summary') return result(stats(q));
    if (p.startsWith('/reports/dispatcher/session')) {
      const date = body.date || q.get('date') || current();
      if (method !== 'GET') {
        state.sessions[date] = {
          ...state.sessions[date],
          ...body,
          status: /close/.test(p)
            ? 'none'
            : /end/.test(p)
              ? 'pending_close'
              : 'active',
        };
        save();
      }
      const session = {
        date,
        period: 'day',
        dispatcher: dispatchers[0],
        status: 'active',
        startedAt: date + 'T06:00:00+03:00',
        current: { date: current(), period: 'day', label: 'Смена' },
        lastClosed: null,
        ...state.sessions[date],
      };
      return result(method === 'GET' ? session : { ok: true, session });
    }
    if (p === '/reports/dispatcher/meta') {
      const date = body.date || current();
      state.reportMeta[date] = {
        ...state.reportMeta[date],
        ...(body.meta || body),
      };
      save();
      return result({ ok: true, meta: state.reportMeta[date] });
    }
    if (
      p === '/reports/dispatcher' ||
      p === '/reports/driver' ||
      p === '/reports/shift-person'
    )
      return result(report(q));
    if (p.includes('/reports/weekly'))
      return result({
        from: q.get('from') || plusDays(current(), -6),
        to: current(),
        days: Array.from({ length: 7 }, (_, i) =>
          report(new URLSearchParams({ date: plusDays(current(), i - 6) })),
        ),
        totals: stats(q),
        ...stats(q),
      });
    if (p.includes('/reports/dispatcher/salaries'))
      return result({
        rows: drivers.map((name) => ({
          name,
          driver: name,
          ...stats(q).byDriver[name],
        })),
        ...report(q),
      });
    const resources = {
      '/expenses': 'expenses',
      '/maintenance-journal': 'maintenance',
      '/order-runs': 'runs',
      '/partner-companies': 'partners',
      '/fuel-receipts': 'receipts',
      '/cash/txns': 'cashTxns',
      '/cash/hand-ins': 'handIns',
      '/cash/hand-status': 'handStatus',
      '/cash/odometer': 'odometer',
      '/cash/weeks': 'cashWeeks',
    };
    for (const [route, field] of Object.entries(resources)) {
      if (p !== route && !p.startsWith(route + '/')) continue;
      state[field] ||= [];
      if (method === 'GET')
        return result(
          field === 'maintenance'
            ? {
                items: clone(state[field]),
                active: clone(
                  state[field].filter((e) => e.status !== 'completed'),
                ),
              }
            : clone(
                state[field].filter(
                  (e) => field === 'partners' || matches(e, q),
                ),
              ),
        );
      const entryId = p.slice(route.length + 1) || body.id || q.get('id');
      if (method === 'DELETE') {
        state[field] = state[field].filter(
          (e) => String(e.id) !== String(entryId),
        );
        save();
        return result({ ok: true });
      }
      let entry = state[field].find((e) => String(e.id) === String(entryId));
      if (entry) Object.assign(entry, body);
      else {
        entry = { ...body, id: id(field), createdAt: now().toISOString() };
        state[field].push(entry);
      }
      save();
      return result({
        ok: true,
        item: entry,
        expense: entry,
        entry,
        txn: entry,
        handIn: entry,
        week: entry,
        status: entry,
        run: entry,
        record: entry,
        company: entry,
        id: entry.id,
      });
    }
    if (p === '/driver-line')
      return result({
        ok: true,
        driver: body.driver || q.get('driver') || drivers[0],
        status: body.action === 'leave' ? 'offline' : 'online',
        shiftDate: body.shiftDate || current(),
        shiftPeriod: 'day',
        vehicleId:
          body.vehicleId ||
          vehicles[
            Math.max(
              0,
              drivers.indexOf(body.driver || q.get('driver') || drivers[0]),
            )
          ].id,
        drivers: drivers.map((driver, i) => ({
          driver,
          vehicleId: vehicles[i].id,
          online: true,
          onLine: true,
        })),
        vehicles,
      });
    if (p.includes('odometer'))
      return result({
        ok: true,
        required: false,
        needsInput: false,
        odometer: 82400,
        value: 82400,
        last: 82400,
      });
    if (p === '/cash/summary') {
      const account = q.get('account') || 'main',
        income = { bank: 0, cash: 0, cashless: 0 },
        expense = { ...income },
        handIn = { ...income };
      for (const row of state.cashTxns.filter(
        (e) => matches(e, q) && (e.account || 'main') === account,
      )) {
        const ch = row.channel || 'cash';
        if (!(ch in income) || row.purposeCategory === 'driver_deal') continue;
        (row.direction === 'in' ? income : expense)[ch] += num(row.amount);
      }
      for (const row of (state.handIns || []).filter((e) => matches(e, q)))
        if (row.channel in handIn) handIn[row.channel] += num(row.amount);
      const balance = Object.fromEntries(
        Object.keys(income).map((ch) => [
          ch,
          income[ch] + handIn[ch] - expense[ch],
        ]),
      );
      const total = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
      return result({
        from: q.get('from'),
        to: q.get('to'),
        account,
        income,
        expense,
        handIn,
        balance,
        incomeTotal: total(income),
        expenseTotal: total(expense),
        handInTotal: total(handIn),
        balanceTotal: total(balance),
      });
    }
    if (p.startsWith('/cash/')) {
      if (method !== 'GET') {
        state.cashTxns.push({
          ...body,
          type: p.split('/').pop(),
          id: id('cash'),
          date: current(),
        });
        save();
      }
      return result(
        p.endsWith('/weeks') ||
          p.endsWith('/hand-ins') ||
          p.endsWith('/fuel-wallets')
          ? []
          : { ok: true, items: [], wallets: [], rows: [], total: 0 },
      );
    }
    if (p.startsWith('/telephony/') || p.startsWith('/call-events'))
      return result(
        p.endsWith('/calls') || p === '/call-events'
          ? []
          : {
              ok: false,
              demo: true,
              error: 'Телефония не подключена в учебной версии',
              items: [],
            },
      );
    if (p.startsWith('/geo/'))
      return result(
        p.endsWith('/suggest')
          ? { suggestions: [] }
          : {
              ok: false,
              error: 'Внешние карты не подключены в учебной версии',
            },
      );
    if (
      p.startsWith('/yandex/') ||
      p.startsWith('/avito/') ||
      p.startsWith('/push/') ||
      p.includes('receipt/check')
    )
      return result({
        ok: false,
        connected: false,
        configured: false,
        enabled: false,
        demo: true,
        accounts: [],
        orgs: [],
        items: [],
        error: 'Внешняя интеграция отключена в учебной версии',
      });
    return result(
      {
        ok: false,
        demo: true,
        error: 'Эта серверная операция не подключена в учебной версии',
      },
      501,
    );
  }
  return {
    request,
    getState: () => clone(state),
    reset: () => {
      state = seed(now());
      save();
    },
    getOrders: () => clone(state.orders.filter((o) => !o.deletedAt)),
  };
}
