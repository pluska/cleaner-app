// @vitest-environment node
import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import {testDatabase,seedUser} from '@/test/d1';
const state=vi.hoisted(()=>({binding:undefined as unknown,env:{} as Record<string,string>}));
vi.mock('@/db',()=>({database:()=>state.binding}));
vi.mock('./env',()=>({serverEnv:(key:string)=>state.env[key]}));
import {consumeLimits,reserveAiUsage,digest,validatePassword} from './security';
import {sendResetEmail,redeemResetToken} from './recovery';
import {sessionIsCurrent} from './session';
import {readJson} from './http';
let fixture:ReturnType<typeof testDatabase>;
beforeEach(()=>{fixture=testDatabase();state.binding=fixture.binding;seedUser(fixture.sqlite);state.env={RESEND_API_KEY:'test',RESEND_FROM:'test@example.com',SITE_URL:'https://example.com',RESEND_SENDER_VERIFIED:'true'};});
afterEach(()=>{fixture.close();vi.unstubAllGlobals();vi.restoreAllMocks();});
describe('security database integration',()=>{
 it('enforces concurrent limits atomically and rolls back all buckets',async()=>{
  const buckets=[{key:'user',ceiling:2,expires:Date.now()+60000},{key:'global',ceiling:1,expires:Date.now()+60000}];
  const results=await Promise.allSettled([consumeLimits(buckets),consumeLimits(buckets)]);
  expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
  expect(results.find(r=>r.status==='rejected')).toMatchObject({reason:{status:429}});
  expect(fixture.sqlite.prepare('SELECT count FROM usageCounters WHERE key=?').get('user')!.count).toBe(1);
 });
 it('fails closed when the limiter database is unavailable',async()=>{
  state.binding={batch:()=>Promise.reject(new Error('down')),prepare:()=>({bind:()=>({})})};
  await expect(reserveAiUsage('u1')).rejects.toMatchObject({status:503});
 });
 it('reserves the configured per-user and global limits',async()=>{
  state.env.AI_USER_MINUTE_LIMIT='1';await reserveAiUsage('u1');await expect(reserveAiUsage('u1')).rejects.toMatchObject({status:429});
 });
 it('delivers a reset link while storing only its hash',async()=>{
  const fetchMock=vi.fn().mockResolvedValue(new Response('{}',{status:200}));vi.stubGlobal('fetch',fetchMock);
  await sendResetEmail('u1@example.com');
  const body=JSON.parse(fetchMock.mock.calls[0][1].body);
  const token=new URL(body.text.match(/https:\/\/\S+/)[0]).searchParams.get('token')!;
  expect(token).toHaveLength(64);
  const stored=fixture.sqlite.prepare('SELECT * FROM passwordResetTokens').get()!;
  expect(stored.tokenHash).toBe(await digest(token));expect(stored.tokenHash).not.toBe(token);
 });
 it('rejects unconfigured delivery and removes tokens on delivery failure',async()=>{
  state.env.RESEND_SENDER_VERIFIED='false';await expect(sendResetEmail('u1@example.com')).rejects.toMatchObject({status:503});
  state.env.RESEND_SENDER_VERIFIED='true';vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('{}',{status:500})));
  await sendResetEmail('u1@example.com');expect(fixture.sqlite.prepare('SELECT count(*) AS n FROM passwordResetTokens').get()!.n).toBe(0);
 });
 it('consumes once under concurrent reset, invalidates other tokens and old sessions',async()=>{
  for(const token of ['a','b'])fixture.sqlite.prepare('INSERT INTO passwordResetTokens VALUES(?,?,?)').run(await digest(token),'u1',Date.now()+60000);
  expect(await sessionIsCurrent('u1',0)).toBe(true);
  const results=await Promise.allSettled([redeemResetToken('a','new-hash'),redeemResetToken('a','other-hash')]);
  expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
  expect(fixture.sqlite.prepare('SELECT sessionVersion FROM users WHERE id=?').get('u1')!.sessionVersion).toBe(1);
  expect(fixture.sqlite.prepare('SELECT count(*) AS n FROM passwordResetTokens').get()!.n).toBe(0);
  expect(await sessionIsCurrent('u1',0)).toBe(false);expect(await sessionIsCurrent('u1',1)).toBe(true);expect(await sessionIsCurrent('u1',undefined)).toBe(false);
 });
 it('rejects expired tokens without modifying passwords',async()=>{
  fixture.sqlite.prepare('INSERT INTO passwordResetTokens VALUES(?,?,?)').run(await digest('expired'),'u1',Date.now()-1);
  await expect(redeemResetToken('expired','changed')).rejects.toMatchObject({status:400});
  expect(fixture.sqlite.prepare('SELECT hashedPassword FROM users WHERE id=?').get('u1')!.hashedPassword).toBe('old-hash');
 });
 it.each(['short','alllowercase1','A'.repeat(73)+'a1'])('rejects unsafe passwords: %s',password=>expect(()=>validatePassword(password)).toThrow());
 it('bounds streamed bodies even without a content-length header',async()=>{
  await expect(readJson(new Request('http://localhost',{method:'POST',body:JSON.stringify({x:'a'.repeat(100)})}),30)).rejects.toMatchObject({status:413});
  await expect(readJson(new Request('http://localhost',{method:'POST',body:'{'}))).rejects.toMatchObject({status:400});
 });
});
