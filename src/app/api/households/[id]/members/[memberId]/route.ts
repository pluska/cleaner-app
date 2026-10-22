import { householdRequest } from '@/libs/server/household-http';
import { removeMember } from '@/services/householdService';

export function DELETE(request: Request, context: {params: Promise<{id:string;memberId:string}>}) {
  return householdRequest(request, async userId => {
    const {id,memberId}=await context.params;
    await removeMember(userId,id,memberId);
    return {success:true};
  });
}
