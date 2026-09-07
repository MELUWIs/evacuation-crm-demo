export type Status = 'new' | 'assigned' | 'enroute' | 'done' | 'cancelled';
export type Role = 'dispatcher' | 'driver';
export type Order = {
  id: number;
  client: string;
  car: string;
  from: string;
  to: string;
  price: number;
  km: number;
  driver: string;
  status: Status;
  payment: 'card' | 'cash';
  partner: boolean;
  time: string;
};
export type Expense = { id: number; title: string; amount: number };
export type Vehicle = {
  id: string;
  name: string;
  driver: string;
  odometer: number;
  serviceAt: number;
};
export type Event = {
  id: number;
  text: string;
  time: string;
  topic: 'Заявки' | 'Смена' | 'Автопарк';
};
export type State = {
  version: 1;
  orders: Order[];
  expenses: Expense[];
  vehicles: Vehicle[];
  events: Event[];
  shift: boolean;
};
export const statusLabels: Record<Status, string> = {
  new: 'Новая',
  assigned: 'Назначен',
  enroute: 'В пути',
  done: 'Завершена',
  cancelled: 'Отменена',
};
export const driverNames = ['Водитель 01', 'Водитель 02', 'Водитель 03'];
export const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value) +
  ' ₽';
export function createSeed(): State {
  return {
    version: 1,
    shift: true,
    orders: [
      {
        id: 1048,
        client: 'Клиент 01',
        car: 'Седан · не заводится',
        from: 'Демо-район Северный, точка А',
        to: 'Демо-сервис «Мотор», точка Б',
        price: 4500,
        km: 18,
        driver: '',
        status: 'new',
        payment: 'card',
        partner: false,
        time: '14:32',
      },
      {
        id: 1047,
        client: 'Клиент 02',
        car: 'Кроссовер · заблокировано колесо',
        from: 'Учебный маршрут, точка С',
        to: 'Демо-парковка, точка D',
        price: 6800,
        km: 26,
        driver: 'Водитель 01',
        status: 'enroute',
        payment: 'cash',
        partner: false,
        time: '14:10',
      },
      {
        id: 1046,
        client: 'Клиент 03',
        car: 'Хетчбэк · перевозка',
        from: 'Демо-район Центральный',
        to: 'Демо-сервис «Вектор»',
        price: 3900,
        km: 12,
        driver: 'Водитель 02',
        status: 'assigned',
        payment: 'card',
        partner: true,
        time: '13:55',
      },
      {
        id: 1045,
        client: 'Клиент 04',
        car: 'Седан · неисправность',
        from: 'Демо-точка Е',
        to: 'Демо-точка F',
        price: 5200,
        km: 21,
        driver: 'Водитель 01',
        status: 'done',
        payment: 'card',
        partner: false,
        time: '12:40',
      },
      {
        id: 1044,
        client: 'Клиент 05',
        car: 'Минивэн · перевозка',
        from: 'Демо-точка G',
        to: 'Демо-точка H',
        price: 7600,
        km: 34,
        driver: 'Водитель 03',
        status: 'done',
        payment: 'cash',
        partner: false,
        time: '11:20',
      },
      {
        id: 1043,
        client: 'Клиент 06',
        car: 'Купе · перевозка',
        from: 'Демо-точка I',
        to: 'Демо-точка J',
        price: 4100,
        km: 16,
        driver: 'Водитель 02',
        status: 'done',
        payment: 'card',
        partner: true,
        time: '10:15',
      },
    ],
    expenses: [
      { id: 1, title: 'Топливо · эвакуатор 01', amount: 1800 },
      { id: 2, title: 'Мойка · эвакуатор 03', amount: 500 },
    ],
    vehicles: [
      {
        id: '01',
        name: 'Эвакуатор 01',
        driver: 'Водитель 01',
        odometer: 82410,
        serviceAt: 85000,
      },
      {
        id: '02',
        name: 'Эвакуатор 02',
        driver: 'Водитель 02',
        odometer: 119720,
        serviceAt: 120000,
      },
      {
        id: '03',
        name: 'Эвакуатор 03',
        driver: 'Водитель 03',
        odometer: 45800,
        serviceAt: 50000,
      },
    ],
    events: [
      {
        id: 2,
        text: 'Заявка #1047: водитель 01 выехал на маршрут.',
        topic: 'Заявки',
        time: '14:12',
      },
      {
        id: 1,
        text: 'Диспетчер Demo открыл смену. Три машины на линии.',
        topic: 'Смена',
        time: '09:00',
      },
    ],
  };
}
export type Action =
  | { type: 'create'; order: Omit<Order, 'id' | 'time' | 'status'> }
  | { type: 'assign'; id: number; driver: string }
  | { type: 'advance'; id: number; km?: number }
  | { type: 'cancel'; id: number }
  | { type: 'expense'; title: string; amount: number }
  | { type: 'service'; id: string }
  | { type: 'shift' }
  | { type: 'reset' };
function positive(n: number, max = 1000000) {
  return Number.isFinite(n) && n >= 0 && n <= max;
}
function clean(s: string) {
  return s.trim().slice(0, 150);
}
export function applyAction(state: State, action: Action): State {
  if (action.type === 'reset') return createSeed();
  let next: State = {
    ...state,
    orders: [...state.orders],
    vehicles: [...state.vehicles],
    expenses: [...state.expenses],
  };
  let text = '';
  let topic: Event['topic'] = 'Заявки';
  const now = new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (action.type === 'create') {
    const o = action.order;
    if (!state.shift) throw Error('Сначала откройте смену.');
    if (
      !clean(o.car) ||
      !clean(o.from) ||
      !clean(o.to) ||
      !positive(o.price) ||
      o.price < 1 ||
      !positive(o.km, 2000) ||
      !['cash', 'card'].includes(o.payment) ||
      (o.driver && !driverNames.includes(o.driver))
    )
      throw Error('Проверьте маршрут, стоимость и пробег.');
    const id = Math.max(1048, ...state.orders.map((o) => o.id)) + 1;
    next.orders.unshift({
      ...o,
      client: clean(o.client) || 'Демо-клиент',
      car: clean(o.car),
      from: clean(o.from),
      to: clean(o.to),
      id,
      time: now,
      status: o.driver ? 'assigned' : 'new',
    });
    text = `Создана заявка #${id}: ${clean(o.car)}. ${money(o.price)}.`;
  } else if (
    action.type === 'assign' ||
    action.type === 'advance' ||
    action.type === 'cancel'
  ) {
    const order = state.orders.find((o) => o.id === action.id);
    if (!order) throw Error('Заявка не найдена.');
    if (!state.shift) throw Error('Смена закрыта. Откройте новую смену.');
    if (['done', 'cancelled'].includes(order.status))
      throw Error('Заявка уже закрыта.');
    let updated = { ...order };
    if (action.type === 'assign') {
      if (!driverNames.includes(action.driver))
        throw Error('Выберите водителя.');
      updated.driver = action.driver;
      updated.status = 'assigned';
      text = `Заявка #${order.id}: назначен ${action.driver.toLowerCase()}.`;
    }
    if (action.type === 'cancel') {
      updated.status = 'cancelled';
      text = `Заявка #${order.id} отменена.`;
    }
    if (action.type === 'advance') {
      if (!order.driver) throw Error('Сначала назначьте водителя.');
      if (order.status === 'assigned') {
        updated.status = 'enroute';
        text = `Заявка #${order.id}: водитель выехал.`;
      } else if (order.status === 'enroute') {
        const km = action.km ?? order.km;
        if (!positive(km, 2000) || km < 1)
          throw Error('Пробег должен быть от 1 до 2000 км.');
        updated.km = km;
        updated.status = 'done';
        next.vehicles = state.vehicles.map((v) =>
          v.driver === order.driver ? { ...v, odometer: v.odometer + km } : v,
        );
        text = `Заявка #${order.id} завершена. ${money(order.price)} · ${km} км. Пробег записан.`;
      } else throw Error('Сначала назначьте водителя.');
    }
    next.orders = state.orders.map((o) => (o.id === order.id ? updated : o));
  } else if (action.type === 'expense') {
    if (!state.shift) throw Error('Смена закрыта.');
    if (!clean(action.title) || !positive(action.amount) || action.amount < 1)
      throw Error('Введите название и сумму расхода.');
    next.expenses = [
      {
        id: Math.max(0, ...state.expenses.map((e) => e.id)) + 1,
        title: clean(action.title),
        amount: action.amount,
      },
      ...state.expenses,
    ];
    text = `Расход: ${clean(action.title)} · ${money(action.amount)}.`;
    topic = 'Смена';
  } else if (action.type === 'service') {
    const v = state.vehicles.find((v) => v.id === action.id);
    if (!v) throw Error('Машина не найдена.');
    next.vehicles = state.vehicles.map((v) =>
      v.id === action.id ? { ...v, serviceAt: v.odometer + 10000 } : v,
    );
    text = `${v.name}: ТО выполнено. Следующее через 10 000 км.`;
    topic = 'Автопарк';
  } else if (action.type === 'shift') {
    if (
      state.shift &&
      state.orders.some((o) =>
        ['new', 'assigned', 'enroute'].includes(o.status),
      )
    )
      throw Error(
        'Завершите или отмените активные заявки перед закрытием смены.',
      );
    next.shift = !state.shift;
    text = next.shift
      ? 'Демо-смена открыта.'
      : `Смена закрыта. Выручка: ${money(summary(state).revenue)}.`;
    topic = 'Смена';
  }
  next.events = [
    {
      id: Math.max(0, ...state.events.map((e) => e.id)) + 1,
      text,
      topic,
      time: now,
    },
    ...state.events,
  ].slice(0, 100);
  return next;
}
export function summary(s: State) {
  const done = s.orders.filter((o) => o.status === 'done');
  const revenue = done.reduce((a, o) => a + o.price, 0);
  const expenses = s.expenses.reduce((a, e) => a + e.amount, 0);
  const partners = done
    .filter((o) => o.partner)
    .reduce((a, o) => a + Math.round(o.price * 0.15), 0);
  return {
    revenue,
    expenses,
    partners,
    balance: revenue - expenses - partners,
    km: done.reduce((a, o) => a + o.km, 0),
    done: done.length,
    active: s.orders.filter((o) => !['done', 'cancelled'].includes(o.status))
      .length,
  };
}
export function readSaved(raw: string | null): State {
  if (!raw) return createSeed();
  try {
    const s = JSON.parse(raw);
    if (
      s.version !== 1 ||
      !Array.isArray(s.orders) ||
      !Array.isArray(s.vehicles) ||
      !Array.isArray(s.expenses) ||
      !Array.isArray(s.events) ||
      typeof s.shift !== 'boolean'
    )
      return createSeed();
    if (
      !s.orders.every(
        (o: Order) =>
          Number.isInteger(o.id) &&
          o.status in statusLabels &&
          ['client', 'car', 'from', 'to', 'driver', 'time'].every(
            (k) => typeof o[k as keyof Order] === 'string',
          ) &&
          positive(o.price) &&
          positive(o.km, 2000),
      ) ||
      !s.vehicles.every(
        (v: Vehicle) =>
          typeof v.name === 'string' &&
          typeof v.driver === 'string' &&
          positive(v.odometer) &&
          positive(v.serviceAt),
      ) ||
      !s.expenses.every(
        (e: Expense) => typeof e.title === 'string' && positive(e.amount),
      ) ||
      !s.events.every(
        (e: Event) => typeof e.text === 'string' && typeof e.time === 'string',
      )
    )
      return createSeed();
    return s;
  } catch {
    return createSeed();
  }
}
