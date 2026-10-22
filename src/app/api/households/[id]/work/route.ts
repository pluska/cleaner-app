import { householdRequest } from '@/libs/server/household-http';
import { HttpError, readJson } from '@/libs/server/http';
import { addSharedRoom, addSharedTask, archiveSharedTask, assignSharedTask, completeSharedTask, requestHandoff, respondHandoff, saveAvailability, sharedProposal, sharedTimezone, workBoard } from '@/services/sharedWorkService';

type Context={params:Promise<{id:string}>};
export function GET(request:Request,context:Context){
  return householdRequest(request,async userId=>workBoard(userId,(await context.params).id,new URL(request.url).searchParams.get('start')??undefined));
}
export function POST(request:Request,context:Context){
  return householdRequest(request,async userId=>{
    const {id}=await context.params,body=await readJson(request);
    switch(body.action){
      case 'room':return addSharedRoom(userId,id,body);
      case 'task':return addSharedTask(userId,id,body);
      case 'availability':await saveAvailability(userId,id,body);break;
      case 'assign':await assignSharedTask(userId,id,body);break;
      case 'complete':return completeSharedTask(userId,id,body);
      case 'handoff':return requestHandoff(userId,id,body);
      case 'respond':await respondHandoff(userId,id,body);break;
      case 'archive':await archiveSharedTask(userId,id,body);break;
      case 'timezone':await sharedTimezone(userId,id,body.timezone);break;
      case 'preview':return sharedProposal(userId,id,body);
      case 'publish':return sharedProposal(userId,id,body,true);
      default:throw new HttpError(400,'invalid_action');
    }
    return {success:true};
  });
}
