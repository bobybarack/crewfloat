import {useEffect, useRef} from 'react';
import {Scheduler, StringHelper} from '@bryntum/scheduler';
import '@bryntum/scheduler/fontawesome/css/fontawesome.css';
import '@bryntum/scheduler/fontawesome/css/solid.css';
import '@bryntum/scheduler/scheduler.css';
import '@bryntum/scheduler/svalbard-light.css';
import {crews, type Job, type Plan, type State} from '../shared/model';

export default function Timeline({ proposal, state, onJob }: { proposal: Plan; state: State; onJob: (job: Job) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const callback = useRef(onJob); callback.current = onJob;
  useEffect(() => {
    if (!host.current) return;
    const scheduler = new Scheduler({
      appendTo: host.current, height: 260, startDate: new Date(2026, 9, 12), endDate: new Date(2026, 9, 17),
      viewPreset: 'dayAndWeek', rowHeight: 88, barMargin: 18, readOnly: true,
      eventRenderer:({eventRecord})=>StringHelper.encodeHtml(String(eventRecord.name)),
      columns: [{ text: 'CREW', field: 'name', width: 164 }],
      resources: crews.map(c => ({ id: c.id, name: c.name })),
      events: proposal.assignments.map(a => ({ id: a.jobId, resourceId: a.crewId, name: state.jobs.find(j => j.id === a.jobId)!.name, startDate: new Date(2026, 9, 12 + a.start), endDate: new Date(2026, 9, 12 + a.end), eventColor: proposal.atRisk.some(p=>p.jobId===a.jobId)?'#934f36':state.approved.some(p => p.jobId === a.jobId) ? '#21634f' : '#bce0cc', cls: proposal.atRisk.some(p=>p.jobId===a.jobId)?'risk-event':state.approved.some(p => p.jobId === a.jobId) ? 'approved-event' : 'proposed-event' })),
      features: { eventEdit: false, eventMenu: false, scheduleMenu: false, headerMenu: false, cellMenu: false, eventTooltip: false },
      listeners: { eventClick: ({ eventRecord }: any) => { const job = state.jobs.find(j => j.id === eventRecord.id); if (job) callback.current(job); } }
    });
    return () => scheduler.destroy();
  }, [proposal, state]);
  return <div className="timeline-scroll"><div className="timeline" ref={host}/></div>;
}
