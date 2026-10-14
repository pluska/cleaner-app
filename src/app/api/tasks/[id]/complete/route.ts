import { auth } from "@/auth";
import { database } from "@/db";
import { localDay, validDay } from "@/libs/kingdom-rules";
import { ensureKingdom } from "@/services/kingdomService";
import { scheduledOn } from "@/libs/task-schedule";
import { readJson, errorResponse } from "@/libs/server/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const userId = session.user.id;
    const { dueDate } = await readJson(request);
    const { id } = await params;
    if (!validDay(dueDate)) return Response.json({ error: "Invalid due date" }, { status: 400 });
    await ensureKingdom(userId);
    const d = database();
    const profile = await d.prepare("SELECT timezone FROM userProfiles WHERE userId=?").bind(userId).first<{timezone:string}>();
    const today = localDay(new Date(),profile!.timezone);
    if (dueDate > today) return Response.json({ error: "Future tasks cannot be completed" }, { status: 400 });
    const template = await d.prepare("SELECT * FROM taskTemplates WHERE id=? AND userId=? AND isArchived=0").bind(id,userId).first<{rrule:string;startDate:number;endDate:number|null;expReward:number}>();
    if (!template) return Response.json({ error: "Task not found" }, { status: 404 });
    const instance = await d.prepare("SELECT status FROM taskInstances WHERE templateId=? AND dueDate=?").bind(id,dueDate).first<{status:string}>();
    if (instance?.status === "skipped" || (!instance && !scheduledOn(template,dueDate,profile!.timezone))) return Response.json({ error: "Task is not scheduled for this day" }, { status: 400 });
    const eventId = `task:${id}:${dueDate}`;
    const xp = Math.max(5,Math.min(30,template.expReward));
    const now = Date.now();
    // The trigger applies the entire reward exactly once, in this same transaction.
    await d.prepare("INSERT OR IGNORE INTO rewardEvents (id,userId,templateId,dueDate,activityDate,xp,coins,createdAt) SELECT ?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM taskInstances WHERE templateId=? AND dueDate=? AND status='completed')").bind(eventId,userId,id,dueDate,today,xp,Math.max(1,Math.floor(xp/5)),now,id,dueDate).run();
    const updated = await d.prepare("SELECT * FROM userProfiles WHERE userId=?").bind(userId).first();
    const event = await d.prepare("SELECT xp,coins FROM rewardEvents WHERE id=?").bind(eventId).first<{xp:number;coins:number}>();
    return Response.json({ profile:updated, rewards:{expEarned:event?.xp??0,coinsEarned:event?.coins??0},completed:true });
  } catch (error) { return errorResponse(error); }
}
