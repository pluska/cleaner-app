import { auth } from '@/auth';
import { TaskService } from '@/services/taskService';
import { userTimezone } from '@/services/rescheduleService';
import { errorResponse, HttpError } from '@/libs/server/http';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new HttpError(401, 'Unauthorized');
    const month = new URL(request.url).searchParams.get('month');
    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month.startsWith('0000')) throw new HttpError(400, 'Invalid month');
    const start = `${month}-01`;
    const endDate = new Date(`${start}T00:00:00Z`);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1, 0);
    const tasks = await TaskService.getTasksForRange(session.user.id, start, endDate.toISOString().slice(0, 10), await userTimezone(session.user.id));
    return Response.json({ days: Object.entries(tasks).map(([date, tasks]) => ({ date, total: tasks.length, completed: tasks.filter(t => t.completed).length })) });
  } catch (error) { return errorResponse(error); }
}
