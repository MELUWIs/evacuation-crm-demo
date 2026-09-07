'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ClipboardList,
  CirclePlus,
  Tag,
  Radio,
  CalendarDays,
  Wallet,
  Wrench,
  FileSpreadsheet,
  ChartColumn,
  Receipt,
  Phone,
  Gauge,
  Banknote,
  ChartPie,
  Handshake,
  Truck,
  Wifi,
  RefreshCw,
  Volume2,
  Moon,
  LogOut,
  Grid2X2,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  SquareParking,
  Trash2,
  X,
  Send,
  Download,
  ArrowUpRight,
  RotateCcw,
  Fuel,
  Archive,
  CircleHelp,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  applyAction,
  createSeed,
  readSaved,
  statusLabels,
  driverNames,
  money,
  summary,
  type State,
  type Action,
  type Order,
  type Role,
} from './model';
import { useDemoTools } from './webmcp';
const STORE = 'meluwi-evacuation-demo-v1';
const nav = [
  ['orders', 'Заявки', ClipboardList],
  ['create', 'Новая', CirclePlus],
  ['price', 'Прайс', Tag],
  ['line', 'Линия', Radio],
  ['schedule', 'График', CalendarDays],
  ['expenses', 'Расходы', Wallet],
  ['maintenance', 'Т.О.', Wrench],
  ['finance', 'Отчёт', FileSpreadsheet],
  ['week', 'Неделя', ChartColumn],
  ['details', 'Детализация', Receipt],
  ['calls', 'Звонки', Phone],
  ['mileage', 'Пробег', Gauge],
  ['cash', 'Касса', Banknote],
  ['dashboard', 'Дашборд', ChartPie],
  ['partners', 'Партнёрка', Handshake],
  ['telegram', 'Telegram', Send],
] as const;
type Page = (typeof nav)[number][0] | 'fleet' | 'more';
const desktopLabel = (id: Page) =>
  nav.find((n) => n[0] === id)?.[1] || (id === 'fleet' ? 'Парк' : 'Ещё');
function Choose({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => v !== null && onChange(v)}
      items={options}
    >
      <SelectTrigger className="tp-select" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Brand({ driver = false }: { driver?: boolean }) {
  return (
    <div className="tp-brand">
      <img src="/technoprime.png" alt="Технопрайм" width="40" height="40" />
      <div>
        {driver ? (
          <>
            ТЕХНО ПРАЙМ ·<small>кабинет</small>
          </>
        ) : (
          <>
            ТЕХНО<span>ПРАЙМ</span>
            <small>СЛУЖБА ЭВАКУАЦИИ</small>
          </>
        )}
      </div>
    </div>
  );
}
const stage = (o: Order) =>
  o.status === 'done'
    ? 'Завершён'
    : o.status === 'cancelled'
      ? 'Отменён'
      : 'В работе';
function OrderDocument({ order: o }: { order: Order }) {
  return (
    <div className="order-document">
      <div className="document-title">
        <strong>№ {String(o.id).padStart(4, '0')}</strong>
        <div>
          <span>
            ТИП <b>{o.partner ? 'Договорной' : 'Срочный'}</b>
          </span>
          <em>{stage(o)}</em>
        </div>
      </div>
      <div className="document-meta">
        <div>
          <small>СФОРМИРОВАНА</small>
          <b>07.09.2026 {o.time}</b>
        </div>
        <div>
          <small>ЗАВЕРШЕНА</small>
          <b>{o.status === 'done' ? '07.09.2026' : 'ещё нет'}</b>
        </div>
        <div>
          <small>ДИСПЕТЧЕР</small>
          <b>Диспетчер Demo</b>
          <span>Демонстрационная смена</span>
        </div>
      </div>
      <div className="document-route">
        <p>
          <b>А</b>
          {o.from}
        </p>
        <p>
          <b>Б</b>
          {o.to}
        </p>
      </div>
      <div className="telegram-text">
        <p>
          📌 Новый заказ 📌<br />
          Тип заказа: {o.partner ? 'Договорной' : 'Срочный'}
          <br />
          1) Имя клиента: {o.client}
          <br />
          2) Номер телефона: не указан · демо
          <br />
          3) Авто: {o.car}
          <br />
          4) Категория авто: Легковой транспорт
          <br />
          5) Гос. номер: ДЕМО
          <br />
          6) Дата: 07.09.2026
        </p>
        <p>Км по маршруту: {o.km}</p>
        <p>Начальная точка: {o.from}</p>
        <p>ДО: {o.to}</p>
        <p>
          Стоимость: {money(o.price)}
          <br />
          Оплата: {o.payment === 'cash' ? 'Наличные' : 'Перевод'}
          <br />
          Водитель: {o.driver || 'Не назначен'}
        </p>
      </div>
    </div>
  );
}
function Panel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`tp-panel ${className}`}>
      <h3>{title}</h3>
      <div className="panel-body">{children}</div>
    </section>
  );
}
export default function Home() {
  const [role, setRole] = useState<Role | null>(null),
    [pick, setPick] = useState<Role>('dispatcher'),
    [password, setPassword] = useState(''),
    [loginError, setLoginError] = useState('');
  const [state, setState] = useState<State>(createSeed),
    [ready, setReady] = useState(false),
    [page, setPage] = useState<Page>('orders'),
    [filter, setFilter] = useState('active'),
    [query, setQuery] = useState('');
  const [modal, setModal] = useState<'expense' | 'reset' | 'help' | null>(null),
    [selected, setSelected] = useState<number | null>(null),
    [notice, setNotice] = useState(''),
    [error, setError] = useState('');
  const [driver, setDriver] = useState(driverNames[0]),
    [distance, setDistance] = useState(''),
    [source, setSource] = useState(''),
    [kind, setKind] = useState('urgent');
  const [onLine, setOnLine] = useState(true),
    [notifications, setNotifications] = useState(false);
  const stateRef = useRef(state),
    roleRef = useRef(role);
  useEffect(() => {
    stateRef.current = state;
    roleRef.current = role;
  }, [state, role]);
  useEffect(() => {
    try {
      const loaded = readSaved(localStorage.getItem(STORE));
      setState(loaded);
      stateRef.current = loaded;
      const saved = sessionStorage.getItem('evacuation-demo-role');
      if (saved === 'dispatcher' || saved === 'driver') {
        setRole(saved);
        roleRef.current = saved;
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(STORE, JSON.stringify(state));
      } catch {
        setNotice('Изменения сохранятся до обновления страницы.');
      }
  }, [state, ready]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);
  useDemoTools(stateRef, roleRef, setPage, setSelected, setDriver, setDistance);
  function act(action: Action) {
    try {
      const next = applyAction(stateRef.current, action);
      stateRef.current = next;
      setState(next);
      setError('');
      setNotice(
        action.type === 'reset'
          ? 'Демоданные восстановлены'
          : next.events[0].text,
      );
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }
  function login(e: FormEvent) {
    e.preventDefault();
    if (password !== 'meluwi-demo') {
      setLoginError('Тестовый пароль: meluwi-demo');
      return;
    }
    setRole(pick);
    roleRef.current = pick;
    setPage('orders');
    setFilter('active');
    try {
      sessionStorage.setItem('evacuation-demo-role', pick);
    } catch {}
  }
  function logout() {
    setRole(null);
    roleRef.current = null;
    setSelected(null);
    setPage('orders');
    setError('');
    try {
      sessionStorage.removeItem('evacuation-demo-role');
    } catch {}
  }
  function go(p: Page) {
    setPage(p);
    setError('');
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function openOrder(o: Order) {
    setSelected(o.id);
    setDriver(o.driver || driverNames[0]);
    setDistance(String(o.km));
    setError('');
  }
  const totals = summary(state),
    visible = state.orders.filter(
      (o) => role !== 'driver' || o.driver === driverNames[0],
    );
  const isActive = (o: Order) => !['done', 'cancelled'].includes(o.status);
  function matches(o: Order, f: string) {
    if (f === 'all') return true;
    if (f === 'active') return isActive(o);
    if (f === 'partners') return o.partner;
    if (f === 'done-partner') return o.partner && o.status === 'done';
    if (f === 'done') return !o.partner && o.status === 'done';
    return o.status === f;
  }
  const filtered = visible.filter(
    (o) =>
      matches(o, filter) &&
      `${o.id} ${o.car} ${o.client} ${o.from} ${o.driver}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const order = visible.find((o) => o.id === selected);
  const filters =
    role === 'driver'
      ? [
          ['active', 'Все актуальные'],
          ['enroute', 'В работе'],
          ['scheduled', 'Запланир.'],
          ['approval', 'Согласование'],
          ['assigned', 'Новые'],
          ['done', 'Завершённые'],
        ]
      : [
          ['approval', 'Согласование'],
          ['scheduled', 'Запланир.'],
          ['active', 'В работе'],
          ['partners', 'Договорные'],
          ['pre-done', 'Предварительно завершённые'],
          ['done', 'Завершённые'],
          ['cancelled', 'Отменённые'],
          ['done-partner', 'Завершённые партнёры'],
          ['deleted', 'Удалённые'],
        ];
  function exportReport() {
    const quote = (s: unknown) =>
      `"${String(s)
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""')}"`;
    const csv =
      '\uFEFF' +
      [
        ['Заявка', 'Автомобиль', 'Водитель', 'Статус', 'Сумма', 'Км'],
        ...state.orders.map((o) => [
          o.id,
          o.car,
          o.driver,
          statusLabels[o.status],
          o.price,
          o.km,
        ]),
      ]
        .map((row) => row.map(quote).join(';'))
        .join('\r\n');
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evacuation-demo-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  function createOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!source) {
      setError('Выберите источник заявки.');
      return;
    }
    const data = new FormData(e.currentTarget);
    if (
      act({
        type: 'create',
        order: {
          client: String(data.get('client') || 'Клиент Demo'),
          car: String(data.get('car')),
          from: String(data.get('from')),
          to: String(data.get('to')),
          price: Number(data.get('price')),
          km: Number(data.get('km')),
          driver: '',
          payment: data.get('payment') === 'cash' ? 'cash' : 'card',
          partner: kind === 'partner',
        },
      })
    ) {
      go('orders');
      setFilter('active');
    }
  }
  if (!role)
    return (
      <main className="tp-login">
        <form onSubmit={login}>
          <Brand />
          <h1>Вход в CRM</h1>
          <p>Демонстрация на вымышленных данных</p>
          <Tabs value={pick} onValueChange={(v) => setPick(v as Role)}>
            <TabsList className="login-roles">
              <TabsTrigger value="dispatcher">Диспетчер</TabsTrigger>
              <TabsTrigger value="driver">Водитель</TabsTrigger>
            </TabsList>
          </Tabs>
          <label htmlFor="demo-password">Тестовый пароль</label>
          <Input
            id="demo-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="meluwi-demo"
            autoComplete="off"
          />
          <button
            type="button"
            className="password-hint"
            onClick={() => setPassword('meluwi-demo')}
          >
            Подставить пароль <code>meluwi-demo</code>
          </button>
          {loginError && (
            <p role="alert" className="error-text">
              {loginError}
            </p>
          )}
          <Button className="gold-button" disabled={!ready} type="submit">
            Войти как {pick === 'dispatcher' ? 'диспетчер' : 'водитель'}{' '}
            <ChevronRight />
          </Button>
          <small>
            Все изменения хранятся в этом браузере. Рабочая база и Telegram не
            подключены.
          </small>
          <a href="https://meluwi-portfolio.adapage1981.chatgpt.site/#projects">
            MELUWI · к портфолио <ArrowUpRight size={12} />
          </a>
        </form>
      </main>
    );
  return (
    <div className={`tp-app ${role === 'driver' ? 'driver-app' : ''}`}>
      {role === 'dispatcher' ? (
        <header className="tp-header">
          <div className="brand-row">
            <Brand />
            <button className="demo-badge" onClick={() => setModal('help')}>
              ДЕМО <CircleHelp size={12} />
            </button>
          </div>
          <nav className="desktop-nav" aria-label="Разделы CRM">
            {nav.map(([id, label, Icon]) => (
              <button
                key={id}
                className={page === id ? 'active' : ''}
                onClick={() => go(id)}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </nav>
          <div className="header-tools">
            <div className="mobile-logo">
              <Brand />
            </div>
            {page === 'orders' && (
              <label className="search-field">
                <Search size={14} />
                <Input
                  aria-label="Поиск заявок"
                  placeholder="Поиск заявок..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            )}
            {page === 'orders' && (
              <div className="role-tools">
                <button
                  className="tech-button"
                  onClick={() => go('maintenance')}
                >
                  Техника
                </button>
                <button
                  className="driver-button"
                  onClick={() => {
                    setPick('driver');
                    logout();
                  }}
                >
                  Драйвер
                </button>
              </div>
            )}
            <span className="connection" title="Демо работает локально">
              <Wifi size={15} />
            </span>
            <button
              aria-label="Обновить данные"
              onClick={() => {
                setState(readSaved(localStorage.getItem(STORE)));
                setNotice('Демо обновлено');
              }}
            >
              <RefreshCw size={15} />
            </button>
            <span className="tool-decoration">
              <Volume2 size={15} />
            </span>
            <span className="moon-decoration">
              <Moon size={16} />
            </span>
            <button
              className="desktop-only"
              aria-label="Автопарк"
              onClick={() => go('fleet')}
            >
              <SquareParking size={16} />
            </button>
            <button
              className="desktop-only"
              aria-label="Пробег техники"
              onClick={() => go('mileage')}
            >
              <Truck size={17} />
            </button>
            <button className="owner-pill" onClick={() => setModal('help')}>
              <Grid2X2 size={12} />
              Владелец · День
            </button>
            <button aria-label="Выйти из аккаунта" onClick={logout}>
              <LogOut size={15} />
            </button>
            <time className="desktop-only">14:32</time>
          </div>
        </header>
      ) : (
        <header className="driver-header">
          <div className="driver-top">
            <Brand driver />
            <button
              className={`line-button ${onLine ? 'on' : ''}`}
              onClick={() => setOnLine(!onLine)}
            >
              <LogOut size={13} />
              {onLine ? 'Уйти с линии' : 'На линию'}
            </button>
            <button
              className="notification-toggle"
              aria-label="Уведомления"
              onClick={() => go('telegram')}
            >
              <Bell size={17} />
            </button>
            <button
              aria-label="Обновить данные"
              onClick={() => setNotice('Заявки обновлены')}
            >
              <RefreshCw size={16} />
            </button>
            <button className="driver-menu" onClick={() => go('more')}>
              <ChevronDown size={15} />
              Меню
            </button>
          </div>
          <button className="driver-profile" onClick={() => setModal('help')}>
            <span>
              <UserRound size={23} />
            </span>
            <div>
              <b>Водитель 01</b>
              <small>День · 07.09.26 · до отчёта</small>
            </div>
            <ChevronDown size={20} />
          </button>
        </header>
      )}
      {error && !order && !modal && (
        <div className="page-error" role="alert">
          {error}
          <button aria-label="Закрыть ошибку" onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {page === 'orders' && (
        <main className="orders-layout">
          {role === 'dispatcher' && (
            <aside className="nearest">
              <h3>
                <Bell size={14} />
                БЛИЖАЙШИЕ
              </h3>
              <p>
                Запланированные выезды и звонки по согласованию появятся здесь
              </p>
            </aside>
          )}
          <section className="orders-column">
            {role === 'dispatcher' ? (
              <div className="shift-pill">Владелец · День · 2026-09-07</div>
            ) : (
              <>
                <div className="driver-notifications">
                  <div>
                    <b>
                      {notifications
                        ? 'Демо-уведомления включены'
                        : 'Браузерные уведомления выключены'}
                    </b>
                    <p>
                      {notifications
                        ? 'События отображаются внутри демонстрации'
                        : 'Новые заявки отображаются в этом кабинете'}
                    </p>
                  </div>
                  <button
                    className="gold-button"
                    onClick={() => {
                      setNotifications(!notifications);
                      setNotice(
                        notifications
                          ? 'Демо-уведомления выключены'
                          : 'Демо-уведомления включены',
                      );
                    }}
                  >
                    {notifications ? 'Выключить' : 'Разрешить'}
                  </button>
                </div>
                <div className="driver-push-note">
                  Push · Android APK · iPhone — Safari → «На экран Домой»
                </div>
              </>
            )}
            <div className="status-filters" aria-label="Статус заявок">
              {filters.map(([id, label]) => (
                <button
                  key={id}
                  className={filter === id ? 'active' : ''}
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {label}
                  <span>{visible.filter((o) => matches(o, id)).length}</span>
                </button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={25} />
                <strong>
                  {query ? 'Ничего не найдено' : 'Заявок в этом статусе нет'}
                </strong>
                <p>
                  {query
                    ? 'Попробуйте другой номер, автомобиль или водителя.'
                    : 'Переключитесь на активные заявки или создайте новую.'}
                </p>
                <button
                  onClick={() => {
                    setFilter('active');
                    setQuery('');
                  }}
                >
                  Показать активные
                </button>
              </div>
            ) : (
              filtered.map((o) =>
                role === 'driver' ? (
                  <article className="driver-order" key={o.id}>
                    <div className="driver-order-top">
                      <span>{stage(o).toUpperCase()}</span>
                      <small>#{o.id}</small>
                    </div>
                    <h3>📌 Новый заказ 📌</h3>
                    <p>
                      Откуда: {o.from}
                      <br />
                      Куда: {o.to}
                    </p>
                    <small>
                      {o.car} · {o.client}
                    </small>
                    <p className="assigned-driver">
                      Водитель: <b>{o.driver}</b>
                    </p>
                    <footer>
                      <time>7 сент. {o.time}</time>
                      <button onClick={() => openOrder(o)}>
                        ПОДРОБНЕЕ <ChevronRight size={13} />
                      </button>
                    </footer>
                  </article>
                ) : (
                  <article className="dispatch-order" key={o.id}>
                    <div className="order-card-heading">
                      <h3>📌 Новый заказ 📌</h3>
                      {isActive(o) && (
                        <button
                          aria-label={`Отменить заявку ${o.id}`}
                          onClick={() => openOrder(o)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <small className="order-time">
                      #{o.id} · 7 сент. {o.time}
                    </small>
                    <span className="urgent-label">
                      {o.partner ? 'ДОГОВОРНОЙ' : 'СРОЧНЫЙ'}
                    </span>
                    <OrderDocument order={o} />
                    <div className="order-bottom">
                      <span>
                        {o.driver || 'Водитель не назначен'} ·{' '}
                        {statusLabels[o.status]}
                      </span>
                      <Button
                        className="gold-button"
                        onClick={() => openOrder(o)}
                      >
                        Открыть заявку <ChevronRight size={14} />
                      </Button>
                    </div>
                  </article>
                ),
              )
            )}
          </section>
        </main>
      )}
      {page === 'create' && (
        <main className="create-wrap">
          <form className="create-form" onSubmit={createOrder}>
            <h1>НОВАЯ ЗАЯВКА</h1>
            <p>Телефон, источник и тип</p>
            <div className="create-fields">
              <label>
                ТЕЛЕФОН
                <Input disabled placeholder="Не используется в демо" />
              </label>
              <label>
                ИСТОЧНИК ЗАЯВКИ
                <Choose
                  value={source}
                  onChange={setSource}
                  label="Источник заявки"
                  options={[
                    { value: '', label: '— выберите источник —' },
                    { value: 'call', label: 'Входящий звонок' },
                    { value: 'site', label: 'Сайт' },
                    { value: 'partner', label: 'Партнёр' },
                  ]}
                />
              </label>
              <label>
                ТИП ЗАКАЗА
                <Choose
                  value={kind}
                  onChange={setKind}
                  label="Тип заказа"
                  options={[
                    { value: 'urgent', label: 'Срочный' },
                    { value: 'partner', label: 'Договорной' },
                  ]}
                />
              </label>
            </div>
            <div className="create-fields">
              <label>
                ИМЯ КЛИЕНТА
                <Input
                  name="client"
                  defaultValue="Клиент Demo"
                  maxLength={100}
                />
              </label>
              <label>
                АВТОМОБИЛЬ
                <Input
                  name="car"
                  required
                  placeholder="Например, седан · не заводится"
                  maxLength={150}
                />
              </label>
              <label>
                ОТКУДА
                <Input
                  name="from"
                  required
                  placeholder="Учебная точка А"
                  maxLength={150}
                />
              </label>
              <label>
                КУДА
                <Input
                  name="to"
                  required
                  placeholder="Учебная точка Б"
                  maxLength={150}
                />
              </label>
              <div className="form-pair">
                <label>
                  СТОИМОСТЬ, ₽
                  <Input
                    name="price"
                    type="number"
                    required
                    min={1}
                    max={1000000}
                    defaultValue={4500}
                  />
                </label>
                <label>
                  ПРОБЕГ, КМ
                  <Input
                    name="km"
                    type="number"
                    required
                    min={0}
                    max={10000}
                    defaultValue={18}
                  />
                </label>
              </div>
              <fieldset className="payment-choice">
                <legend>ОПЛАТА</legend>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    defaultChecked
                  />
                  Перевод
                </label>
                <label>
                  <input type="radio" name="payment" value="cash" />
                  Наличные
                </label>
              </fieldset>
            </div>
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <Button className="gold-button" type="submit">
              <CirclePlus />
              Создать заявку
            </Button>
          </form>
        </main>
      )}
      {['finance', 'week', 'details', 'cash', 'dashboard'].includes(page) && (
        <main className="report-page">
          <div className="page-heading">
            <div>
              <h1>
                {page === 'finance'
                  ? 'ОТЧЁТ ДИСПЕТЧЕРА'
                  : desktopLabel(page).toUpperCase()}
              </h1>
              <p>Касса по заявкам и расходам текущей демонстрационной смены</p>
            </div>
            <div className="heading-actions">
              <Button
                variant="outline"
                className="danger-button"
                onClick={() => act({ type: 'shift' })}
              >
                {state.shift ? 'Завершить смену' : 'Открыть смену'}
              </Button>
              <Button variant="outline" onClick={exportReport}>
                <Download />
                Скачать CSV
              </Button>
            </div>
          </div>
          <div className="report-frame">
            <div className="active-shift">
              <div>
                <small>
                  {state.shift ? 'АКТИВНАЯ СМЕНА' : 'СМЕНА ЗАКРЫТА'}
                </small>
                <h2>День · 2026-09-07</h2>
                <p>Диспетчер: Demo · 07:00–19:00</p>
              </div>
              <span>
                {state.shift ? 'В РАБОТЕ' : 'ЗАВЕРШЕНА'}{' '}
                <i>
                  заявок {state.orders.length} · открыто {totals.active}
                </i>
              </span>
            </div>
            <div className="report-columns">
              <div>
                <Panel title="Заказы · статус текущей смены">
                  <small className="muted-label">
                    ПРИНЯТЫЕ ЗАКАЗЫ ЗА ТЕКУЩУЮ СМЕНУ
                  </small>
                  <div className="report-stats">
                    {[
                      [
                        'ВЫПОЛНЕНО ТЕХНОПРАЙМ',
                        state.orders.filter(
                          (o) => o.status === 'done' && !o.partner,
                        ).length,
                        'green',
                      ],
                      [
                        'ВЫПОЛНЕНО · ПАРТНЁРЫ',
                        state.orders.filter(
                          (o) => o.status === 'done' && o.partner,
                        ).length,
                        'green',
                      ],
                      ['ЗАПЛАНИРОВАННЫЕ', 0, 'gold'],
                      ['В РАБОТЕ · ТЕХНОПРАЙМ', totals.active, 'gold'],
                      [
                        'ОТМЕНЁННЫЕ',
                        state.orders.filter((o) => o.status === 'cancelled')
                          .length,
                        'red',
                      ],
                      ['СОГЛАСОВАНИЕ', 0, 'gold'],
                    ].map(([label, value, color]) => (
                      <div key={label} className={String(color)}>
                        <small>{label}</small>
                        <b>{value}</b>
                        <i />
                      </div>
                    ))}
                  </div>
                </Panel>
                <Panel title="Деньги смены">
                  <div className="money-grid">
                    <div>
                      <small>ВЫРУЧКА</small>
                      <b>{money(totals.revenue)}</b>
                    </div>
                    <div>
                      <small>РАСХОДЫ</small>
                      <b>{money(totals.expenses)}</b>
                    </div>
                    <div>
                      <small>ПАРТНЁРСКИЕ</small>
                      <b>{money(totals.partners)}</b>
                    </div>
                  </div>
                  <div className="report-total">
                    <span>Остаток до зарплат и налогов</span>
                    <strong>{money(totals.balance)}</strong>
                  </div>
                  <div className="report-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ЗАЯВКА</th>
                          <th>ОПЛАТА</th>
                          <th>ПРОБЕГ</th>
                          <th>СУММА</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.orders
                          .filter((o) => o.status === 'done')
                          .map((o) => (
                            <tr key={o.id}>
                              <td>
                                <button onClick={() => openOrder(o)}>
                                  #{o.id}
                                </button>
                              </td>
                              <td>
                                {o.payment === 'cash' ? 'Наличные' : 'Перевод'}
                              </td>
                              <td>{o.km} км</td>
                              <td>{money(o.price)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </div>
              <div>
                <Panel title="Водители">
                  {state.vehicles.map((v) => (
                    <div className="report-driver" key={v.id}>
                      <h4>{v.driver}</h4>
                      <p>{v.name}</p>
                      <div>
                        <span>
                          ЗАКАЗЫ
                          <b>
                            {
                              state.orders.filter((o) => o.driver === v.driver)
                                .length
                            }
                          </b>
                        </span>
                        <span>
                          СДЕЛКИ
                          <b>
                            {money(
                              state.orders
                                .filter(
                                  (o) =>
                                    o.driver === v.driver &&
                                    o.status === 'done',
                                )
                                .reduce((sum, o) => sum + o.price, 0),
                            )}
                          </b>
                        </span>
                        <span>
                          КМ · А→Б
                          <b>
                            {state.orders
                              .filter(
                                (o) =>
                                  o.driver === v.driver && o.status === 'done',
                              )
                              .reduce((sum, o) => sum + o.km, 0)}{' '}
                            км
                          </b>
                        </span>
                      </div>
                    </div>
                  ))}
                </Panel>
                <Panel title="Диспетчеры">
                  <h4>Диспетчер Demo</h4>
                  <p className="muted">
                    Одна тестовая смена. Все показатели рассчитаны из заявок.
                  </p>
                </Panel>
              </div>
            </div>
          </div>
        </main>
      )}
      {['fleet', 'maintenance', 'mileage', 'line'].includes(page) && (
        <main className="fleet-page">
          <div className="fleet-intro">
            <span className="fleet-icon">
              {page === 'maintenance' ? <Wrench /> : <Truck />}
            </span>
            <div>
              <h1>
                {page === 'maintenance'
                  ? 'Техническое обслуживание'
                  : page === 'mileage'
                    ? 'Пробег техники'
                    : page === 'line'
                      ? 'Техника на линии'
                      : 'Автопарк'}
              </h1>
              <p>Состояние автопарка и история по каждой машине</p>
            </div>
            <div className="fleet-counts">
              <div>
                <small>ВСЕГО МАШИН</small>
                <b>{state.vehicles.length}</b>
              </div>
              <div>
                <small>БЛИЖАЙШЕЕ Т.О.</small>
                <b>
                  {Math.min(
                    ...state.vehicles.map((v) => v.serviceAt - v.odometer),
                  ).toLocaleString('ru')}{' '}
                  км
                </b>
              </div>
            </div>
          </div>
          <div className="fleet-caption">
            <h2>Машины</h2>
            <span>Пробег обновляется при завершении рейса</span>
          </div>
          {state.vehicles
            .filter((v) => role === 'dispatcher' || v.driver === driverNames[0])
            .map((v) => (
              <article
                key={v.id}
                className={`vehicle-card ${v.serviceAt - v.odometer < 1000 ? 'due' : ''}`}
              >
                <div>
                  <h3>
                    {v.name} · ДЕМО {v.id}
                  </h3>
                  <p>{v.driver}</p>
                  <span className="vehicle-status">
                    {v.serviceAt - v.odometer < 1000
                      ? 'СКОРО Т.О.'
                      : 'ИСПРАВНА'}
                  </span>
                </div>
                <div className="vehicle-numbers">
                  <span>
                    ПРОБЕГ<b>{v.odometer.toLocaleString('ru')} км</b>
                  </span>
                  <span>
                    ДО Т.О.
                    <b>{(v.serviceAt - v.odometer).toLocaleString('ru')} км</b>
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => act({ type: 'service', id: v.id })}
                >
                  <Wrench size={15} />
                  Отметить Т.О.
                </Button>
              </article>
            ))}
        </main>
      )}
      {page === 'expenses' && (
        <main className="module-page">
          <div className="page-heading">
            <h1>РАСХОДЫ</h1>
            <Button
              className="gold-button"
              onClick={() => {
                setError('');
                setModal('expense');
              }}
            >
              <CirclePlus />
              Добавить расход
            </Button>
          </div>
          <Panel title="Расходы текущей смены">
            {state.expenses.map((e) => (
              <div className="list-row" key={e.id}>
                <span>
                  <Fuel size={18} />
                  {e.title}
                </span>
                <b>{money(e.amount)}</b>
              </div>
            ))}
            <div className="report-total">
              Итого<strong>{money(totals.expenses)}</strong>
            </div>
          </Panel>
        </main>
      )}
      {page === 'partners' && (
        <main className="module-page">
          <div className="page-heading">
            <h1>ПАРТНЁРСКИЕ ЗАКАЗЫ</h1>
          </div>
          <Panel title="Договорные заявки">
            {state.orders
              .filter((o) => o.partner)
              .map((o) => (
                <button
                  className="list-row row-button"
                  key={o.id}
                  onClick={() => openOrder(o)}
                >
                  <span>
                    #{o.id} · {o.car}
                    <small>{stage(o)}</small>
                  </span>
                  <b>
                    {money(o.price)} <ChevronRight size={15} />
                  </b>
                </button>
              ))}
            <div className="report-total">
              Партнёрские отчисления · 15% завершённых
              <strong>{money(totals.partners)}</strong>
            </div>
          </Panel>
        </main>
      )}
      {page === 'telegram' && (
        <main className="module-page telegram-page">
          <div className="page-heading">
            <div>
              <h1>TELEGRAM · СОБЫТИЯ СМЕНЫ</h1>
              <p>Локальная имитация отправки в темы рабочего чата</p>
            </div>
            <Send />
          </div>
          <div className="telegram-layout">
            <aside>
              <b>Технопрайм · Демо</b>
              {(['Заявки', 'Смена', 'Автопарк'] as const).map((t) => (
                <div key={t}>
                  # {t}
                  <span>
                    {state.events.filter((e) => e.topic === t).length}
                  </span>
                </div>
              ))}
            </aside>
            <div className="event-feed">
              {state.events.map((e) => (
                <article key={e.id}>
                  <small># {e.topic}</small>
                  <b>Технопрайм · CRM</b>
                  <p>{e.text}</p>
                  <time>{e.time} ✓✓</time>
                </article>
              ))}
              <p className="muted">
                Создайте заявку или завершите рейс — здесь появится новое
                событие.
              </p>
            </div>
          </div>
        </main>
      )}
      {page === 'price' && (
        <main className="module-page">
          <div className="page-heading">
            <div>
              <h1>ПРАЙС</h1>
              <p>Пример тарифов для демонстрационной смены</p>
            </div>
          </div>
          <Panel title="Тестовые тарифы">
            {[
              ['Легковой автомобиль', 'от 3 500 ₽'],
              ['Кроссовер', 'от 4 500 ₽'],
              ['Минивэн', 'от 5 500 ₽'],
              ['Заблокированное колесо', '+ 500 ₽'],
            ].map(([n, p]) => (
              <div className="list-row" key={n}>
                <span>{n}</span>
                <b>{p}</b>
              </div>
            ))}
          </Panel>
        </main>
      )}
      {page === 'schedule' && (
        <main className="module-page">
          <div className="page-heading">
            <h1>ГРАФИК · 07.09.2026</h1>
          </div>
          <Panel title="Дневная смена · 07:00–19:00">
            <div className="list-row">
              <span>Диспетчер Demo</span>
              <b>{state.shift ? 'На смене' : 'Смена закрыта'}</b>
            </div>
            {driverNames.map((d) => (
              <div className="list-row" key={d}>
                <span>{d}</span>
                <b>{state.vehicles.find((v) => v.driver === d)?.name}</b>
              </div>
            ))}
          </Panel>
        </main>
      )}
      {page === 'calls' && (
        <main className="module-page">
          <div className="page-heading">
            <h1>ЗВОНКИ</h1>
          </div>
          <Panel title="Демонстрационный журнал">
            {state.orders.slice(0, 3).map((o) => (
              <button
                className="list-row row-button"
                onClick={() => openOrder(o)}
                key={o.id}
              >
                <span>
                  <Phone size={17} />
                  {o.client}
                  <small>Входящий · {o.time} · номер скрыт</small>
                </span>
                <b>
                  Заявка #{o.id}
                  <ChevronRight size={15} />
                </b>
              </button>
            ))}
          </Panel>
        </main>
      )}
      {page === 'more' && (
        <main className="module-page">
          <div className="page-heading">
            <h1>МЕНЮ</h1>
          </div>
          <div className="more-grid">
            {nav
              .filter(
                (n) =>
                  role === 'dispatcher' || ['price', 'telegram'].includes(n[0]),
              )
              .map(([id, label, Icon]) => (
                <button key={id} onClick={() => go(id)}>
                  <Icon size={19} />
                  {label}
                  <ChevronRight size={15} />
                </button>
              ))}
            <button onClick={() => setModal('help')}>
              <CircleHelp size={19} />О демоверсии
              <ChevronRight size={15} />
            </button>
            <button onClick={() => setModal('reset')}>
              <RotateCcw size={19} />
              Сбросить демо
            </button>
            <button onClick={logout}>
              <LogOut size={19} />
              Сменить роль
            </button>
          </div>
        </main>
      )}
      <nav className="mobile-nav" aria-label="Мобильная навигация">
        {(role === 'dispatcher'
          ? [
              ['orders', 'Заявки', ClipboardList],
              ['create', 'Новая', CirclePlus],
              ['calls', 'Звонки', Phone],
              ['fleet', 'Парк', SquareParking],
              ['finance', 'Отчёт', FileSpreadsheet],
              ['partners', 'Партнёрка', Handshake],
              ['more', 'Ещё', MoreHorizontal],
            ]
          : [
              ['orders', 'Заявки', ClipboardList],
              ['schedule', 'График', CalendarDays],
              ['expenses', 'Топливо', Fuel],
              ['cash', 'Сдать кассу', Banknote],
              ['fleet', 'Парк', Truck],
              ['price', 'Прайс', Tag],
              ['more', 'Меню', Archive],
            ]
        ).map(([id, label, Icon]) => {
          const NavIcon = Icon as typeof Truck;
          return (
            <button
              key={String(id)}
              className={page === id ? 'active' : ''}
              onClick={() => go(id as Page)}
            >
              <NavIcon size={19} />
              <span>{String(label)}</span>
            </button>
          );
        })}
      </nav>
      <div className="desktop-demo-footer">
        <span>Демонстрация · вымышленные данные</span>
        <button onClick={() => setModal('reset')}>Сбросить демо</button>
        <a
          href="https://github.com/MELUWIs/evacuation-crm-demo"
          target="_blank"
          rel="noreferrer"
        >
          MELUWI · исходный код ↗
        </a>
      </div>
      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button
            aria-label="Закрыть уведомление"
            onClick={() => setNotice('')}
          >
            <X size={15} />
          </button>
        </div>
      )}
      <Dialog
        open={!!order}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setError('');
          }
        }}
      >
        <DialogContent className="order-dialog" showCloseButton={false}>
          <div className="dialog-top">
            <DialogTitle>Заявка #{order?.id}</DialogTitle>
            <DialogClose aria-label="Закрыть заявку">
              <X size={19} />
            </DialogClose>
          </div>
          <DialogDescription className="sr-only">
            Маршрут, водитель и управление статусом заявки
          </DialogDescription>
          {order && (
            <>
              <div className="order-dialog-scroll">
                <OrderDocument order={order} />
              </div>
              <div className="order-controls">
                {error && (
                  <p role="alert" className="error-text">
                    {error}
                  </p>
                )}
                {isActive(order) ? (
                  <>
                    {role === 'dispatcher' && (
                      <div className="assign-row">
                        <Choose
                          value={driver}
                          onChange={setDriver}
                          label="Водитель заявки"
                          options={driverNames.map((d) => ({
                            value: d,
                            label: d,
                          }))}
                        />
                        <Button
                          variant="outline"
                          onClick={() =>
                            act({ type: 'assign', id: order.id, driver })
                          }
                        >
                          Назначить
                        </Button>
                      </div>
                    )}
                    {order.status === 'enroute' && (
                      <label className="distance-label">
                        Фактический пробег, км
                        <Input
                          aria-label="Фактический пробег"
                          type="number"
                          min={0}
                          max={10000}
                          value={distance}
                          onChange={(e) => setDistance(e.target.value)}
                        />
                      </label>
                    )}
                    <div className="order-control-buttons">
                      {role === 'dispatcher' && (
                        <Button
                          variant="outline"
                          className="danger-button"
                          onClick={() => act({ type: 'cancel', id: order.id })}
                        >
                          Отменить заявку
                        </Button>
                      )}
                      <Button
                        className="gold-button"
                        disabled={order.status === 'new'}
                        onClick={() =>
                          act({
                            type: 'advance',
                            id: order.id,
                            km:
                              order.status === 'enroute'
                                ? Number(distance)
                                : undefined,
                          })
                        }
                      >
                        {order.status === 'enroute'
                          ? 'Завершить рейс'
                          : order.status === 'new'
                            ? 'Назначьте водителя'
                            : 'Начать рейс'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="closed-order">
                    {order.status === 'done'
                      ? 'Заказ завершён. Пробег учтён, выручка добавлена в отчёт.'
                      : 'Заявка отменена.'}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
            setError('');
          }
        }}
      >
        <DialogContent className="utility-dialog">
          <DialogTitle>
            {modal === 'expense'
              ? 'Добавить расход'
              : modal === 'reset'
                ? 'Сбросить демоверсию?'
                : 'Технопрайм · демонстрация'}
          </DialogTitle>
          <DialogDescription>
            {modal === 'expense'
              ? 'Расход попадёт в отчёт текущей смены.'
              : modal === 'reset'
                ? 'Тестовая смена вернётся к начальному состоянию.'
                : 'Интерфейс диспетчерской и кабинета водителя на вымышленных данных.'}
          </DialogDescription>
          {modal === 'expense' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                if (
                  act({
                    type: 'expense',
                    title: String(d.get('title')),
                    amount: Number(d.get('amount')),
                  })
                )
                  setModal(null);
              }}
            >
              <label>
                Описание
                <Input
                  name="title"
                  required
                  maxLength={150}
                  placeholder="Топливо · эвакуатор 01"
                />
              </label>
              <label>
                Сумма, ₽
                <Input
                  name="amount"
                  type="number"
                  min={1}
                  max={1000000}
                  required
                />
              </label>
              {error && (
                <p role="alert" className="error-text">
                  {error}
                </p>
              )}
              <Button type="submit" className="gold-button">
                Добавить расход
              </Button>
            </form>
          )}
          {modal === 'reset' && (
            <Button
              className="gold-button"
              onClick={() => {
                act({ type: 'reset' });
                setModal(null);
                setFilter('active');
                go('orders');
              }}
            >
              Восстановить демоданные
            </Button>
          )}
          {modal === 'help' && (
            <div className="help-content">
              <p>
                В демо можно создать заявку, назначить водителя, провести рейс,
                учесть пробег и посмотреть отчёт.
              </p>
              <p>
                Сценарии работают локально в браузере. Отправка в Telegram
                имитируется; реальные звонки, рабочая база и APK не подключены.
              </p>
              <code>Тестовый пароль: meluwi-demo</code>
              <Button
                className="gold-button"
                onClick={() => {
                  setModal(null);
                  logout();
                  setPick(role === 'dispatcher' ? 'driver' : 'dispatcher');
                }}
              >
                Сменить роль
              </Button>
              <button
                className="password-hint"
                onClick={() => setModal('reset')}
              >
                Сбросить демоданные
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
