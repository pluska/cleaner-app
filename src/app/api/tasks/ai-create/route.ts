import { z } from 'zod';
import { auth } from '@/auth';
import { database } from '@/db';
import { taskSchema } from '@/libs/ai/schemas';
import { enrichTask } from '@/libs/ai/validators';
import { readJson, errorResponse, HttpError } from '@/libs/server/http';
const persistedTask = taskSchema.strip().extend({subtasks:z.array(taskSchema.shape.subtasks.element.strip()).min(1).max(12)});
const roomKey = (name:string) => name.trim().toLowerCase().replaceAll(' ','_');
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new HttpError(401,'Unauthorized');
    const {tasks} = await readJson(request,131_072);
    if (!Array.isArray(tasks) || !tasks.length || tasks.length>12) throw new HttpError(400,'Invalid tasks data');
    const d = database(), userId = session.user.id;
    const userRooms = (await d.prepare('SELECT id,name FROM rooms WHERE userId=?').bind(userId).all<{id:string;name:string}>()).results;
    const createdTasks: {task_name:string;template_id:string}[] = [], errors: {task:string;error:string}[] = [];
    for (const raw of tasks) {
      const parsed = persistedTask.safeParse(raw);
      if (!parsed.success) { errors.push({task:'Invalid task',error:'Invalid task fields'}); continue; }
      const task = enrichTask(parsed.data,'openai');
      const found = userRooms.find(r=>roomKey(r.name)===task.room_specific);
      const general = task.room_specific==='general';
      if (!found && !general) {errors.push({task:task.task_name,error:'Room does not belong to this user'});continue;}
      const roomId = found?.id || `general:${userId}`, id = crypto.randomUUID(), now = Date.now();
      try {
        const writes = [];
        if (!found && general) writes.push(d.prepare("INSERT INTO rooms(id,userId,name) VALUES(?,?,'general') ON CONFLICT(id) DO NOTHING").bind(roomId,userId));
        writes.push(d.prepare(`INSERT INTO taskTemplates(id,userId,roomId,title,description,importanceLevel,expReward,healthImpact,scientificSource,aiExplanation,rrule,startDate,nextOccurrence)
          SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM rooms WHERE id=? AND userId=?)`).bind(id,userId,roomId,task.task_name,task.friendly_explanation,task.importance_level,task.exp_reward,task.health_impact,task.source_url,task.reasoning,`FREQ=DAILY;INTERVAL=${task.frequency_days}`,now,now,roomId,userId));
        for (const [i,sub] of task.subtasks!.entries()) writes.push(d.prepare(`INSERT INTO taskSubtemplates(id,templateId,title,description,estimatedMinutes,orderIndex,isRequired,expReward,difficulty) VALUES(?,?,?,?,?,?,?,?,?)`).bind(crypto.randomUUID(),id,sub.title,sub.description || '',sub.estimated_minutes,i,sub.is_required?1:0,5,sub.difficulty));
        await d.batch(writes);
        createdTasks.push({task_name:task.task_name,template_id:id});
      } catch { errors.push({task:task.task_name,error:'Task could not be saved. Please retry.'}); }
    }
    return Response.json({success:errors.length===0,created_tasks:createdTasks,errors,total_created:createdTasks.length,total_errors:errors.length});
  } catch (error) { return errorResponse(error); }
}
