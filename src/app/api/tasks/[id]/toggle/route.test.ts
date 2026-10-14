// @vitest-environment node
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {testDatabase,seedUser,seedTask} from '@/test/d1';
const state=vi.hoisted(()=>({binding:undefined as unknown,user:'u1',complete:vi.fn()}));
vi.mock('@/db',()=>({database:()=>state.binding}));
vi.mock('@/auth',()=>({auth:async()=>state.user?{user:{id:state.user}}:null}));
vi.mock('../complete/route',()=>({POST:state.complete}));
import {PATCH} from './route';
let fixture:ReturnType<typeof testDatabase>;
beforeEach(()=>{fixture=testDatabase();state.binding=fixture.binding;state.user='u1';seedUser(fixture.sqlite);seedTask(fixture.sqlite);fixture.sqlite.exec("INSERT INTO taskInstances VALUES('i1','t1','2026-10-05','pending',NULL)");state.complete.mockReset().mockResolvedValue(Response.json({completed:true}));});
afterEach(()=>fixture.close());
const call=()=>PATCH(new Request('http://localhost'),{params:Promise.resolve({id:'i1'})});
it('requires authentication',async()=>{state.user='';expect((await call()).status).toBe(401);});
it('rejects cross-user access',async()=>{state.user='u2';expect((await call()).status).toBe(404);});
it('routes pending completion through the reward operation',async()=>{expect((await call()).status).toBe(200);expect(state.complete).toHaveBeenCalledTimes(1);});
it('rejects undo without changing progress',async()=>{fixture.sqlite.exec("UPDATE taskInstances SET status='completed' WHERE id='i1'");expect((await call()).status).toBe(409);expect(state.complete).not.toHaveBeenCalled();});
