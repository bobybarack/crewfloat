import{existsSync,readFileSync,writeFileSync,chmodSync}from'node:fs';
import{randomBytes}from'node:crypto';
import{parse}from'dotenv';
const exists=existsSync('.env'),owner=process.argv.includes('--owner-access');
let source=readFileSync(exists?'.env':'.env.example','utf8');
if(exists&&(!owner||parse(source).OWNER_ACCESS_CODE)){console.log('A local .env already exists. It was left unchanged.');process.exit(0);}
if(owner){
  if((source.match(/^OWNER_ACCESS_CODE=/gm)||[]).length>1)throw new Error('Multiple OWNER_ACCESS_CODE entries exist. Resolve them locally before generating a code.');
  const line=`OWNER_ACCESS_CODE=${randomBytes(32).toString('base64url')}`;
  source=/^OWNER_ACCESS_CODE=.*$/m.test(source)?source.replace(/^OWNER_ACCESS_CODE=.*$/m,line):`${source}\n${line}\n`;
}
writeFileSync('.env',source,{flag:exists?'w':'wx',mode:0o600});chmodSync('.env',0o600);
console.log(exists?'Added owner access to the local .env; other settings were preserved.':'Created a private .env file. Enter credentials locally, then restart CrewFloat.');
if(owner)console.log('The generated access code is stored locally and is not printed.');
