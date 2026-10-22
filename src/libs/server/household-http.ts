import { auth } from '@/auth';
import { errorResponse, HttpError } from './http';

export async function householdRequest(request: Request, action: (userId:string)=>Promise<unknown>, status=200) {
  try {
    const session=await auth();
    if (!session?.user?.id) throw new HttpError(401,'Unauthorized');
    const origin=request.headers.get('origin');
    if (request.method!=='GET' && origin) {
      // Next/Auth can rewrite request.url to AUTH_URL. The browser's actual Host
      // stays intact; do not compare preview navigation with that canonical URL.
      const host=request.headers.get('host')??new URL(request.url).host;
      let source: URL;
      try{source=new URL(origin);}catch{throw new HttpError(403,'invalid_origin');}
      if(!['http:','https:'].includes(source.protocol)||source.host!==host)throw new HttpError(403,'invalid_origin');
    }
    return Response.json(await action(session.user.id),{status,headers:{'Cache-Control':'no-store'}});
  } catch(error) { return errorResponse(error); }
}
