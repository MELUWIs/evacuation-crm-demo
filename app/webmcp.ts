'use client';
import { useEffect, type RefObject } from 'react';
import { driverNames, type State, type Role } from './model';
export function useDemoTools(
  stateRef: RefObject<State>,
  roleRef: RefObject<Role | null>,
  setPage: (page: 'orders') => void,
  setSelected: (id: number) => void,
  setDriver: (driver: string) => void,
  setDistance: (distance: string) => void,
) {
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
}
