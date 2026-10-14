// @vitest-environment node
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {expect,it,vi} from 'vitest';
it('retires installed workers and deletes private legacy API caches while keeping unrelated caches',async()=>{
 const events=new Map<string,(event:{waitUntil:ReturnType<typeof vi.fn>})=>void>();
 const claim=vi.fn(),unregister=vi.fn(),remove=vi.fn();
 runInNewContext(readFileSync('public/sw.js','utf8'),{
  self:{addEventListener:(name:string,handler:typeof events extends Map<string,infer H>?H:never)=>events.set(name,handler),skipWaiting:vi.fn(),clients:{claim},registration:{unregister}},
  caches:{keys:async()=>['apis','pages','workbox-precache-v2-old','unrelated-cache'],delete:remove},
 });
 const waitUntil=vi.fn();events.get('activate')!({waitUntil});await waitUntil.mock.calls[0][0];
 expect(remove.mock.calls.map(c=>c[0])).toEqual(['apis','pages','workbox-precache-v2-old']);
 expect(claim).toHaveBeenCalledOnce();expect(unregister).toHaveBeenCalledOnce();
 expect(events.has('fetch')).toBe(false);
});
