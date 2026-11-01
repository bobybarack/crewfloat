import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import express,{type Request}from'express';
import {z}from'zod';

const cookieName='crewfloat_owner';
function equal(a:string,b:string){return timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest());}
export function deploymentSettings(){
  const host=process.env.BIND_HOST||'127.0.0.1',origin=process.env.APP_ORIGIN||'http://127.0.0.1:5178',code=process.env.OWNER_ACCESS_CODE||'';
  const url=new URL(origin);
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('APP_ORIGIN must be an HTTP(S) origin without a path, query or credentials.');
  if(code&&code.length<24)throw new Error('OWNER_ACCESS_CODE must contain at least 24 characters. Generate one with npm run setup -- --owner-access.');
  if(!['127.0.0.1','localhost','::1'].includes(host)){
    if(!code)throw new Error('OWNER_ACCESS_CODE is required before binding beyond loopback.');
    if(url.protocol!=='https:'&&!['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw new Error('A remote APP_ORIGIN must use HTTPS.');
  }
  return{host,origin:url.origin,code,secure:url.protocol==='https:'};
}
export function ownerAccess(code:string,secure:boolean){
  const router=express.Router();
  const signature=(payload:string)=>createHmac('sha256',code).update(payload).digest('base64url');
  const authenticated=(req:Request)=>{
    if(!code)return true;
    const token=req.headers.cookie?.split('; ').find(c=>c.startsWith(`${cookieName}=`))?.slice(cookieName.length+1);
    if(!token)return false;
    const [payload,mac,...rest]=token.split('.');
    if(!payload||!mac||rest.length||!equal(mac,signature(payload)))return false;
    try{const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));return Number.isSafeInteger(data.exp)&&data.exp>Date.now();}catch{return false;}
  };
  const attempts=new Map<string,{count:number;until:number}>();
  router.get('/',(req,res)=>res.json({required:Boolean(code),authenticated:authenticated(req)}));
  router.post('/',(req,res)=>{
    if(!code)return res.json({authenticated:true,required:false});
    const input=z.object({code:z.string().max(512)}).parse(req.body),key=req.socket.remoteAddress||'unknown',now=Date.now();
    for(const[ip,value]of attempts)if(value.until<now)attempts.delete(ip);
    const count=attempts.get(key);
    if(count&&count.count>=8&&count.until>now)return res.status(429).json({error:'Too many attempts. Try again in ten minutes.'});
    if(!equal(input.code,code)){attempts.set(key,{count:(count?.count||0)+1,until:now+600000});return res.status(401).json({error:'Owner access code is incorrect.'});}
    attempts.delete(key);
    const payload=Buffer.from(JSON.stringify({exp:now+8*3600000,nonce:randomBytes(16).toString('hex')})).toString('base64url');
    res.cookie(cookieName,`${payload}.${signature(payload)}`,{httpOnly:true,sameSite:'strict',secure,path:'/',maxAge:8*3600000});
    res.json({authenticated:true,required:true});
  });
  router.post('/logout',(_req,res)=>{res.clearCookie(cookieName,{path:'/',httpOnly:true,sameSite:'strict',secure});res.json({authenticated:false});});
  const protect:express.RequestHandler=(req,res,next)=>{
    if(req.path.startsWith('/pay/'))return next();
    if(!authenticated(req))return res.status(401).json({error:'Owner access is required. Sign in to open the workspace.'});
    next();
  };
  return{router,protect,authenticated,required:Boolean(code)};
}
