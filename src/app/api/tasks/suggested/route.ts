import { z } from 'zod';
import { auth } from '@/auth';
import { database } from '@/db';
import { roomTypes } from '@/libs/ai/schemas';
import { calendarDate } from '@/libs/task-schedule';
import { localDay } from '@/libs/kingdom-rules';
import { userTimezone } from '@/services/rescheduleService';
import { readJson, errorResponse, HttpError } from '@/libs/server/http';
import english from '@/data/templates/task-templates-en.json';
import spanish from '@/data/templates/task-templates-es.json';

const inputSchema = z.object({
  rooms: z.array(z.enum(roomTypes)).min(1).max(20),
  lifestyle: z.enum(['busy','moderate','relaxed']),
  cleaning_preferences: z.enum(['minimal','standard','thorough']),
  pets: z.boolean().default(false), children: z.boolean().default(false), allergies: z.boolean().default(false),
  language: z.enum(['en','es']).default('en'),
});
const key = (name:string) => name.toLowerCase().trim().replace(/[\s-]+/g, '_');
const aliases = (name:string) => [key(name), key(name).replace(/_room$/, '')];

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new HttpError(401, 'Unauthorized');
    const parsed = inputSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400, 'Invalid preferences');
    const input = parsed.data, userId = session.user.id, d = database();
    const rooms = (await d.prepare('SELECT id,name FROM rooms WHERE userId=?').bind(userId).all<{id:string;name:string}>()).results;
    const timezone = await userTimezone(userId);
    const now = calendarDate(localDay(new Date(), timezone), timezone).getTime();
    const tasks: {id:string; title:string}[] = [];
    // Stable IDs make retries and concurrent initialization safe. Never mutate imported JSON.
    for (const template of (input.language === 'es' ? spanish : english).templates) {
      const category = key(template.category);
      if (!input.rooms.some(r => aliases(r).includes(category))) continue;
      const room = rooms.find(r => aliases(r.name).includes(category));
      if (!room) continue;
      let frequency = template.base_frequency_days || 7;
      if (input.lifestyle === 'busy') frequency = Math.max(frequency * 1.5, 7);
      if (input.lifestyle === 'relaxed') frequency = Math.max(frequency * .7, 3);
      if (input.cleaning_preferences === 'minimal') frequency = Math.max(frequency * 1.8, 10);
      if (input.cleaning_preferences === 'thorough') frequency = Math.max(frequency * .6, 2);
      if (input.pets) frequency = Math.max(frequency * .8, 3);
      if (input.children) frequency = Math.max(frequency * .8, 3);
      if (input.allergies) frequency = Math.max(frequency * .7, 2);
      const id = `suggested:${userId}:${template.id}`;
      const writes = [d.prepare(`INSERT INTO taskTemplates
        (id,userId,roomId,title,description,importanceLevel,expReward,healthImpact,scientificSource,rrule,startDate,nextOccurrence)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`)
        .bind(id,userId,room.id,template.name,template.description,template.importance_level,template.importance_level*5,template.health_impact,template.source_url,`FREQ=DAILY;INTERVAL=${Math.round(frequency)}`,now,now)];
      for (const [i, step] of template.subtasks.entries()) writes.push(d.prepare(`INSERT INTO taskSubtemplates
        (id,templateId,title,description,estimatedMinutes,orderIndex,isRequired,expReward,difficulty)
        VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`)
        .bind(`${id}:step:${i}`,id,step.title,step.description,step.estimated_minutes,step.order_index,Number(step.is_required),5,step.difficulty));
      await d.batch(writes);
      tasks.push({id,title:template.name});
    }
    if (!tasks.length) throw new HttpError(400, 'No matching rooms. Set up your home rooms first.');
    return Response.json({success:true, tasks, templatesCount:tasks.length});
  } catch (error) { return errorResponse(error); }
}
