// @vitest-environment node
import {beforeEach,it,expect,vi} from 'vitest';
const {auth,generate}=vi.hoisted(()=>({auth:vi.fn(),generate:vi.fn()}));
vi.mock('@/auth',()=>({auth}));vi.mock('@/libs/ai/generator',()=>({generateStructured:generate}));
import {POST} from './route';
import {NextRequest} from 'next/server';
const request=(body:unknown)=>new NextRequest('http://localhost/api/sparklin/chat',{method:'POST',body:JSON.stringify(body)});
beforeEach(()=>{vi.clearAllMocks();auth.mockResolvedValue({user:{id:'u1'}});});
it('blocks anonymous paid requests',async()=>{auth.mockResolvedValue(null);expect((await POST(request({message:'tell me a story'}))).status).toBe(401);expect(generate).not.toHaveBeenCalled();});
it('fails closed on authentication errors',async()=>{auth.mockRejectedValue(new Error());expect((await POST(request({message:'story'}))).status).toBe(500);expect(generate).not.toHaveBeenCalled();});
it.each([null,{},42,'a'.repeat(2001)])('rejects malformed messages',async message=>{expect((await POST(request({message}))).status).toBe(400);expect(generate).not.toHaveBeenCalled();});
it('rejects oversized request bodies',async()=>{expect((await POST(request({message:'a'.repeat(9000)}))).status).toBe(413);});
it.each(['wine stain: can I mix bleach and ammonia?','mancha de vino: mezclar lejía y vinagre'])('prioritizes chemical safety over stains: %s',async message=>{
 const data=await (await POST(request({message}))).json();expect(data.intent).toBe('POTIONS');expect(data.text.en).toBeTruthy();expect(data.text.es).toBeTruthy();expect(generate).not.toHaveBeenCalled();
});
it('keeps unknown chemical questions deterministic',async()=>{const data=await (await POST(request({message:'is this mixture safe?'}))).json();expect(data.intent).toBe('POTIONS');expect(generate).not.toHaveBeenCalled();});
it('does not let generated output trigger navigation',async()=>{generate.mockResolvedValue({value:{en:'Hello',es:'Hola',uiAction:{type:'EVIL'}},source:'openai'});const data=await (await POST(request({message:'tell me a story'}))).json();expect(data.uiAction).toBeUndefined();});
