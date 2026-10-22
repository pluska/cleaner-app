import { householdRequest } from '@/libs/server/household-http';
import { readJson } from '@/libs/server/http';
import { inviteMember } from '@/services/householdService';

export function POST(request: Request, context: {params: Promise<{id:string}>}) {
  return householdRequest(request, async userId => inviteMember(userId,(await context.params).id,(await readJson(request)).email),201);
}
