import { NextRequest } from 'next/server';
import { handlers } from '@/auth';
import { readBody, errorResponse } from '@/libs/server/http';
export const GET = handlers.GET;
export async function POST(request: NextRequest) {
  try {
    const body = await readBody(request,8192);
    return handlers.POST(new NextRequest(request.url,{method:'POST',headers:request.headers,body}));
  } catch(error) { return errorResponse(error); }
}
