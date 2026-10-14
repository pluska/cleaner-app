import { database } from '@/db';
import { HttpError } from '@/libs/server/http';
import { localDay, validDay } from '@/libs/kingdom-rules';
import { scheduledOn } from '@/libs/task-schedule';

export async function userTimezone(userId: string) {
  const profile = await database().prepare('SELECT timezone FROM userProfiles WHERE userId=?').bind(userId).first<{timezone:string}>();
  return profile?.timezone || 'UTC';
}
export async function moveOccurrence(userId: string, id: string, target: string, originalDay?: string) {
  if (!validDay(target)) throw new HttpError(400,'Invalid due date');
  const d = database(), timezone = await userTimezone(userId);
  if (target < localDay(new Date(),timezone)) throw new HttpError(400,'Due date cannot be in the past');
  const instance = await d.prepare(`SELECT i.* FROM taskInstances i JOIN taskTemplates t ON t.id=i.templateId WHERE i.id=? AND t.userId=? AND t.isArchived=0`).bind(id,userId).first<{id:string;templateId:string;dueDate:string;status:string}>();
  const templateId = instance?.templateId || id;
  const template = await d.prepare('SELECT * FROM taskTemplates WHERE id=? AND userId=? AND isArchived=0').bind(templateId,userId).first<{rrule:string;startDate:number;endDate:number|null}>();
  if (!template) throw new HttpError(404,'Task not found');
  const source = instance?.dueDate || originalDay;
  if (!source || !validDay(source)) throw new HttpError(400,'Original due date required');
  if (instance && instance.status !== 'pending') throw new HttpError(409,'Only pending tasks can be moved');
  if (!instance && !scheduledOn(template,source,timezone)) throw new HttpError(400,'Task is not scheduled for this day');
  if (target === source) return { id:instance?.id || null, templateId, dueDate: target, status:'pending' };
  if (scheduledOn(template,target,timezone)) throw new HttpError(409,'A task is already scheduled for that day');
  const instanceId = instance?.id || crypto.randomUUID();
  const destinationId = crypto.randomUUID();
  try {
    await d.batch([
      d.prepare(`INSERT INTO taskInstances(id,templateId,dueDate,status) VALUES(?,?,?,'skipped')
        ON CONFLICT(templateId,dueDate) DO UPDATE SET status='skipped'`).bind(instanceId,templateId,source),
      d.prepare("INSERT INTO taskInstances(id,templateId,dueDate,status) VALUES(?,?,?,'pending')").bind(destinationId,templateId,target),
    ]);
  } catch (error) {
    if (error instanceof Error && /UNIQUE|occurrence_locked/.test(error.message)) throw new HttpError(409,'Task has changed or the destination is occupied');
    throw error;
  }
  return { id:destinationId, templateId, dueDate: target, status: 'pending' };
}
