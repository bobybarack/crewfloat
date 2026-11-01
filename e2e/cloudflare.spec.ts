import {test, expect} from '@playwright/test';
import {createHash} from 'node:crypto';

test('Cloudflare isolates visitors and routes customer links without revealing owner access', async ({request, playwright, baseURL}) => {
  const health = await request.get('/api/health').then(r => r.json());
  test.skip(health.deployment !== 'cloudflare', 'Requires the Cloudflare runtime.');
  await request.get('/api/state');
  const changed = await request.post('/api/cash', {headers: {'X-CrewFloat': '1'}, data: {revision: 0, opening: 196000, reserve: 100000}});
  expect(changed.status()).toBe(200);
  const stale = await request.post('/api/cash', {headers: {'X-CrewFloat': '1'}, data: {revision: 0, opening: 999999, reserve: 0}});
  expect(stale.status()).toBe(409);
  const prepared = await request.post('/api/payment-link', {headers: {'X-CrewFloat': '1'}, data: {revision: 1, jobId: 'oak'}}).then(r => r.json());
  const token = new URL(prepared.url).pathname.split('/').at(-1)!;
  const workspace = (await request.storageState()).cookies.find(c => c.name === 'crewfloat_workspace')!;
  expect(workspace.httpOnly).toBe(true);
  expect(token.slice(0, 32)).toBe(createHash('sha256').update(workspace.value).digest('hex').slice(0, 32));
  expect(token).not.toContain(workspace.value.replaceAll('-', ''));

  const visitor = await playwright.request.newContext({baseURL});
  try {
    const customer = await visitor.get(`/api/pay/${token}`).then(r => r.json());
    expect(customer.job.name).toBe('Oak Street kitchen');
    expect(customer.state).toBeUndefined();
    expect(customer.opening).toBeUndefined();
    const isolated = await visitor.get('/api/state', {headers: {'X-CrewFloat-Workspace': token.slice(0, 32)}}).then(r => r.json());
    expect(isolated.state.revision).toBe(0);
    expect(isolated.state.opening).toBe(180000);
    const owner = await request.get('/api/state').then(r => r.json());
    expect(owner.state.opening).toBe(196000);
    expect(owner.state.reserve).toBe(100000);
    expect(owner.state.revision).toBe(2);
    expect((await visitor.post(`/api/pay/${token}/order`, {headers: {'X-CrewFloat': '1'}, data: {}})).status()).toBe(403);
  } finally { await visitor.dispose(); }
});
