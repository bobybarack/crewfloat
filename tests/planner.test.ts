import test from 'node:test';
import assert from 'node:assert/strict';
import { seed, plan, balances, crews } from '../shared/model.ts';
import { verifiedCapture } from '../server/paypal.ts';

test('seed selects valuable feasible work without spending payroll', () => {
  const state = seed(), result = plan(state);
  assert.deepEqual(new Set(result.added.map(a => a.jobId)), new Set(['cedar','maple']));
  assert.equal(result.cost, 80000); assert.equal(result.remaining, 0);
  assert.equal(balances(state).free, 80000);
});
test('pending and captured payments cannot finance work', () => {
  for (const status of ['pending','captured'] as const) {
    const state = seed(); state.receipts.push({ id:'r',jobId:'oak',gross:160000,net:160000,status,source:'simulation',reference:'test' });
    assert.equal(balances(state).free, 80000); assert(!plan(state).added.some(a => a.jobId === 'oak'));
  }
});
test('net available funds unlock work and approved jobs remain fixed', () => {
  const state = seed(); state.approved = plan(state).added;
  const original = structuredClone(state.approved);
  assert.equal(balances(state).free, 0);
  state.receipts.push({ id:'r',jobId:'oak',gross:160000,net:155000,status:'available',source:'simulation',reference:'test' });
  const result = plan(state);
  assert(result.added.some(a => a.jobId === 'oak'));
  assert.deepEqual(result.assignments.slice(0,original.length),original);
  state.approved = result.assignments;
  assert(balances(state).free >= 0); assert.equal(plan(state).added.length,0);
});
test('every generated plan obeys resources, deadlines and cash', () => {
  for (let opening=100000; opening<=700000; opening+=17000) {
    const state = seed(); state.opening = opening; const result = plan(state);
    assert(result.cost <= balances(state).free);
    for (const a of result.assignments) {
      const job = state.jobs.find(j=>j.id===a.jobId)!;
      assert.equal(crews.find(c=>c.id===a.crewId)!.skill, job.skill);
      assert(a.start>=job.earliest && a.end<=job.deadline+1);
      assert.equal(a.end-a.start,job.duration);
      assert(!result.assignments.some(b=>b!==a&&b.crewId===a.crewId&&a.start<b.end&&a.end>b.start));
    }
  }
});
test('a cash shortfall does not erase approved obligations', () => {
  const state = seed(); state.approved=plan(state).added; state.opening=50000;
  assert(balances(state).free < 0); assert.equal(plan(state).added.length,0); assert.equal(plan(state).assignments.length,2);
});
test('server rejects wrong currency, amount, job and incomplete captures', () => {
  const order = {status:'COMPLETED',purchase_units:[{custom_id:'oak',amount:{currency_code:'USD',value:'1600.00'},payments:{captures:[{id:'capture',status:'COMPLETED',amount:{currency_code:'USD',value:'1600.00'}}]}}]};
  assert.equal(verifiedCapture(order,{jobId:'oak',cents:160000}).gross,160000);
  assert.throws(()=>verifiedCapture(order,{jobId:'other',cents:160000}));
  assert.throws(()=>verifiedCapture(order,{jobId:'oak',cents:170000}));
  for (const status of ['PENDING','DECLINED']) { const invalid=structuredClone(order); invalid.purchase_units[0].payments.captures[0].status=status; assert.throws(()=>verifiedCapture(invalid,{jobId:'oak',cents:160000})); }
  const invalid=structuredClone(order); invalid.purchase_units[0].payments.captures[0].amount.currency_code='EUR'; assert.throws(()=>verifiedCapture(invalid,{jobId:'oak',cents:160000}));
});
