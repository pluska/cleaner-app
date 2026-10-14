// Synthetic-account smoke test for an isolated LOCAL Worker/D1 instance only.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const origin = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8787';
assert.ok(['127.0.0.1','localhost'].includes(new URL(origin).hostname), 'Use isolated local state, never production');
const cookies = new Map();
async function request(path, data, options = {}) {
  const headers = {...(data ? {'Content-Type':'application/json'} : {}), ...options.headers};
  if (!options.anonymous) headers.Cookie = [...cookies].map(([k,v])=>`${k}=${v}`).join('; ');
  const response = await fetch(origin+path,{method:options.method || (data ? 'POST':'GET'),headers,body:data ? (typeof data==='string'?data:JSON.stringify(data)) : undefined,redirect:'manual'});
  if (!options.anonymous) for (const cookie of response.headers.getSetCookie()) {const first=cookie.split(';')[0],index=first.indexOf('=');cookies.set(first.slice(0,index),first.slice(index+1));}
  return response;
}
const runId=crypto.randomUUID(), email=`smoke-${runId}@example.invalid`, password=`Smoke-${runId}-A1`;
assert.equal((await request('/api/sparklin/chat',{message:'a cleaning quest'},{anonymous:true})).status,401);
assert.equal((await request('/api/auth/signup',{email,password,name:'Smoke test'})).status,201);
const csrf=await (await request('/api/auth/csrf')).json();
const login=await request('/api/auth/callback/credentials',new URLSearchParams({csrfToken:csrf.csrfToken,email,password,callbackUrl:origin+'/dashboard'}).toString(),{headers:{'Content-Type':'application/x-www-form-urlencoded','X-Auth-Return-Redirect':'1'}});
assert.equal(login.status,200,'Credentials callback must succeed');
const session=await (await request('/api/auth/session')).json();
assert.ok(session.user?.id,'Signed-in session must have a user ID');
const chemical=await (await request('/api/sparklin/chat',{message:'wine stain: bleach and ammonia?'})).json();
assert.equal(chemical.intent,'POTIONS');assert.ok(chemical.text.en && chemical.text.es);
const lore=await (await request('/api/sparklin/chat',{message:'Tell me about dust dragons'})).json();assert.ok(lore.text.en && lore.text.es);
assert.equal((await request('/api/sparklin/chat',{message:{unexpected:true}})).status,400);
const area=await (await request('/api/user/areas',{area_name:'kitchen',area_type:'kitchen'})).json();assert.ok(area.area?.id);
const today=new Date().toISOString().slice(0,10);
const task=await (await request('/api/tasks',{title:'Smoke weekly task',roomId:area.area.id,frequency:'weekly',startDate:today})).json();assert.ok(task.task?.id);
const tomorrow=new Date(Date.parse(today)+86400000).toISOString().slice(0,10);
assert.equal((await request(`/api/tasks/${task.task.id}/reschedule`,{due_date:tomorrow,originalDueDate:today},{method:'PATCH'})).status,200);
const original=await (await request(`/api/tasks?date=${today}`)).json();assert.equal(original.tasks.length,0);
const moved=await (await request(`/api/tasks?date=${tomorrow}`)).json();assert.equal(moved.tasks.length,1);
const recommendations=await (await request('/api/ai/generate-tasks',{home_type:'house',lifestyle:'busy',cleaning_preferences:'standard',language:'es',rooms:[{name:'Kitchen',type:'kitchen'}]})).json();
assert.ok(recommendations.recommendations?.length);assert.ok(recommendations.recommendations.every(t=>t.source==='fallback'));
assert.equal((await request('/api/auth/forgot-password',{email})).status,503,'Unconfigured recovery must not claim delivery');
const check=await (await request('/api/auth/check-email',{email})).json();assert.equal('exists' in check,false);
// Exercise reward transactions through the real Worker, including duplicate requests.
const completionTask=await (await request('/api/tasks',{title:'Smoke completion',roomId:area.area.id,frequency:'once',startDate:today})).json();
const before=await (await request('/api/user/profile')).json();
const completions=await Promise.all([request(`/api/tasks/${completionTask.task.id}/complete`,{dueDate:today}),request(`/api/tasks/${completionTask.task.id}/complete`,{dueDate:today})]);
assert.ok(completions.every(r=>r.status===200));
const after=await (await request('/api/user/profile')).json();assert.equal(after.profile.xp-before.profile.xp,15);
const completed=await (await request(`/api/tasks?date=${today}`)).json();
const occurrence=completed.tasks.find(t=>t.id===completionTask.task.id);
assert.equal((await request(`/api/tasks/${occurrence.instanceId}/toggle`,undefined,{method:'PATCH'})).status,409);
// Seed a synthetic reset token into THIS isolated local D1; no email is sent.
const token=crypto.randomUUID(), tokenHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),b=>b.toString(16).padStart(2,'0')).join('');
const sqlValue=value=>"'"+String(value).replaceAll("'","''")+"'";
const directory=mkdtempSync(join(tmpdir(),'cleaner-smoke-'));
try {
 const file=join(directory,'reset.sql');
 writeFileSync(file,`INSERT INTO passwordResetTokens(tokenHash,userId,expires) VALUES(${sqlValue(tokenHash)},${sqlValue(session.user.id)},${Date.now()+60000});`);
 execFileSync('node_modules/.bin/wrangler',['d1','execute','cleaner-planner-db','--local','--persist-to','.wrangler/security-review','--file',file,'--yes'],{stdio:'pipe',env:{...process.env,CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV:'false'}});
 const resets=await Promise.all([request('/api/auth/reset-password',{token,newPassword:password+'2'}),request('/api/auth/reset-password',{token,newPassword:password+'3'})]);
 assert.deepEqual(resets.map(r=>r.status).sort(),[200,400]);
 assert.equal((await request('/api/sparklin/chat',{message:'hello'})).status,401,'Password reset must revoke the old session');
 assert.equal((await (await request('/api/auth/session')).json())?.user,undefined);
} finally {rmSync(directory,{recursive:true,force:true});}
console.log('PASS: local Worker signup/login, static bilingual chat, safety routing, validation, room ownership, rescheduling, Spanish task fallback, reward idempotency, undo rejection, concurrent reset redemption, session revocation, and disabled email delivery.');
