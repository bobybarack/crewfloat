import test from'node:test';import assert from'node:assert/strict';import{spawn}from'node:child_process';import{mkdtempSync,rmSync}from'node:fs';import{tmpdir}from'node:os';import path from'node:path';import{createHmac}from'node:crypto';import{deploymentSettings}from'../server/access.ts';
test('owner code protects workspace, analysis, exports and streams while customer links remain scoped',async()=>{
  const dir=mkdtempSync(path.join(tmpdir(),'crewfloat-access-')),port=4399,code='test-owner-code-12345678901234567890';
  const server=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:String(port),APP_ORIGIN:`http://127.0.0.1:${port}`,OWNER_ACCESS_CODE:code,BIND_HOST:'127.0.0.1',PAYMENT_MODE:'demo',CREWFLOAT_DB:path.join(dir,'state.sqlite')},stdio:['ignore','pipe','pipe']});
  try{await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Owner server startup timed out')),10000);server.stdout.on('data',data=>{if(data.toString().includes('CrewFloat API')){clearTimeout(timer);resolve();}});server.on('error',reject);});
    const jar=new Map<string,string>();
    async function request(endpoint:string,body?:unknown,cookie?:string){const res=await fetch(`http://127.0.0.1:${port}/api/${endpoint}`,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-CrewFloat':'1',Cookie:cookie??[...jar].map(([k,v])=>`${k}=${v}`).join('; ')},body:body===undefined?undefined:JSON.stringify(body)});for(const header of res.headers.getSetCookie()){const first=header.split(';')[0],index=first.indexOf('=');jar.set(first.slice(0,index),first.slice(index+1));}return{status:res.status,data:await res.json() as any};}
    for(const endpoint of ['state','proof','events'])assert.equal((await request(endpoint)).status,401);
    assert.equal((await request('agent',{revision:0,question:'Analyze deposits.'})).status,401);
    assert.equal((await request('access')).data.required,true);
    assert.equal((await request('access',{code:'wrong'})).status,401);
    assert.equal((await request('access',{code})).status,200);
    const state=(await request('state')).data.state;assert.equal(state.revision,0);
    const auth=jar.get('crewfloat_owner')!;assert(auth);
    assert.equal((await request('state',undefined,`crewfloat_owner=${auth}tamper`)).status,401);
    const payload=Buffer.from(JSON.stringify({exp:Date.now()-1000,nonce:'test'})).toString('base64url'),mac=createHmac('sha256',code).update(payload).digest('base64url');
    assert.equal((await request('state',undefined,`crewfloat_owner=${payload}.${mac}`)).status,401);
    const link=(await request('payment-link',{revision:0,jobId:'oak'})).data.url,token=new URL(link).pathname.split('/')[2];
    const publicView=await request(`pay/${token}`,undefined,'');assert.equal(publicView.status,200);assert.equal(publicView.data.job.deposit,160000);assert.equal(publicView.data.state,undefined);
    const health=await request('health',undefined,'');assert.equal(health.status,200);
    await request('access/logout',{});assert.equal((await request('state')).status,401);
  }finally{server.kill();await new Promise(resolve=>server.once('exit',resolve));rmSync(dir,{recursive:true,force:true});}
});
test('remote binding fails closed without a strong code and HTTPS origin',()=>{
  const keys=['BIND_HOST','APP_ORIGIN','OWNER_ACCESS_CODE'],saved=keys.map(k=>process.env[k]);
  try{process.env.BIND_HOST='0.0.0.0';process.env.APP_ORIGIN='https://crewfloat.example';delete process.env.OWNER_ACCESS_CODE;assert.throws(()=>deploymentSettings(),/required/);process.env.OWNER_ACCESS_CODE='short';assert.throws(()=>deploymentSettings(),/at least 24/);process.env.OWNER_ACCESS_CODE='test-only-strong-code-123456789012345';process.env.APP_ORIGIN='http://crewfloat.example';assert.throws(()=>deploymentSettings(),/HTTPS/);process.env.APP_ORIGIN='https://crewfloat.example';assert.equal(deploymentSettings().host,'0.0.0.0');}finally{keys.forEach((k,i)=>{if(saved[i]===undefined)delete process.env[k];else process.env[k]=saved[i];});}
});
