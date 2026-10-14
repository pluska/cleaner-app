import { scheduledDays } from '@/libs/task-schedule';
import { db } from '../db';
import { taskTemplates, taskInstances, taskSubtemplates, rooms } from '../db/schema';
import { eq, and, gte, lte, getTableColumns } from 'drizzle-orm';

export class TaskService {
  static async getTasksForDate(userId: string, targetDate: Date, timezone = 'UTC') {
    const day = targetDate.toISOString().slice(0, 10);
    return (await this.getTasksForRange(userId, day, day, timezone))[day];
  }

  // Four scoped queries regardless of task count or number of calendar days.
  // Joins avoid D1's 100-bind limit and per-task subquery overhead.
  static async getTasksForRange(userId: string, start: string, end: string, timezone = 'UTC') {
    const templates = await db.select().from(taskTemplates)
      .where(and(eq(taskTemplates.userId, userId), eq(taskTemplates.isArchived, false)));
    const userRooms = await db.select().from(rooms).where(eq(rooms.userId, userId));
    const instances = await db.select(getTableColumns(taskInstances)).from(taskInstances)
      .innerJoin(taskTemplates, eq(taskInstances.templateId, taskTemplates.id))
      .where(and(eq(taskTemplates.userId, userId), gte(taskInstances.dueDate, start), lte(taskInstances.dueDate, end)));
    const steps = await db.select(getTableColumns(taskSubtemplates)).from(taskSubtemplates)
      .innerJoin(taskTemplates, eq(taskSubtemplates.templateId, taskTemplates.id))
      .where(and(eq(taskTemplates.userId, userId), eq(taskTemplates.isArchived, false)));
    const roomNames = new Map(userRooms.map(r => [r.id, r.name]));
    const instanceMap = new Map(instances.map(i => [`${i.templateId}:${i.dueDate}`, i]));
    const stepsByTemplate = new Map<string, typeof steps>();
    for (const step of steps) {
      const group = stepsByTemplate.get(step.templateId) ?? [];
      group.push(step);
      stepsByTemplate.set(step.templateId, group);
    }
    const baseTasks = templates.map(template => {
      const subtasks = (stepsByTemplate.get(template.id) ?? []).sort((a, b) => a.orderIndex - b.orderIndex);
      return {
        ...template,
        description: template.description || undefined,
        room: (roomNames.get(template.roomId) ?? template.roomId).replace(/_/g, ' ').trim().toUpperCase(),
        duration: subtasks.reduce((sum, s) => sum + s.estimatedMinutes, 0) || 15,
        healthReason: template.healthImpact || undefined,
        sourceLink: template.scientificSource || undefined,
        difficulty: (template.importanceLevel >= 4 ? 'HIGH' : template.importanceLevel === 3 ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
        subtasks: subtasks.map(s => ({ ...s, duration: s.estimatedMinutes })),
      };
    });
    const schedules = new Map(baseTasks.map(task => {
      try { return [task.id, scheduledDays(task,start,end,timezone)] as const; }
      catch { return [task.id,new Set<string>()] as const; }
    }));
    const result: Record<string, (Omit<typeof baseTasks[number], "subtasks"> & { instanceId: string | null; completed: boolean; subtasks: (typeof baseTasks[number]['subtasks'][number] & {completed: boolean})[] })[]> = {};
    for (let date = Date.parse(start); date <= Date.parse(end); date += 86_400_000) {
      const day = new Date(date).toISOString().slice(0, 10);
      result[day] = baseTasks.flatMap(task => {
        const instance = instanceMap.get(`${task.id}:${day}`);
        if (instance?.status === 'skipped') return [];
        if (!instance && !schedules.get(task.id)?.has(day)) return [];
        const completed = instance?.status === 'completed';
        return [{ ...task, instanceId: instance?.id ?? null, completed, subtasks: task.subtasks.map(s => ({ ...s, completed })) }];
      });
    }
    return result;
  }
}
