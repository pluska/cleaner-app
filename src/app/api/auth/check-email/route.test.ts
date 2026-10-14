// @vitest-environment node
import {it,expect,vi} from 'vitest';
vi.mock('@/libs/server/security',async()=>{const actual=await vi.importActual<typeof import('@/libs/server/security')>('@/libs/server/security');return {...actual,throttleAuth:vi.fn()};});
import {POST} from './route';
it('does not expose account existence',async()=>{
 const response=await POST(new Request('http://localhost',{method:'POST',body:JSON.stringify({email:'u@example.com'})}));
 expect(response.status).toBe(200);expect(await response.json()).not.toHaveProperty('exists');
});
it('validates email before handling the request',async()=>{expect((await POST(new Request('http://localhost',{method:'POST',body:'{}'}))).status).toBe(400);});
