export type Skill = 'installation' | 'repair';
export type Job = { id: string; name: string; customer: string; cost: number; value: number; deposit: number; duration: number; earliest: number; deadline: number; skill: Skill; note: string };
export type Assignment = { jobId: string; crewId: string; start: number; end: number };
export type Receipt = { id: string; jobId: string; gross: number; net: number; status: 'pending' | 'captured' | 'available' | 'restricted'; source: 'simulation' | 'paypal'; reference: string; availabilityReference?: string; restriction?: string; reportedNet?: number; reconciled?: boolean };
export type Audit = { id: string; at: string; title: string; detail: string };
export type State = { revision: number; opening: number; reserve: number; jobs: Job[]; approved: Assignment[]; receipts: Receipt[]; audit: Audit[] };
export const crews = [{ id: 'north', name: 'North crew', skill: 'installation' as Skill, people: 'Amir · Elena' }, { id: 'south', name: 'South crew', skill: 'repair' as Skill, people: 'Ben · Rosa' }];
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(cents / 100);
export const exactMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export const dayLabel = (day: number) => ['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16'][day] ?? 'Outside week';
export function seed(): State {
  return { revision: 0, opening: 180000, reserve: 100000, approved: [], receipts: [], audit: [{ id: 'opening', at: new Date().toISOString(), title: 'Example workspace opened', detail: 'Opening cash and jobs are fictional. $1,000 is reserved for payroll and existing bills.' }], jobs: [
    { id: 'oak', name: 'Oak Street kitchen', customer: 'Maya Chen', cost: 120000, value: 420000, deposit: 160000, duration: 2, earliest: 0, deadline: 3, skill: 'installation', note: 'Cabinet materials must be funded before work begins. Customer deposit is still due.' },
    { id: 'cedar', name: 'Cedar water heater', customer: 'Jon Bell', cost: 50000, value: 220000, deposit: 0, duration: 1, earliest: 0, deadline: 1, skill: 'repair', note: 'Parts available. Customer requires completion by Tuesday.' },
    { id: 'elm', name: 'Elm bathroom repair', customer: 'Nina Patel', cost: 20000, value: 65000, deposit: 0, duration: 1, earliest: 1, deadline: 3, skill: 'repair', note: 'A flexible repair visit, after Tuesday access opens.' },
    { id: 'birch', name: 'Birch deck installation', customer: 'Owen James', cost: 150000, value: 380000, deposit: 100000, duration: 2, earliest: 2, deadline: 4, skill: 'installation', note: 'Two consecutive crew days. Timber purchase needed before start.' },
    { id: 'maple', name: 'Maple door fitting', customer: 'Lena Brooks', cost: 30000, value: 110000, deposit: 0, duration: 1, earliest: 0, deadline: 4, skill: 'installation', note: 'A small installation that fits around the larger jobs.' },
    { id: 'pine', name: 'Pine heating service', customer: 'Theo Grant', cost: 80000, value: 180000, deposit: 0, duration: 2, earliest: 1, deadline: 4, skill: 'repair', note: 'Two-day service with replacement components.' }
  ] };
}
export function balances(state: State) {
  const receipts = state.receipts.filter(r => r.status === 'available').reduce((sum, r) => sum + r.net, 0);
  const committed = state.approved.reduce((sum, a) => sum + state.jobs.find(j => j.id === a.jobId)!.cost, 0);
  return { confirmed: state.opening + receipts, committed, free: state.opening + receipts - state.reserve - committed, awaiting: state.receipts.filter(r => r.status !== 'available').reduce((sum, r) => sum + r.gross, 0) };
}
export type Plan = { assignments: Assignment[]; added: Assignment[]; cost: number; value: number; remaining: number; blocked: { job: Job; reason: string }[]; crewDays: number; atRisk: Assignment[]; reconciliationRequired: boolean };
// Five-day bounded search. No forecast receipts enter the cash constraint.
// Objective: highest booked work value, then lowest material commitment.
function solve(state: State, requiredJobId?: string): Plan | null {
  const free = balances(state).free;
  const pending = state.jobs.filter(j => !state.approved.some(a => a.jobId === j.id)).sort((a, b) => a.deadline - b.deadline || a.id.localeCompare(b.id));
  let best: Assignment[] = [], bestValue = 0, bestCost = 0, found = false;
  const occupied = (crewId: string, start: number, end: number, assignments: Assignment[]) => assignments.some(a => a.crewId === crewId && start < a.end && end > a.start);
  function search(index: number, chosen: Assignment[], cost: number, value: number) {
    if (index === pending.length) {
      if (requiredJobId && ![...state.approved, ...chosen].some(a => a.jobId === requiredJobId)) return;
      if (!found || value > bestValue || (value === bestValue && cost < bestCost)) { best = [...chosen]; bestValue = value; bestCost = cost; found = true; }
      return;
    }
    const job = pending[index];
    if (cost + job.cost <= free) {
      for (const crew of crews.filter(c => c.skill === job.skill)) {
        for (let start = job.earliest; start + job.duration <= job.deadline + 1; start++) {
          const end = start + job.duration;
          if (!occupied(crew.id, start, end, [...state.approved, ...chosen])) search(index + 1, [...chosen, { jobId: job.id, crewId: crew.id, start, end }], cost + job.cost, value + job.value);
        }
      }
    }
    if (job.id !== requiredJobId) search(index + 1, chosen, cost, value);
  }
  if (free >= 0) search(0, [], 0, 0);
  if (requiredJobId && !found) return null;
  const assignments = [...state.approved, ...best];
  const reconciliationRequired = state.receipts.some(r => r.status === 'restricted' && !r.reconciled);
  return { assignments, added: best, cost: bestCost, value: bestValue, remaining: free - bestCost, crewDays: assignments.reduce((sum,a) => sum+a.end-a.start,0), atRisk: free < 0 || reconciliationRequired ? [...state.approved] : [], reconciliationRequired, blocked: pending.filter(j => !best.some(a => a.jobId === j.id)).map(job => {
    const shortage = job.cost - (free - bestCost);
    return { job, reason: free < 0 ? 'Existing commitments exceed available cash. Review the cash inputs.' : shortage > 0 ? `${money(shortage)} more is needed after the proposed commitments. Expected deposits are excluded.` : 'No compatible crew window remains in the selected plan before the deadline.' };
  }) };
}
export function plan(state: State): Plan { return solve(state)!; }
export type Unlock = { feasible: boolean; needed: number | null; assignments: Assignment[]; displaced: string[]; reason: string };
// Feasibility is monotone in cash; binary search yields the exact minimum cents.
// Optional proposals may move, approved commitments are always fixed.
export function unlock(state: State, jobId: string): Unlock {
  const job = state.jobs.find(j => j.id === jobId);
  if (!job) throw new Error('Unknown job.');
  const baseline = plan(state);
  const limit = state.jobs.reduce((sum,j)=>sum+j.cost,0) + Math.max(0,-balances(state).free);
  const funded = (extra: number) => solve({...state, opening:state.opening+extra},jobId);
  if (!funded(limit)) return {feasible:false, needed:null, assignments:[], displaced:[], reason:'Even with enough cash, this job has no compatible crew window before its deadline. Money alone cannot resolve it.'};
  let low=0, high=limit;
  while (low<high) { const mid=Math.floor((low+high)/2); if(funded(mid)) high=mid; else low=mid+1; }
  const result=funded(low)!;
  const displaced=baseline.added.filter(a=>!result.assignments.some(b=>b.jobId===a.jobId)).map(a=>a.jobId);
  return {feasible:true, needed:low, assignments:result.assignments, displaced, reason:low ? `${money(low)} additional usable funds would make this job feasible${displaced.length ? ', by replacing some unapproved proposals' : ''}.` : 'This job can fit the existing cash budget by choosing a different proposal.'};
}
export type RecoveryScenario = { jobId: string; name: string; deposit: number; beforeValue: number; afterValue: number; addedValue: number; additionalJobs: string[]; displacedJobs: string[]; beforeDays: number; afterDays: number; after: Plan; assumptions: string[] };
export function recovery(state: State): RecoveryScenario[] {
  const before=plan(state), booked=(p:Plan)=>p.assignments.reduce((sum,a)=>sum+state.jobs.find(j=>j.id===a.jobId)!.value,0);
  return state.jobs.filter(j=>j.deposit>0 && !state.receipts.some(r=>r.jobId===j.id)).map(job=>{
    const after=plan({...state,opening:state.opening+job.deposit});
    return {jobId:job.id,name:job.name,deposit:job.deposit,beforeValue:booked(before),afterValue:booked(after),addedValue:booked(after)-booked(before),additionalJobs:after.assignments.filter(a=>!before.assignments.some(b=>b.jobId===a.jobId)).map(a=>a.jobId),displacedJobs:before.added.filter(a=>!after.assignments.some(b=>b.jobId===a.jobId)).map(a=>a.jobId),beforeDays:before.crewDays,afterDays:after.crewDays,after,assumptions:['Full gross deposit becomes usable before fees or holds. This is an upper-bound scenario, not available cash.','Crew availability, job costs and deadlines remain as entered.','Booked work value is not profit or cash received.']};
  }).sort((a,b)=>b.addedValue-a.addedValue || a.deposit-b.deposit);
}
export function restrictReceipt(state:State, receiptId:string, reason:string) {
  const receipt=state.receipts.find(r=>r.id===receiptId);
  if(!receipt) throw new Error('Unknown receipt.');
  if(receipt.status==='restricted'&&!receipt.reconciled) return;
  receipt.reconciled=false;
  receipt.status='restricted';receipt.restriction=reason;
  addAudit(state,'Payment funding restricted',`${state.jobs.find(j=>j.id===receipt.jobId)!.name}: ${reason}. Its net credit is excluded. Existing commitments remain visible and new approvals are paused pending reconciliation.`);
}
export function addAudit(state: State, title: string, detail: string) { state.audit.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), title, detail }); }
