import { auth } from '@/auth';
import { readJson, errorResponse, HttpError } from './http';
import { moveOccurrence, userTimezone } from '@/services/rescheduleService';
import { localDay } from '@/libs/kingdom-rules';
export function moveRoute(mode: 'today'|'tomorrow'|'date'|'schedule') {
  return async (request: Request, {params}: {params:Promise<{id:string}>}) => {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new HttpError(401,'Unauthorized');
      const {id} = await params;
      const body = request.body ? await readJson(request) : {};
      let target = body.due_date ?? body.newDueDate;
      if (mode === 'today' || mode === 'tomorrow') {
        const today = localDay(new Date(),await userTimezone(session.user.id));
        target = mode === 'today' ? today : new Date(Date.parse(today)+86_400_000).toISOString().slice(0,10);
      }
      // All moves affect one occurrence. Series edits require the dedicated template editor.
      if (body.isRecurring === true) throw new HttpError(400,'Move one occurrence by providing originalDueDate');
      const task = await moveOccurrence(session.user.id,id,target as string,body.originalDueDate as string|undefined);
      return Response.json({task});
    } catch (error) { return errorResponse(error); }
  };
}
