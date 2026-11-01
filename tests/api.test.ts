import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('HTTP flow enforces revisions, payment states, net amounts and session isolation', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'crewfloat-test-'));
  const port = 4397;
  const server = spawn(process.execPath, ['--import','tsx','server/index.ts'], { env: { ...process.env, PORT:String(port), PAYMENT_MODE:'demo', CREWFLOAT_DB:path.join(dir,'state.sqlite') }, stdio:['ignore','pipe','pipe'] });
  try {
    await new Promise<void>((resolve,reject) => { const timeout=setTimeout(()=>reject(new Error('Test server did not start')),10000); server.stdout.on('data',data=>{if(data.toString().includes('CrewFloat API')){clearTimeout(timeout);resolve();}}); server.on('error',reject); });
    let cookie = '';
    async function request(endpoint: string, body?: unknown) {
      const res=await fetch(`http://127.0.0.1:${port}/api/${endpoint}`,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-CrewFloat':'1',Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)});
      cookie=res.headers.get('set-cookie')?.split(';')[0] || cookie;
      return { status:res.status, data:await res.json() as any };
    }
    let state=(await request('state')).data.state;
    assert.equal(state.revision,0);
    const refused=await fetch(`http://127.0.0.1:${port}/api/approve`,{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({revision:0})}); assert.equal(refused.status,403);
    const approved=await request('approve',{revision:0}); assert.equal(approved.status,200); assert.equal(approved.data.approved.length,2); state=approved.data;
    assert.equal((await request('approve',{revision:0})).status,409);
    let paid=await request('demo/payment',{revision:state.revision,jobId:'oak',stage:'pending'}); state=paid.data;
    assert.equal(paid.status,200);
    assert.equal((await request('receipts/available',{revision:state.revision,receiptId:state.receipts[0].id,net:155000,reference:'balance check',confirmed:true})).status,400);
    paid=await request('demo/payment',{revision:state.revision,jobId:'oak',stage:'captured'}); state=paid.data;
    assert.equal(state.receipts[0].status,'captured');
    assert.equal((await request('demo/payment',{revision:state.revision,jobId:'oak',stage:'captured'})).status,400);
    assert.equal((await request('receipts/available',{revision:state.revision,receiptId:state.receipts[0].id,net:170000,reference:'balance check',confirmed:true})).status,400);
    const available=await request('receipts/available',{revision:state.revision,receiptId:state.receipts[0].id,net:155000,reference:'balance check',confirmed:true}); state=available.data;
    assert.equal(available.status,200); assert.equal(state.receipts[0].net,155000);
    assert.equal((await request('receipts/available',{revision:state.revision,receiptId:state.receipts[0].id,net:155000,reference:'balance check',confirmed:true})).status,400);
    const again=await request('approve',{revision:state.revision}); assert.equal(again.status,200); assert(again.data.approved.some((a:any)=>a.jobId==='oak'));
    const saved=await request('state'); assert.equal(saved.data.state.approved.length,again.data.approved.length);
    const isolated=await fetch(`http://127.0.0.1:${port}/api/state`).then(r=>r.json()) as any; assert.equal(isolated.state.revision,0); assert.equal(isolated.state.receipts.length,0);
    assert.equal((await request('paypal/order',{jobId:'birch'})).status,403);
    assert.equal((await request('cash',{revision:again.data.revision,opening:-100,reserve:1000})).status,400);
  } finally { server.kill(); await new Promise(resolve=>server.once('exit',resolve)); rmSync(dir,{recursive:true,force:true}); }
});
