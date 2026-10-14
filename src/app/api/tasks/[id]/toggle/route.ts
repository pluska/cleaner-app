import { auth } from '@/auth';
import { database } from '@/db';
import { HttpError, errorResponse } from '@/libs/server/http';
import { POST as complete } from '../complete/route';
export async function PATCH(request: Request, {params}: {params:Promise<{id:string}>}) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new HttpError(401,'Unauthorized');
    const {id} = await params;
    const instance = await database().prepare(`SELECT i.* FROM taskInstances i JOIN taskTemplates t ON t.id=i.templateId WHERE i.id=? AND t.userId=?`).bind(id,session.user.id).first<{templateId:string;dueDate:string;status:string}>();
    if (!instance) throw new HttpError(404,'Task not found');
    if (instance.status !== 'pending') throw new HttpError(409,'Completed quests cannot be undone. Las misiones completadas no se pueden deshacer.');
    const response = await complete(new Request(request.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dueDate:instance.dueDate})}),{params:Promise.resolve({id:instance.templateId})});
    if (!response.ok) return response;
    const result = await response.json();
    return Response.json({...result,task:{id,templateId:instance.templateId,dueDate:instance.dueDate,status:'completed',completed:true,isInstance:true}});
  } catch (error) { return errorResponse(error); }
}
