// Test-process-only transport. Never imported by the application or dev server.
const original=globalThis.fetch,orders=new Map();let sequence=0;
globalThis.fetch=async(url,options={})=>{
  const target=String(url);if(!target.startsWith('https://api-m.sandbox.paypal.com/'))return original(url,options);
  const route=new URL(target).pathname,body=options.body?JSON.parse(String(options.body).startsWith('{')?String(options.body):'{}'):{};
  const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
  if(route==='/v1/oauth2/token'){if(options.body!=='grant_type=client_credentials')return json({error:'bad oauth'},400);return json({access_token:'test-token',expires_in:3600});}
  if(route==='/v2/checkout/orders'&&options.method==='POST'){const id=`ORDER${String(++sequence).padStart(8,'0')}`,order={id,status:'APPROVED',purchase_units:body.purchase_units,links:[{rel:'payer-action',href:`https://www.sandbox.paypal.com/checkoutnow?token=${id}`}]};orders.set(id,order);return json(order,201);}
  const match=route.match(/^\/v2\/checkout\/orders\/([^/]+)(\/capture)?$/);
  if(match){const order=orders.get(match[1]);if(!order)return json({error:'unknown order'},404);if(match[2]){order.status='COMPLETED';order.purchase_units[0].payments={captures:[{id:`CAPTURE${match[1]}`,status:'COMPLETED',amount:order.purchase_units[0].amount,seller_receivable_breakdown:{net_amount:{currency_code:'USD',value:(Number(order.purchase_units[0].amount.value)-50).toFixed(2)}}}]};}return json(order);}
  if(route==='/v1/notifications/verify-webhook-signature'){
    if(body.transmission_sig!=='valid-test-signature')return json({verification_status:'FAILURE'});
    if(body.webhook_event.event_type==='PAYMENT.CAPTURE.REFUNDED'){const order=orders.get(body.webhook_event.resource.supplementary_data.related_ids.order_id);if(order?.purchase_units[0].payments)order.purchase_units[0].payments.captures[0].status='REFUNDED';}
    return json({verification_status:'SUCCESS'});
  }
  return json({error:'unhandled test path'},404);
};
