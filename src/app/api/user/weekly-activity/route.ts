import { auth } from '@/auth';
import { database } from '@/db';
import { localDay } from '@/libs/kingdom-rules';
import { userTimezone } from '@/services/rescheduleService';
import { errorResponse, HttpError } from '@/libs/server/http';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new HttpError(401, 'Unauthorized');
    const userId = session.user.id, d = database();
    const offset = new URL(request.url).searchParams.get('week') ?? '0';
    if (!['0','1'].includes(offset)) throw new HttpError(400, 'Invalid week');
    const today = localDay(new Date(), await userTimezone(userId));
    const monday = new Date(`${today}T00:00:00Z`);
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7) - Number(offset)*7);
    const start = monday.toISOString().slice(0,10);
    const end = new Date(monday.getTime() + 7*86_400_000).toISOString().slice(0,10);
    const activity = (await d.prepare(`SELECT activityDate AS date,SUM(xp) AS score FROM rewardEvents
      WHERE userId=? AND templateId IS NOT NULL AND activityDate>=? AND activityDate<? GROUP BY activityDate`)
      .bind(userId,start,end).all<{date:string;score:number}>()).results;
    const summary = await d.prepare(`SELECT COUNT(*) AS completedTasks,COALESCE(SUM(xp),0) AS totalXp,
      COALESCE(SUM((SELECT COALESCE(SUM(estimatedMinutes),15) FROM taskSubtemplates s WHERE s.templateId=e.templateId)),0) AS estimatedMinutes
      FROM rewardEvents e WHERE userId=? AND templateId IS NOT NULL`).bind(userId).first();
    const profile = await d.prepare('SELECT level,currentStreak,lastActivityDate,resting FROM userProfiles WHERE userId=?').bind(userId)
      .first<{level:number;currentStreak:number;lastActivityDate:string|null;resting:number}>();
    const yesterday = new Date(Date.parse(today)-86_400_000).toISOString().slice(0,10);
    const currentStreak = profile && (profile.resting || (profile.lastActivityDate && profile.lastActivityDate >= yesterday)) ? profile.currentStreak : 0;
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return Response.json({activities: days.map((day,i) => {
      const date = new Date(monday.getTime()+i*86_400_000).toISOString().slice(0,10);
      return {day,date,score:activity.find(a=>a.date===date)?.score ?? 0,isToday:date===today};
    }), summary, profile: {level:profile?.level ?? 1,currentStreak}});
  } catch (error) { return errorResponse(error); }
}
