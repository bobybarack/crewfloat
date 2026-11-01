import React,{lazy,Suspense} from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/manrope';
import './style.css';
import './recovery.css';
import CustomerPayment from './CustomerPayment';
import AccessGate from './AccessGate';
const App=lazy(()=>import('./App'));
createRoot(document.getElementById('root')!).render(<React.StrictMode>{location.pathname.startsWith('/pay/')?<CustomerPayment/>:<AccessGate><Suspense fallback={<main className="loading" aria-busy="true"><h1>CrewFloat</h1><p>Opening your planner…</p></main>}><App/></Suspense></AccessGate>}</React.StrictMode>);
