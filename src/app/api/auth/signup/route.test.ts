// @vitest-environment node
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {testDatabase,seedUser} from '@/test/d1';
const state=vi.hoisted(()=>({binding:undefined as unknown}));
vi.mock('@/db',()=>({database:()=>state.binding}));
import {POST} from './route';
let fixture:ReturnType<typeof testDatabase>;
beforeEach(()=>{fixture=testDatabase();state.binding=fixture.binding;});afterEach(()=>fixture.close());
const request=(body:unknown)=>new Request('http://localhost/api/auth/signup',{method:'POST',body:JSON.stringify(body)});
it.each([{email:'invalid',password:'Password1'},{email:'u@example.com',password:'short'},{email:'u@example.com',password:'lowercaseonly1'}])('rejects invalid registration',async body=>expect((await POST(request(body))).status).toBe(400));
it('creates normalized user and profile atomically without returning credentials',async()=>{
 const res=await POST(request({email:' U@Example.com ',password:'Password1'}));expect(res.status).toBe(201);
 expect(fixture.sqlite.prepare('SELECT email FROM users').get()!.email).toBe('u@example.com');
 expect(fixture.sqlite.prepare('SELECT count(*) AS n FROM userProfiles').get()!.n).toBe(1);
 expect(await res.json()).not.toHaveProperty('user');
});
it('returns identical success for existing and new emails',async()=>{
 seedUser(fixture.sqlite);
 const old=await POST(request({email:'u1@example.com',password:'Password1'}));
 const fresh=await POST(request({email:'u2@example.com',password:'Password1'}));
 expect(old.status).toBe(fresh.status);expect(await old.json()).toEqual(await fresh.json());
});
it('rolls back account creation if profile creation fails',async()=>{
 fixture.sqlite.exec("CREATE TRIGGER profile_failure BEFORE INSERT ON userProfiles BEGIN SELECT RAISE(ABORT,'test'); END");
 expect((await POST(request({email:'u@example.com',password:'Password1'}))).status).toBe(500);
 expect(fixture.sqlite.prepare('SELECT count(*) AS n FROM users').get()!.n).toBe(0);
});
