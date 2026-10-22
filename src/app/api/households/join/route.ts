import { householdRequest } from '@/libs/server/household-http';
import { readJson, textField } from '@/libs/server/http';
import { inspectInvitation, acceptInvitation } from '@/services/householdService';

export function POST(request: Request) {
  return householdRequest(request, async userId => {
    const body=await readJson(request),token=textField(body.token,'token',64);
    return body.preview===true ? inspectInvitation(userId,token) : acceptInvitation(userId,token);
  });
}
