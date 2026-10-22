// @vitest-environment node
import {beforeEach,it,expect,vi} from 'vitest';
import {NextRequest,type NextFetchEvent} from 'next/server';
const {authorize}=vi.hoisted(()=>({authorize:vi.fn()}));
vi.mock('next-auth',()=>({default:()=>({auth:()=>authorize})}));
import {proxy} from './proxy';
beforeEach(()=>{vi.clearAllMocks();});
it('keeps protected-page redirects on the request host and preserves session cookies',async()=>{
 authorize.mockResolvedValue(new Response(null,{status:302,headers:{location:'https://production.example/auth/login','set-cookie':'synthetic=1; HttpOnly'}}));
 const request=new NextRequest('https://preview.example/onboarding',{headers:{host:'preview.example'}});
 const response=await proxy(request,{} as NextFetchEvent);
 expect(response?.headers.get('location')).toBe('https://preview.example/auth/login');
 expect(response?.headers.get('set-cookie')).toBe('synthetic=1; HttpOnly');
});
it('preserves non-navigation responses',async()=>{
 const response=new Response('next',{status:200});authorize.mockResolvedValue(response);
 expect(await proxy(new NextRequest('https://example.com/dashboard'),{} as NextFetchEvent)).toBe(response);
});
