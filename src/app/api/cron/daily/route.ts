import { database } from '@/db';
import { localDay } from '@/libs/kingdom-rules';
import { calendarDate, scheduledOn } from '@/libs/task-schedule';
import { digest } from '@/libs/server/security';
import { serverEnv } from '@/libs/server/env';
import { errorResponse } from '@/libs/server/http';
import { rrulestr } from 'rrule';

export async function GET(request: Request) {
  const secret = serverEnv('CRON_SECRET');
  if (!secret) return Response.json({error:'Daily job unavailable'}, {status:503});
  // Hash both values to avoid length-dependent secret comparisons.
  if (await digest(request.headers.get('Authorization') ?? '') !== await digest(`Bearer ${secret}`))
    return Response.json({error:'Unauthorized'}, {status:401});
  try {
    const d = database();
    const now = new Date();
    // Bound each invocation; repeat the authenticated job to catch up older cursors.
    const templates = (await d.prepare(`SELECT t.*,COALESCE(p.timezone,'UTC') AS timezone FROM taskTemplates t
      LEFT JOIN userProfiles p ON p.userId=t.userId WHERE t.isArchived=0 AND t.nextOccurrence<=? ORDER BY t.nextOccurrence LIMIT 15`)
      .bind(now.getTime()).all<{id:string;rrule:string;startDate:number;endDate:number|null;nextOccurrence:number;timezone:string}>()).results;
    let instancesCreated = 0;
    for (const template of templates) {
      const day = localDay(new Date(template.nextOccurrence), template.timezone);
      const ruleText = template.rrule.split(/\r?\n/).filter(line=>!line.startsWith('DTSTART')).join('\n');
      const startDay = localDay(new Date(template.startDate),template.timezone);
      const next = rrulestr(ruleText,{dtstart:new Date(`${startDay}T00:00:00Z`)}).after(new Date(`${day}T00:00:00Z`),false);
      const nextDate = next ? calendarDate(next.toISOString().slice(0,10),template.timezone).getTime() : null;
      const writes = [];
      if (scheduledOn(template,day,template.timezone)) writes.push(d.prepare(`INSERT INTO taskInstances(id,templateId,dueDate,status)
        SELECT ?,?,?,'pending' WHERE EXISTS(SELECT 1 FROM taskTemplates WHERE id=? AND nextOccurrence=? AND isArchived=0)
        ON CONFLICT(templateId,dueDate) DO NOTHING`).bind(crypto.randomUUID(),template.id,day,template.id,template.nextOccurrence));
      writes.push(d.prepare('UPDATE taskTemplates SET nextOccurrence=? WHERE id=? AND nextOccurrence=?')
        .bind(template.endDate && nextDate && nextDate>template.endDate ? null : nextDate,template.id,template.nextOccurrence));
      const result = await d.batch(writes);
      if (writes.length>1) instancesCreated += result[0].meta.changes;
    }
    // One SQL update uses each user's local yesterday and preserves resting streaks.
    const result = await d.prepare(`UPDATE userProfiles SET currentStreak=0
      WHERE currentStreak>0 AND resting=0 AND timezone='UTC'
        AND (lastActivityDate IS NULL OR lastActivityDate < date(?,'-1 day'))`)
      .bind(now.toISOString().slice(0,10)).run();
    // Non-UTC streaks are derived from their timezone at reads/completion; no UTC reset.
    return Response.json({success:true,instancesCreated,streaksReset:result.meta.changes,processed:templates.length});
  } catch (error) { return errorResponse(error); }
}
