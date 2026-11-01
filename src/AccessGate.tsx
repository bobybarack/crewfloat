import {useEffect,useState,type ReactNode}from'react';
import{ArrowRight,Stack}from'@phosphor-icons/react';
import{api}from'./client';
export default function AccessGate({children}:{children:ReactNode}){
  const[access,setAccess]=useState<{required:boolean;authenticated:boolean}>(),[code,setCode]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function check(){try{setAccess(await api('access'));setError('');}catch(e){setError((e as Error).message);}}
  useEffect(()=>{check();const onVisible=()=>{if(document.visibilityState==='visible')check();};document.addEventListener('visibilitychange',onVisible);return()=>document.removeEventListener('visibilitychange',onVisible);},[]);
  if(access?.authenticated)return children;
  return <main className="customer-shell"><div className="customer-brand"><Stack size={25} weight="bold"/>CrewFloat.</div><section className="customer-card"><span className="micro">OWNER WORKSPACE</span><h1>{access?'Open your work planner.':'Checking owner access…'}</h1>{access?<form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{setAccess(await api('access',{code}));setCode('');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}><p className="fine-print">Use the access code configured for this demonstration. Customer payment links open separately.</p><label>Owner access code<input type="password" autoComplete="current-password" required maxLength={512} value={code} onChange={e=>setCode(e.target.value)}/></label>{error&&<p className="agent-error" role="alert">{error}</p>}<button className="button primary" disabled={busy}>Open workspace <ArrowRight size={16}/></button></form>:error?<><p role="alert">{error}</p><button className="button secondary" onClick={check}>Retry connection</button></>:<p className="fine-print">Connecting to the CrewFloat server.</p>}</section></main>;
}
