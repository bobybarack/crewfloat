import { DurableObject } from 'cloudflare:workers';
import { handleAsNodeRequest } from 'cloudflare:node';
import { createServer, type Server } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { createApp } from '../server/app.ts';
import type { Database } from '../server/storage.ts';

const workspaceCookie = 'crewfloat_workspace';
const workspacePattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;

// This public deployment accepts fictional data only. Live PayPal/AI execution
// remains in the protected Node server until credentials and routing are verified.
function assertDemo() {
  if (process.env.PAYMENT_MODE !== 'demo' || process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_SECRET || process.env.AI_API_KEY) {
    throw new Error('The public Cloudflare deployment must remain an uncredentialed simulation.');
  }
}

export class CrewWorkspace extends DurableObject<Cloudflare.Env> {
  private server?: Server;
  private port?: number;
  private routingId?: string;

  async fetch(request: Request): Promise<Response> {
    assertDemo();
    const routingId = request.headers.get('X-CrewFloat-Workspace');
    if (!routingId || !/^[a-f0-9]{32}$/.test(routingId)) return new Response('Invalid workspace', {status: 400});
    if (this.routingId && this.routingId !== routingId) return new Response('Workspace mismatch', {status: 403});
    if (!this.server) {
      this.routingId = routingId;
      const sql = this.ctx.storage.sql;
      const db: Database = {
        exec: statement => sql.exec(statement),
        prepare: statement => ({
          get: (...values) => sql.exec(statement, ...values).toArray()[0],
          all: (...values) => sql.exec(statement, ...values).toArray(),
          run: (...values) => sql.exec(statement, ...values).toArray()
        }),
        transaction: action => this.ctx.storage.transactionSync(action)
      };
      const origin = this.env.APP_ORIGIN;
      const app = createApp({db, mode: 'demo', settings: {origin, code: '', secure: origin.startsWith('https:')},
        serveStatic: false, paymentToken: () => routingId + randomBytes(16).toString('hex')});
      this.server = createServer(app);
      this.server.listen(0);
      const address = this.server.address();
      if (!address || typeof address === 'string') throw new Error('Could not initialize the HTTP adapter.');
      this.port = address.port;
    }
    return handleAsNodeRequest(this.port!, request);
  }
}

export default {
  async fetch(request, env) {
    try {
      assertDemo();
      const url = new URL(request.url);
      if (!url.pathname.startsWith('/api/')) return new Response('Not found', {status: 404});
      if (url.pathname === '/api/health') return Response.json({status: 'ok', application: 'crewfloat', deployment: 'cloudflare', mode: 'demo'});
      const link = url.pathname.match(/^\/api\/pay\/([a-f0-9]{64})(?:\/(?:order|capture))?$/);
      let workspace = request.headers.get('Cookie')?.split(/;\s*/).find(c => c.startsWith(`${workspaceCookie}=`))?.slice(workspaceCookie.length + 1);
      let fresh = false;
      if (!workspace || !workspacePattern.test(workspace)) { workspace = crypto.randomUUID(); fresh = true; }
      // Public payment links expose a hash prefix, never the secret workspace cookie.
      const routingId = link ? link[1].slice(0, 32) : createHash('sha256').update(workspace).digest('hex').slice(0, 32);
      const headers = new Headers(request.headers);
      headers.set('X-CrewFloat-Workspace', routingId);
      const response = await env.WORKSPACES.getByName(routingId).fetch(new Request(request, {headers}));
      const result = new Response(response.body, response);
      if (fresh && !link) result.headers.append('Set-Cookie', `${workspaceCookie}=${workspace}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${url.protocol === 'https:' ? '; Secure' : ''}`);
      return result;
    } catch (error) {
      console.error(JSON.stringify({event: 'request_failed', path: new URL(request.url).pathname, message: error instanceof Error ? error.message : 'Unknown error'}));
      return Response.json({error: 'CrewFloat could not complete this request. Please try again.'}, {status: 503});
    }
  }
} satisfies ExportedHandler<Cloudflare.Env>;
