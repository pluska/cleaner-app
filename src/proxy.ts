import NextAuth from 'next-auth';
import type { NextMiddleware } from 'next/server';
import { authConfig } from './auth.config';

const passthrough: NextMiddleware = () => undefined;
const authorize = NextAuth(authConfig).auth(passthrough);
export const proxy: NextMiddleware = async (request,event) => {
  // Auth.js replaces the request origin with AUTH_URL/NEXTAUTH_URL internally.
  // Navigation within the app must stay on the actual preview/development host.
  const response = await authorize(request,event);
  if (!(response instanceof Response)) return response;
  const location = response.headers.get('location');
  if (!location) return response;
  const target = new URL(location,request.url);
  if (!['/auth/login','/dashboard'].includes(target.pathname)) return response;
  const result = new Response(response.body,response);
  const origin = new URL(request.url);
  const host = request.headers.get('host');
  if (host) origin.host = host;
  result.headers.set('location',new URL(`${target.pathname}${target.search}${target.hash}`,origin).href);
  return result;
};
export default proxy;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
};
