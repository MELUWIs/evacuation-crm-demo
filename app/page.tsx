'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Truck,
  ArrowUpRight,
  Radio,
  Route,
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  Wallet,
  Gauge,
  Send,
  Plus,
  Search,
  ArrowRight,
  CircleCheck,
  ArrowDownLeft,
  LogOut,
  RotateCcw,
  Download,
  CircleHelp,
  Timer,
  MapPin,
  Wrench,
  X,
  Smartphone,
  ChevronRight,
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
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarTrigger,
} from '@/components/ui/sidebar';
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
  type Status,
} from './model';
const STORE = 'meluwi-evacuation-demo-v1';
type Page = 'overview' | 'orders' | 'fleet' | 'finance' | 'telegram';
const pages = [
  { id: 'overview' as Page, label: 'Обзор смены', icon: LayoutDashboard },
  { id: 'orders' as Page, label: 'Заявки', icon: ClipboardList },
  { id: 'fleet' as Page, label: 'Автопарк', icon: Truck },
  { id: 'finance' as Page, label: 'Финансы', icon: Wallet },
  { id: 'telegram' as Page, label: 'Telegram', icon: Send },
];
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
      <SelectTrigger aria-label={label} className="choose">
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
function Badge({ status }: { status: Status }) {
  return (
    <span className={`status status-${status}`}>
      <i />
      {statusLabels[status]}
    </span>
  );
}
function Navigation({
  page,
  setPage,
  role,
  onExit,
  onReset,
}: {
  page: Page;
  setPage: (p: Page) => void;
  role: Role;
  onExit: () => void;
  onReset: () => void;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar>
      <SidebarHeader className="nav-brand">
        <Truck />
        <div>
          ЭВАКУАЦИЯ<small>CRM / ДЕМОВЕРСИЯ</small>
        </div>
      </SidebarHeader>
      <SidebarContent className="side-content">
        <p className="nav-section">РАБОЧЕЕ ПРОСТРАНСТВО</p>
        <SidebarMenu>
          {pages
            .filter(
              (p) =>
                role === 'dispatcher' ||
                ['overview', 'orders', 'fleet'].includes(p.id),
            )
            .map((p) => (
              <SidebarMenuItem key={p.id}>
                <SidebarMenuButton
                  className="side-link"
                  isActive={page === p.id}
                  onClick={() => {
                    setPage(p.id);
                    setOpenMobile(false);
                  }}
                >
                  <p.icon />
                  <span>{p.label}</span>
                  {page === p.id && <ChevronRight className="nav-chevron" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
        <div className="sidebar-tip">
          <Radio />
          <strong>Попробуйте полный рейс</strong>
          <p>Назначьте водителя → начните поездку → завершите заказ.</p>
          <span>Пробег и отчёт обновятся сами.</span>
        </div>
      </SidebarContent>
      <SidebarFooter className="sidebar-foot">
        <a
          href="https://meluwi-portfolio.adapage1981.chatgpt.site/projects/evacuation"
          target="_blank"
          rel="noreferrer"
        >
          Кейс проекта <ArrowUpRight size={15} />
        </a>
        <Button variant="ghost" onClick={onReset}>
          <RotateCcw /> Сбросить демо
        </Button>
        <Button variant="ghost" onClick={onExit}>
          <LogOut /> Сменить роль
        </Button>
        <div className="author">
          Разработано{' '}
          <a
            href="https://github.com/MELUWIs/evacuation-crm-demo"
            target="_blank"
            rel="noreferrer"
          >
            MELUWI ↗
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [pick, setPick] = useState<Role>('dispatcher');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [state, setState] = useState<State>(createSeed);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState<Page>('overview');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<
    'create' | 'expense' | 'reset' | 'help' | null
  >(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [driver, setDriver] = useState(driverNames[0]);
  const [distance, setDistance] = useState('');
  const stateRef = useRef(state);
  stateRef.current = state;
  const roleRef = useRef(role);
  roleRef.current = role;
  useEffect(() => {
    try {
      setState(readSaved(localStorage.getItem(STORE)));
      const saved = sessionStorage.getItem('evacuation-demo-role');
      if (saved === 'dispatcher' || saved === 'driver') setRole(saved);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(STORE, JSON.stringify(state));
      } catch {
        setNotice(
          'Хранилище недоступно. Изменения сохранятся до обновления страницы.',
        );
      }
  }, [state, ready]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
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
  useEffect(() => {
    type Context = {
      registerTool: (
        tool: unknown,
        options: { signal: AbortSignal },
      ) => void | Promise<void>;
    };
    const ctx = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!ctx) return;
    const lifecycle = new AbortController();
    const tools = [
      {
        name: 'get_demo_orders',
        description:
          'Read the synthetic evacuation orders visible to the currently selected demo role.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: () => {
          if (!roleRef.current) throw Error('Choose a demo role first.');
          return stateRef.current.orders.filter(
            (o) =>
              roleRef.current === 'dispatcher' || o.driver === driverNames[0],
          );
        },
      },
      {
        name: 'open_demo_order',
        description:
          'Navigate to an existing demo order detail. This does not change the order.',
        inputSchema: {
          type: 'object',
          properties: { id: { type: 'integer' } },
          required: ['id'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: (input: unknown) => {
          const id = (input as { id?: number })?.id;
          const o = stateRef.current.orders.find((o) => o.id === id);
          if (
            !roleRef.current ||
            !o ||
            (roleRef.current === 'driver' && o.driver !== driverNames[0])
          )
            throw Error('Order unavailable.');
          setPage('orders');
          setSelected(o.id);
          setDriver(o.driver || driverNames[0]);
          setDistance(String(o.km));
          return { id: o.id, opened: true };
        },
      },
    ];
    for (const tool of tools)
      try {
        void Promise.resolve(
          ctx.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    return () => lifecycle.abort();
  }, []);
  function login(e: FormEvent) {
    e.preventDefault();
    if (password !== 'meluwi-demo') {
      setLoginError('Тестовый пароль: meluwi-demo');
      return;
    }
    setRole(pick);
    setPage('overview');
    try {
      sessionStorage.setItem('evacuation-demo-role', pick);
    } catch {}
  }
  function logout() {
    setRole(null);
    setPage('overview');
    setSelected(null);
    try {
      sessionStorage.removeItem('evacuation-demo-role');
    } catch {}
  }
  function openOrder(o: Order) {
    setSelected(o.id);
    setDriver(o.driver || driverNames[0]);
    setDistance(String(o.km));
    setError('');
  }
  const totals = summary(state);
  const visible = state.orders.filter(
    (o) => role !== 'driver' || o.driver === driverNames[0],
  );
  const active = visible.filter(
    (o) => !['done', 'cancelled'].includes(o.status),
  );
  const order = visible.find((o) => o.id === selected);
  const filtered = visible.filter(
    (o) =>
      (filter === 'all' || o.status === filter) &&
      `${o.id} ${o.car} ${o.client} ${o.from} ${o.driver}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function openModal(m: typeof modal) {
    setError('');
    setModal(m);
  }
  if (!role)
    return (
      <main className="demo-entry">
        <div className="entry-brand">
          <Truck /> ЭВАКУАЦИЯ <span>CRM / DEMO</span>
        </div>
        <section className="entry-grid">
          <div>
            <p className="overline">
              ПРОЕКТ MELUWI · ОКОЛО 1,5 МЕСЯЦЕВ РАЗРАБОТКИ
            </p>
            <h1>
              Вся смена.
              <br />В одном
              <br />
              <em>интерфейсе.</em>
            </h1>
            <p className="entry-lead">
              От первого звонка до закрытого заказа.
              <br />
              Рабочее пространство службы эвакуации.
            </p>
            <div className="entry-features">
              <span>
                <Radio /> Диспетчерская
              </span>
              <span>
                <Route /> Водители и пробег
              </span>
              <span>
                <Smartphone /> Мобильный интерфейс
              </span>
            </div>
          </div>
          <form className="entry-card" onSubmit={login}>
            <div className="entry-card-top">
              <ShieldCheck />
              <span>ИНТЕРАКТИВНАЯ ДЕМОНСТРАЦИЯ</span>
            </div>
            <h2>Сядьте за пульт.</h2>
            <p>Выберите роль и попробуйте рабочую смену.</p>
            <Tabs value={pick} onValueChange={(v) => setPick(v as Role)}>
              <TabsList className="role-tabs">
                <TabsTrigger value="dispatcher">
                  <Radio /> Диспетчер
                </TabsTrigger>
                <TabsTrigger value="driver">
                  <Truck /> Водитель
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <label className="field-label" htmlFor="demo-password">
              Тестовый пароль
            </label>
            <Input
              id="demo-password"
              value={password}
              type="text"
              autoComplete="off"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="meluwi-demo"
            />
            <button
              className="password-hint"
              type="button"
              onClick={() => setPassword('meluwi-demo')}
            >
              Подставить пароль <code>meluwi-demo</code> ↗
            </button>
            {loginError && (
              <p role="alert" className="error-text">
                {loginError}
              </p>
            )}
            <Button type="submit" className="gold-button" disabled={!ready}>
              Войти как {pick === 'dispatcher' ? 'диспетчер' : 'водитель'}{' '}
              <ArrowUpRight />
            </Button>
            <div className="demo-note">
              Это демонстрационный вход, без регистрации. Все данные вымышлены.
              Изменения хранятся только в этом браузере. Реальные данные вводить
              не нужно.
            </div>
          </form>
        </section>
        <footer>
          MELUWI <span>FULL-STACK DEVELOPMENT · WEB + ANDROID</span>
        </footer>
      </main>
    );
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '238px' } as React.CSSProperties}
    >
      <Navigation
        page={page}
        setPage={(p) => {
          setPage(p);
          setError('');
        }}
        role={role}
        onExit={logout}
        onReset={() => openModal('reset')}
      />
      <main className={`workspace role-${role}`}>
        <header className="workspace-top">
          <div>
            <SidebarTrigger className="mobile-menu" />
            <span className="breadcrumb">
              Рабочее пространство <ChevronRight size={13} />
            </span>
            <span>{pages.find((p) => p.id === page)?.label}</span>
          </div>
          <div className="profile">
            <i className="online-dot" />
            <span>{role === 'driver' ? 'Водитель 01' : 'Диспетчер Demo'}</span>
            <span className="avatar">{role === 'driver' ? 'В1' : 'ДД'}</span>
          </div>
        </header>
        <div className="sandbox-bar">
          <span>
            <ShieldCheck size={13} /> Песочница · вымышленные данные
          </span>
          <button onClick={() => openModal('help')}>
            Как попробовать <CircleHelp size={13} />
          </button>
        </div>
        <div className="workspace-body">
          <div className="page-heading">
            <div>
              <p className="overline">
                {role === 'driver'
                  ? 'МОБИЛЬНОЕ РАБОЧЕЕ МЕСТО'
                  : 'ДИСПЕТЧЕРСКАЯ · ДЕМО-СМЕНА 001'}
              </p>
              <h1>
                {page === 'overview'
                  ? role === 'driver'
                    ? 'Хорошего рейса.'
                    : 'Всё под контролем.'
                  : pages.find((p) => p.id === page)?.label}
              </h1>
              <p>
                {page === 'overview'
                  ? role === 'driver'
                    ? 'Ваши задания, маршрут и завершение рейса.'
                    : 'Заявки, экипажи и деньги — картина текущей смены.'
                  : page === 'orders'
                    ? 'От заявки до доставки. Откройте карточку, чтобы продолжить.'
                    : page === 'fleet'
                      ? 'Пробег автоматически обновляется после завершения рейса.'
                      : page === 'finance'
                        ? 'Суммы рассчитаны по завершённым заявкам этой демо-смены.'
                        : 'События CRM в тематических ветках — локальная симуляция.'}
              </p>
            </div>
            {role === 'dispatcher' && ['overview', 'orders'].includes(page) && (
              <Button
                className="gold-button"
                disabled={!state.shift}
                onClick={() => openModal('create')}
              >
                <Plus /> Новая заявка
              </Button>
            )}
          </div>
          {error && !modal && !selected && (
            <div className="error-banner" role="alert">
              {error}
              <button onClick={() => setError('')} aria-label="Скрыть ошибку">
                <X size={15} />
              </button>
            </div>
          )}
          {page === 'overview' && (
            <>
              <div className="stats-grid">
                <Stat
                  label="В работе"
                  value={String(active.length).padStart(2, '0')}
                  sub="активные заявки"
                  icon={ClipboardList}
                />
                <Stat
                  label="Завершено"
                  value={String(
                    visible.filter((o) => o.status === 'done').length,
                  ).padStart(2, '0')}
                  sub="рейсов за смену"
                  icon={CircleCheck}
                />
                <Stat
                  label={role === 'driver' ? 'Ваш пробег' : 'Выручка'}
                  value={
                    role === 'driver'
                      ? `${visible.filter((o) => o.status === 'done').reduce((a, o) => a + o.km, 0)} км`
                      : money(totals.revenue)
                  }
                  sub={
                    role === 'driver'
                      ? 'завершённые рейсы'
                      : 'по завершённым заявкам'
                  }
                  icon={role === 'driver' ? Gauge : Wallet}
                />
                <Stat
                  label="На линии"
                  value={role === 'driver' ? '01' : '03'}
                  sub={
                    role === 'driver'
                      ? 'эвакуатор закреплён за вами'
                      : 'эвакуатора в демо-парке'
                  }
                  icon={Truck}
                />
              </div>
              <div className="overview-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <h2>
                      Активные заявки <span>{active.length}</span>
                    </h2>
                    <button
                      onClick={() => {
                        setPage('orders');
                        setFilter('all');
                      }}
                    >
                      Все заявки <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="order-list">
                    {active.length ? (
                      active.map((o) => (
                        <OrderCard
                          key={o.id}
                          order={o}
                          onOpen={() => openOrder(o)}
                        />
                      ))
                    ) : (
                      <Empty text="Активных заявок нет. Всё доставлено." />
                    )}
                  </div>
                </section>
                <div className="overview-rail">
                  <section className="shift-panel">
                    <div className="panel-heading">
                      <span className="overline">ТЕКУЩАЯ СМЕНА</span>
                      <span
                        className={state.shift ? 'shift-open' : 'shift-closed'}
                      >
                        {state.shift ? 'Открыта' : 'Закрыта'}
                      </span>
                    </div>
                    <div className="shift-number">
                      001<span>ДЕМО</span>
                    </div>
                    <p>
                      Диспетчер Demo
                      <br />
                      <span>Смена началась в 09:00</span>
                    </p>
                    <div className="shift-progress">
                      <i
                        style={{
                          width: `${(totals.done / Math.max(1, state.orders.length)) * 100}%`,
                        }}
                      />
                    </div>
                    <small>
                      {totals.done} из {state.orders.length} заявок завершено
                    </small>
                    {role === 'dispatcher' && (
                      <Button
                        variant="outline"
                        onClick={() => act({ type: 'shift' })}
                      >
                        {state.shift ? 'Закрыть смену' : 'Открыть смену'}{' '}
                        <ArrowRight />
                      </Button>
                    )}
                  </section>
                  <section className="panel crew-panel">
                    <div className="panel-heading">
                      <h2>Экипажи</h2>
                      <Radio size={15} />
                    </div>
                    {state.vehicles
                      .filter(
                        (v) =>
                          role === 'dispatcher' || v.driver === driverNames[0],
                      )
                      .map((v) => (
                        <div className="crew" key={v.id}>
                          <span className="crew-icon">
                            <Truck size={18} />
                          </span>
                          <div>
                            <strong>{v.driver}</strong>
                            <small>{v.name}</small>
                          </div>
                          <i
                            className={`crew-dot ${state.orders.some((o) => o.driver === v.driver && ['assigned', 'enroute'].includes(o.status)) ? 'busy' : ''}`}
                          />
                        </div>
                      ))}
                    <p className="legend">
                      <i /> Свободен <i className="busy" /> На задании
                    </p>
                  </section>
                </div>
              </div>
              <section className="event-strip">
                <div>
                  <Send size={18} />
                  <strong>Последнее событие</strong>
                </div>
                <p>{state.events[0]?.text}</p>
                <span>{state.events[0]?.time}</span>
              </section>
            </>
          )}
          {page === 'orders' && (
            <section className="panel orders-panel">
              <div className="orders-tools">
                <div className="search-box">
                  <Search size={17} />
                  <Input
                    aria-label="Поиск заявок"
                    placeholder="Номер, автомобиль, маршрут…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Choose
                  value={filter}
                  onChange={setFilter}
                  label="Статус заявок"
                  options={[
                    { value: 'all', label: 'Все статусы' },
                    ...Object.entries(statusLabels).map(([value, label]) => ({
                      value,
                      label,
                    })),
                  ]}
                />
              </div>
              <div className="orders-count">Найдено: {filtered.length}</div>
              <div className="order-list">
                {filtered.length ? (
                  filtered.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      onOpen={() => openOrder(o)}
                    />
                  ))
                ) : (
                  <Empty text="Заявки не найдены. Попробуйте другой фильтр." />
                )}
              </div>
            </section>
          )}
          {page === 'fleet' && (
            <>
              <div className="fleet-grid">
                {state.vehicles
                  .filter(
                    (v) => role === 'dispatcher' || v.driver === driverNames[0],
                  )
                  .map((v) => (
                    <section className="panel vehicle-card" key={v.id}>
                      <div className="vehicle-number">
                        <Truck size={42} strokeWidth={1} />
                        <span>{v.id}</span>
                      </div>
                      <h2>{v.name}</h2>
                      <p>{v.driver} · платформа со сдвигом</p>
                      <div className="odometer">
                        <Gauge size={18} />
                        <strong>{v.odometer.toLocaleString('ru-RU')}</strong>
                        <span>км</span>
                      </div>
                      <div
                        className={`maintenance ${v.serviceAt - v.odometer < 500 ? 'due' : ''}`}
                      >
                        <Wrench size={16} />
                        <span>
                          {v.serviceAt <= v.odometer
                            ? 'ТО требуется сейчас'
                            : `До ТО ${(v.serviceAt - v.odometer).toLocaleString('ru-RU')} км`}
                        </span>
                      </div>
                      <p className="vehicle-next">
                        Следующее ТО: {v.serviceAt.toLocaleString('ru-RU')} км
                      </p>
                      {role === 'dispatcher' && (
                        <Button
                          variant="outline"
                          onClick={() => act({ type: 'service', id: v.id })}
                        >
                          Отметить ТО выполненным
                        </Button>
                      )}
                    </section>
                  ))}
              </div>
              <div className="info-note">
                <Gauge size={20} />
                <p>
                  Завершите рейс в карточке заявки — его фактический пробег
                  добавится к одометру нужного эвакуатора. Отметка ТО планирует
                  следующее обслуживание через 10 000 км.
                </p>
              </div>
            </>
          )}
          {page === 'finance' && (
            <>
              <div className="stats-grid finance-stats">
                <Stat
                  label="Выручка"
                  value={money(totals.revenue)}
                  sub="завершённые рейсы"
                  icon={Wallet}
                />
                <Stat
                  label="Расходы"
                  value={money(totals.expenses)}
                  sub="топливо и обслуживание"
                  icon={ArrowDownLeft}
                />
                <Stat
                  label="Партнёрам"
                  value={money(totals.partners)}
                  sub="демо-правило: 15% заказа"
                  icon={Route}
                />
                <Stat
                  label="Остаток"
                  value={money(totals.balance)}
                  sub="до зарплат и налогов"
                  icon={Gauge}
                />
              </div>
              <div className="finance-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <h2>Расходы смены</h2>
                    <Button
                      variant="outline"
                      onClick={() => openModal('expense')}
                      disabled={!state.shift}
                    >
                      <Plus /> Добавить
                    </Button>
                  </div>
                  {state.expenses.map((e) => (
                    <div className="finance-row" key={e.id}>
                      <span>
                        <span className="expense-icon">
                          <ArrowDownLeft size={15} />
                        </span>
                        {e.title}
                      </span>
                      <strong>−{money(e.amount)}</strong>
                    </div>
                  ))}
                </section>
                <section className="panel report-panel">
                  <div className="panel-heading">
                    <h2>Отчёт диспетчера</h2>
                    <ClipboardList size={19} />
                  </div>
                  <div className="report-row">
                    <span>Завершено рейсов</span>
                    <strong>{totals.done}</strong>
                  </div>
                  <div className="report-row">
                    <span>Пройдено по заказам</span>
                    <strong>{totals.km} км</strong>
                  </div>
                  <div className="report-row">
                    <span>Наличные</span>
                    <strong>
                      {money(
                        state.orders
                          .filter(
                            (o) => o.status === 'done' && o.payment === 'cash',
                          )
                          .reduce((a, o) => a + o.price, 0),
                      )}
                    </strong>
                  </div>
                  <div className="report-row">
                    <span>Карта</span>
                    <strong>
                      {money(
                        state.orders
                          .filter(
                            (o) => o.status === 'done' && o.payment === 'card',
                          )
                          .reduce((a, o) => a + o.price, 0),
                      )}
                    </strong>
                  </div>
                  <Button
                    className="gold-button"
                    onClick={() => {
                      downloadReport(state);
                      setNotice('CSV-отчёт подготовлен к скачиванию');
                    }}
                  >
                    <Download /> Скачать отчёт CSV
                  </Button>
                  <p className="demo-note">
                    Только вымышленные данные текущей демо-смены.
                  </p>
                </section>
              </div>
            </>
          )}
          {page === 'telegram' && (
            <div className="telegram-layout">
              <section className="panel telegram-panel">
                <div className="telegram-header">
                  <span>
                    <Send size={25} />
                  </span>
                  <div>
                    <h2>Эвакуация / Демо-чат</h2>
                    <p>Журнал уведомлений · {state.events.length} событий</p>
                  </div>
                  <span className="simulation-badge">СИМУЛЯЦИЯ</span>
                </div>
                <div className="message-feed">
                  {state.events.map((e) => (
                    <article className="telegram-message" key={e.id}>
                      <strong>#{e.topic}</strong>
                      <p>{e.text}</p>
                      <small>
                        {e.time} <CircleCheck size={11} />
                      </small>
                    </article>
                  ))}
                </div>
              </section>
              <div className="telegram-explain">
                <Send />
                <h2>
                  Операционные события
                  <br />в нужной ветке.
                </h2>
                <p>
                  Заявки, смены и обслуживание техники попадают в свои темы. В
                  рабочем проекте этим занимаются серверные обработчики
                  Telegram.
                </p>
                <p>
                  Здесь показана локальная модель: сообщения никуда не
                  отправляются. Создайте или завершите заказ, чтобы увидеть
                  новое событие.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPage('orders');
                    setFilter('all');
                  }}
                >
                  Перейти к заявкам <ArrowRight />
                </Button>
              </div>
            </div>
          )}
        </div>
        <footer className="workspace-footer">
          <span>MELUWI / EVACUATION CRM</span>
          <span>Демо сохраняется на этом устройстве</span>
        </footer>
      </main>
      <Dialog
        open={Boolean(order)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setError('');
          }
        }}
      >
        <DialogContent className="crm-dialog">
          <DialogTitle className="detail-title">
            Заявка #{order?.id}
          </DialogTitle>
          <DialogDescription>
            Демонстрационный заказ · {order?.client}
          </DialogDescription>
          {order && (
            <>
              <div className="detail-car">
                <div>
                  <Truck />
                  <strong>{order.car}</strong>
                </div>
                <Badge status={order.status} />
              </div>
              <div className="detail-route">
                <div>
                  <i />
                  <span>
                    ОТКУДА<strong>{order.from}</strong>
                  </span>
                </div>
                <div>
                  <i />
                  <span>
                    КУДА<strong>{order.to}</strong>
                  </span>
                </div>
              </div>
              <div className="detail-facts">
                <div>
                  <span>Стоимость</span>
                  <strong>{money(order.price)}</strong>
                </div>
                <div>
                  <span>Оплата</span>
                  <strong>
                    {order.payment === 'cash' ? 'Наличные' : 'Карта'}
                  </strong>
                </div>
                <div>
                  <span>Пробег</span>
                  <strong>{order.km} км</strong>
                </div>
                <div>
                  <span>Источник</span>
                  <strong>
                    {order.partner ? 'Демо-партнёр' : 'Прямая заявка'}
                  </strong>
                </div>
              </div>
              {!['done', 'cancelled'].includes(order.status) && (
                <>
                  {role === 'dispatcher' && order.status !== 'enroute' && (
                    <div className="assign-row">
                      <Choose
                        value={driver}
                        onChange={setDriver}
                        label="Назначить водителя"
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
                    <label className="field-label">
                      Фактический пробег, км
                      <Input
                        type="number"
                        min="1"
                        max="2000"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                      />
                    </label>
                  )}
                  {error && (
                    <p className="error-text" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="detail-actions">
                    {['assigned', 'enroute'].includes(order.status) && (
                      <Button
                        className="gold-button"
                        onClick={() =>
                          act({
                            type: 'advance',
                            id: order.id,
                            km: Number(distance),
                          })
                        }
                      >
                        {order.status === 'assigned' ? (
                          <>
                            <Route /> Начать рейс
                          </>
                        ) : (
                          <>
                            <CircleCheck /> Завершить рейс
                          </>
                        )}
                      </Button>
                    )}
                    {role === 'dispatcher' && (
                      <Button
                        variant="ghost"
                        onClick={() => act({ type: 'cancel', id: order.id })}
                      >
                        Отменить заявку
                      </Button>
                    )}
                  </div>
                </>
              )}
              {order.status === 'done' && (
                <div className="success-note">
                  <CircleCheck /> Рейс завершён. Пробег и выручка учтены.
                </div>
              )}
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
        <DialogContent className="crm-dialog">
          <DialogTitle>
            {modal === 'create'
              ? 'Новая заявка'
              : modal === 'expense'
                ? 'Добавить расход'
                : modal === 'reset'
                  ? 'Начать демо заново?'
                  : 'Попробуйте полный рабочий цикл'}
          </DialogTitle>
          <DialogDescription>
            {modal === 'reset'
              ? 'Ваши локальные изменения будут заменены исходными демоданными.'
              : modal === 'help'
                ? 'Все действия происходят в этом браузере. Внешние сервисы не подключены.'
                : 'Заполняйте только вымышленными данными.'}
          </DialogDescription>
          {modal === 'create' && (
            <CreateForm
              onCreate={(order) => {
                if (act({ type: 'create', order })) {
                  setModal(null);
                  setPage('orders');
                  setFilter('all');
                  setQuery('');
                }
              }}
            />
          )}
          {modal === 'expense' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                if (
                  act({
                    type: 'expense',
                    title: String(data.get('title')),
                    amount: Number(data.get('amount')),
                  })
                )
                  setModal(null);
              }}
            >
              <label className="field-label">
                Название
                <Input
                  name="title"
                  required
                  maxLength={100}
                  placeholder="Например: топливо · демо"
                />
              </label>
              <label className="field-label">
                Сумма, ₽
                <Input
                  name="amount"
                  type="number"
                  min="1"
                  max="1000000"
                  required
                />
              </label>
              <Button className="gold-button form-submit" type="submit">
                Сохранить расход
              </Button>
            </form>
          )}
          {modal === 'reset' && (
            <div className="detail-actions">
              <Button
                className="gold-button"
                onClick={() => {
                  act({ type: 'reset' });
                  setModal(null);
                  setSelected(null);
                  setFilter('all');
                  setQuery('');
                }}
              >
                Сбросить демо
              </Button>
              <DialogClose render={<Button variant="outline" />}>
                Оставить как есть
              </DialogClose>
            </div>
          )}
          {modal === 'help' && (
            <ol className="help-steps">
              <li>
                <b>01</b>
                <span>
                  Откройте «Новую заявку». Добавьте вымышленный маршрут и
                  стоимость.
                </span>
              </li>
              <li>
                <b>02</b>
                <span>Откройте карточку и назначьте Водителя 01.</span>
              </li>
              <li>
                <b>03</b>
                <span>
                  Начните рейс и завершите его с фактическим пробегом. Можно
                  сменить роль на водителя.
                </span>
              </li>
              <li>
                <b>04</b>
                <span>
                  Проверьте автопарк, выручку и Telegram-журнал. Скачайте отчёт.
                </span>
              </li>
            </ol>
          )}
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
        </DialogContent>
      </Dialog>
      {notice && (
        <div className="toast" role="status">
          <CircleCheck size={19} />
          <span>{notice}</span>
        </div>
      )}
    </SidebarProvider>
  );
}
function Stat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Wallet;
}) {
  return (
    <section className="stat">
      <div>
        <span>{label}</span>
        <Icon size={17} />
      </div>
      <strong>{value}</strong>
      <small>{sub}</small>
    </section>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <CircleCheck />
      <p>{text}</p>
    </div>
  );
}
function OrderCard({ order: o, onOpen }: { order: Order; onOpen: () => void }) {
  return (
    <button className="order-card" onClick={onOpen}>
      <div className="order-main">
        <div className="order-topline">
          <span className="order-id">#{o.id}</span>
          <Badge status={o.status} />
          <span className="order-time">{o.time}</span>
        </div>
        <h3>{o.car}</h3>
        <div className="order-route">
          <MapPin size={13} />
          <span>{o.from}</span>
          <ArrowRight size={12} />
          <span>{o.to}</span>
        </div>
        <div className="order-bottom">
          <span>
            <Truck size={13} />
            {o.driver || 'Водитель не назначен'}
          </span>
          {o.partner && <span className="partner-tag">Партнёр</span>}
          <span>{o.km} км</span>
        </div>
      </div>
      <div className="order-price">
        <strong>{money(o.price)}</strong>
        <span>{o.payment === 'cash' ? 'Наличные' : 'Карта'}</span>
        <ArrowUpRight size={18} />
      </div>
    </button>
  );
}
function CreateForm({
  onCreate,
}: {
  onCreate: (o: Omit<Order, 'id' | 'time' | 'status'>) => void;
}) {
  const [driver, setDriver] = useState('none');
  const [payment, setPayment] = useState('card');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        onCreate({
          client: 'Новый демо-клиент',
          car: String(d.get('car')),
          from: String(d.get('from')),
          to: String(d.get('to')),
          price: Number(d.get('price')),
          km: Number(d.get('km')),
          driver: driver === 'none' ? '' : driver,
          payment: payment as 'card' | 'cash',
          partner: false,
        });
      }}
    >
      <label className="field-label">
        Автомобиль и причина
        <Input
          name="car"
          placeholder="Седан · не заводится"
          required
          maxLength={100}
        />
      </label>
      <label className="field-label">
        Откуда
        <Input
          name="from"
          placeholder="Демо-район, точка А"
          required
          maxLength={150}
        />
      </label>
      <label className="field-label">
        Куда
        <Input
          name="to"
          placeholder="Демо-сервис, точка Б"
          required
          maxLength={150}
        />
      </label>
      <div className="form-grid">
        <label className="field-label">
          Стоимость, ₽
          <Input
            name="price"
            type="number"
            min="1"
            max="1000000"
            defaultValue="4500"
            required
          />
        </label>
        <label className="field-label">
          Плановый пробег, км
          <Input
            name="km"
            type="number"
            min="1"
            max="2000"
            defaultValue="18"
            required
          />
        </label>
      </div>
      <div className="form-grid">
        <div className="field-label">
          Водитель
          <Choose
            value={driver}
            onChange={setDriver}
            label="Водитель новой заявки"
            options={[
              { value: 'none', label: 'Назначить позже' },
              ...driverNames.map((d) => ({ value: d, label: d })),
            ]}
          />
        </div>
        <div className="field-label">
          Оплата
          <Choose
            value={payment}
            onChange={setPayment}
            label="Способ оплаты"
            options={[
              { value: 'card', label: 'Карта' },
              { value: 'cash', label: 'Наличные' },
            ]}
          />
        </div>
      </div>
      <Button type="submit" className="gold-button form-submit">
        <Plus /> Создать заявку
      </Button>
    </form>
  );
}
function downloadReport(state: State) {
  const cell = (s: unknown) =>
    '"' +
    String(s)
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  const t = summary(state);
  const rows = [
    ['Демонстрационные данные'],
    ['№', 'Автомобиль', 'Статус', 'Водитель', 'Стоимость ₽', 'Пробег км'],
    ...state.orders.map((o) => [
      o.id,
      o.car,
      statusLabels[o.status],
      o.driver,
      o.price,
      o.km,
    ]),
    [],
    ['Выручка', t.revenue],
    ['Расходы', t.expenses],
    ['Партнёрам', t.partners],
    ['Остаток до зарплат и налогов', t.balance],
    [],
    ['Расход', 'Сумма'],
    ...state.expenses.map((e) => [e.title, e.amount]),
  ];
  const blob = new Blob(
    ['\uFEFF' + rows.map((r) => r.map(cell).join(';')).join('\r\n')],
    { type: 'text/csv;charset=utf-8' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'evacuation-demo-report.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
