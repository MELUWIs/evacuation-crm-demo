import { strict as assert } from 'node:assert';
import { applyAction, createSeed, summary, readSaved } from '../app/model.ts';
let s = createSeed();
assert.equal(summary(s).revenue, 16900);
assert.throws(() => applyAction(s, { type: 'advance', id: 1048 }), /назначьте/);
assert.throws(() => applyAction(s, { type: 'shift' }), /активные/);
s = applyAction(s, { type: 'assign', id: 1048, driver: 'Водитель 01' });
s = applyAction(s, { type: 'advance', id: 1048 });
assert.throws(
  () => applyAction(s, { type: 'advance', id: 1048, km: -1 }),
  /Пробег/,
);
s = applyAction(s, { type: 'advance', id: 1048, km: 24 });
assert.equal(s.vehicles[0].odometer, 82434);
assert.equal(summary(s).revenue, 21400);
assert.throws(
  () => applyAction(s, { type: 'advance', id: 1048, km: 24 }),
  /закрыта/,
);
assert.equal(s.events[0].topic, 'Заявки');
s = applyAction(s, { type: 'expense', title: 'Демо-топливо', amount: 1000 });
assert.equal(summary(s).expenses, 3300);
assert.equal(summary(s).balance, 17485);
s = applyAction(s, { type: 'service', id: '02' });
assert.equal(s.vehicles[1].serviceAt, 129720);
const fresh = {
  car: 'Демо',
  client: 'Демо',
  from: 'А',
  to: 'Б',
  price: 2000,
  km: 12,
  driver: '',
  payment: 'card' as const,
  partner: false,
};
s = applyAction(s, { type: 'create', order: fresh });
assert.equal(s.orders[0].id, 1049);
assert.equal(s.orders[0].status, 'new');
assert.throws(() =>
  applyAction(s, { type: 'create', order: { ...fresh, price: NaN } }),
);
for (const o of s.orders.filter(
  (o) => !['done', 'cancelled'].includes(o.status),
))
  s = applyAction(s, { type: 'cancel', id: o.id });
s = applyAction(s, { type: 'shift' });
assert.equal(s.shift, false);
assert.throws(
  () => applyAction(s, { type: 'create', order: fresh }),
  /откройте/,
);
assert.deepEqual(readSaved('bad-json'), createSeed());
assert.deepEqual(readSaved(JSON.stringify(s)), s);
assert.deepEqual(applyAction(s, { type: 'reset' }), createSeed());
console.log(
  'PASS: order lifecycle, validation, double-completion protection, odometer, reports, expenses, maintenance, shift guard, storage recovery, reset.',
);
