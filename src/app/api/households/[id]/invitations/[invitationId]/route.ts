import { householdRequest } from '@/libs/server/household-http';
import { revokeInvitation } from '@/services/householdService';

export function DELETE(request: Request, context: {params: Promise<{id:string;invitationId:string}>}) {
  return householdRequest(request, async userId => {
    const {id,invitationId}=await context.params;
    await revokeInvitation(userId,id,invitationId);
    return {success:true};
  });
}
