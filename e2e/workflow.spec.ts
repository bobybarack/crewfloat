import { test, expect } from '@playwright/test';
import{spawn}from'node:child_process';import{mkdtempSync,rmSync}from'node:fs';import{tmpdir}from'node:os';import path from'node:path';
test('owner approves funded jobs, confirms a simulated receipt and approves newly feasible work', async ({page}) => {
  const errors:string[]=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button',{name:'Work planner'}).click();
  await expect(page.getByRole('heading',{name:'Good work. Within reach.'})).toBeVisible();
  await expect(page.locator('.b-sch-event')).toHaveCount(2);
  await page.getByRole('button',{name:'Review plan',exact:true}).click();
  await page.getByRole('button',{name:'Approve 2 jobs'}).click();
  await expect(page.getByText('Plan approved. Material costs are reserved once.')).toBeVisible();
  await page.locator('.blocked-job').filter({hasText:'Oak Street kitchen'}).click();
  await page.getByRole('button',{name:'Simulate captured payment'}).click();
  await expect(page.getByRole('heading',{name:'Confirm available funds'})).toBeVisible();
  await page.getByLabel('Net available amount (USD)').fill('1550');
  await page.getByLabel('Balance check reference').fill('SIM balance check 001');
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Confirm funds & replan'}).click();
  await page.getByRole('button',{name:'Review plan',exact:true}).click();
  await expect(page.getByRole('dialog').getByText('Oak Street kitchen')).toBeVisible();
  await page.getByRole('button',{name:/Approve \d+ jobs/}).click();
  await page.reload();
  await expect(page.locator('.metrics').getByText('4 jobs committed')).toBeVisible();
  await page.getByRole('button',{name:'Decision log'}).click();
  await expect(page.getByRole('heading',{name:'Net funds confirmed by owner'})).toBeVisible();
  expect(errors).toEqual([]);
});
test('mobile navigation, dialog and ledger stay within the viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844}); await page.goto('/');
  await page.getByRole('button',{name:'Work planner'}).click();
  await expect(page.getByRole('heading',{name:'Good work. Within reach.'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Cash & payments'}).click();
  await expect(page.getByRole('heading',{name:'Cash bridge'})).toBeVisible();
  await page.getByRole('button',{name:'Add a job'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{name:'Add reviewed job'}).click();
  await expect(page.getByText('Reviewed job added. The planner has recalculated.')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('recovery scenarios are read-only, analyst shows tools and customer link exposes only its job',async({page})=>{
  await page.goto('/');await expect(page.getByRole('heading',{name:'Keep the week moving.'})).toBeVisible();
  const before=await page.request.get('/api/state').then(r=>r.json());
  await page.locator('#net-scenario').fill('120000');
  const after=await page.request.get('/api/state').then(r=>r.json());expect(after.state).toEqual(before.state);
  await page.getByRole('button',{name:'Analyze with rules'}).click();
  await expect(page.getByText('Deterministic rules preview · revision 0')).toBeVisible();
  await expect(page.getByText('3 read-only tool calls')).toBeVisible();
  await page.getByRole('button',{name:'Prepare payment link'}).click();
  await expect(page.getByText('Customer link prepared')).toBeVisible();
  const popupPromise=page.waitForEvent('popup');await page.getByRole('link',{name:'Open customer payment page'}).click();const customer=await popupPromise;
  await expect(customer.getByRole('heading',{name:'Oak Street kitchen'})).toBeVisible();await expect(customer.getByText('$1,600.00',{exact:true})).toBeVisible();
  await expect(customer.getByRole('button',{name:'Pay deposit in sandbox'})).toBeDisabled();await expect(customer.locator('.metrics')).toHaveCount(0);
  const current=await page.request.get('/api/state').then(r=>r.json());expect(current.state.receipts).toEqual([]);expect(current.state.opening).toBe(180000);await customer.close();
});
test('a payment reversal arrives through the event stream and blocks new approvals',async({page})=>{
  await page.goto('/');const request=async(path:string,data:unknown)=>page.request.post(`/api/${path}`,{headers:{'X-CrewFloat':'1'},data}).then(r=>r.json());
  let state=await page.request.get('/api/state').then(r=>r.json()).then(x=>x.state);
  state=await request('demo/payment',{revision:state.revision,jobId:'oak',stage:'captured'});
  state=await request('receipts/available',{revision:state.revision,receiptId:state.receipts[0].id,net:155000,reference:'SIM browser check',confirmed:true});
  state=await request('approve',{revision:state.revision});
  await expect(page.locator('.metrics').getByText('4 jobs committed')).toBeVisible();
  await request('demo/reversal',{revision:state.revision,receiptId:state.receipts[0].id});
  await expect(page.getByRole('heading',{name:'One payment changed. Your commitments need a funding review.'})).toBeVisible();
  await page.getByRole('button',{name:'Work planner'}).click();await expect(page.locator('.risk-event')).toHaveCount(4);await expect(page.getByRole('button',{name:'Review plan',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Decision log'}).click();await expect(page.getByRole('heading',{name:'Payment funding restricted'})).toBeVisible();
});
test('an approval dialog cannot silently approve a newly changed workspace revision',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Work planner'}).click();await page.getByRole('button',{name:'Review plan',exact:true}).click();
  await page.request.post('/api/cash',{headers:{'X-CrewFloat':'1'},data:{revision:0,opening:190000,reserve:100000}});
  await expect(page.getByRole('dialog').getByText('The workspace changed. Close this dialog and review the updated plan before approving.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Approve 2 jobs'})).toBeDisabled();
});
test('protected owner login and logout work against the built application',async({page})=>{
  const dir=mkdtempSync(path.join(tmpdir(),'crewfloat-owner-browser-')),port=4400,code='test-browser-owner-12345678901234567890';
  const server=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:String(port),APP_ORIGIN:`http://127.0.0.1:${port}`,OWNER_ACCESS_CODE:code,BIND_HOST:'127.0.0.1',PAYMENT_MODE:'demo',CREWFLOAT_DB:path.join(dir,'state.sqlite')},stdio:['ignore','pipe','pipe']});
  try{await new Promise<void>((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Owner test server failed to start')),10000);server.stdout.on('data',data=>{if(data.toString().includes('CrewFloat API')){clearTimeout(timeout);resolve();}});server.on('error',reject);});
    await page.goto(`http://127.0.0.1:${port}`);await expect(page.getByRole('heading',{name:'Open your work planner.'})).toBeVisible();await page.getByLabel('Owner access code').fill('wrong');await page.getByRole('button',{name:'Open workspace'}).click();await expect(page.getByText('Owner access code is incorrect.')).toBeVisible();await page.getByLabel('Owner access code').fill(code);await page.getByRole('button',{name:'Open workspace'}).click();await expect(page.getByRole('heading',{name:'Keep the week moving.'})).toBeVisible();await page.getByRole('button',{name:'Connections & setup'}).click();await page.getByRole('button',{name:'Close owner access'}).click();await expect(page.getByRole('heading',{name:'Open your work planner.'})).toBeVisible();
  }finally{await page.goto('about:blank');server.kill();await new Promise(resolve=>server.once('exit',resolve));rmSync(dir,{recursive:true,force:true});}
});
test('untrusted job labels render as text in the scheduler',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Work planner'}).click();
  const state=await page.request.get('/api/state').then(r=>r.json()).then(x=>x.state),name='<img src=x onerror=window.__crewfloatXss=1>';
  const response=await page.request.post('/api/jobs',{headers:{'X-CrewFloat':'1'},data:{revision:state.revision,job:{name,customer:'Example customer',cost:0,value:40000,deposit:0,duration:1,earliest:0,deadline:4,skill:'repair',note:'Untrusted label test fixture.'}}});expect(response.ok()).toBe(true);
  await expect(page.locator('.b-sch-event-content').filter({hasText:name})).toBeVisible();await expect(page.locator('.b-sch-event img[src="x"]')).toHaveCount(0);expect(await page.evaluate(()=>(window as any).__crewfloatXss)).toBeUndefined();
});
