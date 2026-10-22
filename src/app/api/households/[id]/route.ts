import { householdRequest } from '@/libs/server/household-http';
import { readJson, textField, HttpError } from '@/libs/server/http';
import { getHousehold, selectHousehold, transferHousehold } from '@/services/householdService';

type Context = {params: Promise<{id:string}>};
export async function GET(request: Request, context: Context) {
  return householdRequest(request, async userId => getHousehold(userId,(await context.params).id));
}
export async function PATCH(request: Request, context: Context) {
  return householdRequest(request, async userId => {
    const {id}=await context.params,body=await readJson(request);
    if (body.action==='select') await selectHousehold(userId,id);
    else if (body.action==='transfer') await transferHousehold(userId,id,textField(body.memberId,'memberId',128));
    else throw new HttpError(400,'invalid_action');
    return {success:true};
  });
}
