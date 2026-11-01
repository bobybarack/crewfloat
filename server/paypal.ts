const base = 'https://api-m.sandbox.paypal.com';
export const sandboxConfigured = () => Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
let cachedToken:{value:string;until:number}|undefined;
export async function paypal(path: string, method = 'GET', body?: unknown, requestId?: string): Promise<any> {
  if (!sandboxConfigured()) throw new Error('Set PayPal sandbox credentials in the server .env file.');
  if(!cachedToken || cachedToken.until<Date.now()){
    const tokenResponse = await fetch(`${base}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials', signal: AbortSignal.timeout(20000) });
    if (!tokenResponse.ok) throw new Error('PayPal sandbox authentication failed. Check the server credentials.');
    const token: any = await tokenResponse.json();
    if(!token.access_token)throw new Error('PayPal returned no access token.');
    cachedToken={value:token.access_token,until:Date.now()+Math.max(0,Number(token.expires_in||60)-30)*1000};
  }
  const result = await fetch(`${base}${path}`, { method, headers: { Authorization: `Bearer ${cachedToken.value}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(requestId ? { 'PayPal-Request-Id': requestId } : {}) }, body: body ? typeof body==='string'?body:JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000) });
  const data = await result.json();
  if (!result.ok) {if(result.status===401)cachedToken=undefined;throw new Error(`PayPal sandbox could not ${method === 'GET' ? 'verify' : 'complete'} this request (${result.status}). Retry safely; the same request ID is reused.`);}
  return data;
}
export function verifiedCapture(order: any, expected: { jobId: string; cents: number }) {
  if (order.status !== 'COMPLETED' || order.purchase_units?.length !== 1) throw new Error('Payment is not completed. No cash has been added.');
  const unit = order.purchase_units[0];
  const captures = unit.payments?.captures;
  if (unit.custom_id !== expected.jobId || unit.amount?.currency_code !== 'USD' || unit.amount?.value !== (expected.cents / 100).toFixed(2) || captures?.length !== 1) throw new Error('The PayPal order does not match the job and expected amount.');
  const capture = captures[0];
  if (!capture.id || capture.status !== 'COMPLETED' || capture.amount?.currency_code !== 'USD' || capture.amount?.value !== (expected.cents / 100).toFixed(2)) throw new Error('The captured payment does not match the expected amount.');
  const net=capture.seller_receivable_breakdown?.net_amount;
  const reportedNet=net?.currency_code==='USD'&&/^\d+\.\d{2}$/.test(net.value)?Math.round(Number(net.value)*100):undefined;
  return { id: String(capture.id), gross: expected.cents, ...(reportedNet!==undefined&&reportedNet<=expected.cents?{reportedNet}:{}) };
}
export function webhookVerificationBody(headers:Record<string,unknown>,raw:string,webhookId:string){
  const fields:Record<string,string>={'auth_algo':'paypal-auth-algo','cert_url':'paypal-cert-url','transmission_id':'paypal-transmission-id','transmission_sig':'paypal-transmission-sig','transmission_time':'paypal-transmission-time'};
  const envelope:Record<string,string>={webhook_id:webhookId};
  for(const [field,header]of Object.entries(fields)){if(typeof headers[header]!=='string'||!headers[header])throw new Error('Missing PayPal verification headers.');envelope[field]=headers[header] as string;}
  JSON.parse(raw);
  // Preserve exact received event bytes inside PayPal's verification envelope.
  return `${JSON.stringify(envelope).slice(0,-1)},"webhook_event":${raw}}`;
}
