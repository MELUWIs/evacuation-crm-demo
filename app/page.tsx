'use client';
import { useEffect, useRef, useState } from 'react';
export default function DemoPage() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [driver, setDriver] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const context = (document as any).modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    const tools = [
      {
        name: 'get_demo_orders',
        description: 'Read synthetic CRM orders for the current demo role.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: () =>
          (frame.current?.contentWindow as any)?.technoprimeDemo?.getOrders() ??
          [],
      },
      {
        name: 'open_demo_dashboard',
        description:
          'Open the original dispatcher dashboard with synthetic data.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        execute: () => {
          setDriver(false);
          setRevision((v) => v + 1);
          return { opened: 'dashboard' };
        },
      },
    ];
    for (const tool of tools) {
      try {
        Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    }
    return () => lifecycle.abort();
  }, []);
  return (
    <main className="demo-shell">
      <header className="demo-bar">
        <span>
          <b>ТЕХНОПРАЙМ</b>
          <span className="demo-label"> · учебная версия</span>
        </span>
        <nav aria-label="Управление демо">
          <button aria-pressed={!driver} onClick={() => setDriver(false)}>
            Диспетчер
          </button>
          <button aria-pressed={driver} onClick={() => setDriver(true)}>
            Водитель
          </button>
          <button
            onClick={() => {
              (frame.current?.contentWindow as any)?.technoprimeDemo?.reset();
              setRevision((v) => v + 1);
            }}
          >
            Сбросить
          </button>
          <span className="demo-pin">PIN: 1234</span>
        </nav>
      </header>
      <iframe
        key={`${driver}-${revision}`}
        ref={frame}
        className="crm-frame"
        title={
          driver
            ? 'Оригинальный кабинет водителя — учебные данные'
            : 'Оригинальная диспетчерская — учебные данные'
        }
        src={
          driver
            ? '/driver/index.html?mode=driver'
            : '/original/index.html?mode=dispatcher'
        }
      />
    </main>
  );
}
