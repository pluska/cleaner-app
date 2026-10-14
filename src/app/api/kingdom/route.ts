import { readJson, HttpError } from "@/libs/server/http";
import { auth } from "@/auth";
import { database } from "@/db";
import { getKingdom, saveLayout, ensureKingdom } from "@/services/kingdomService";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try { return Response.json(await getKingdom(session.user.id)); }
  catch { return Response.json({ error: "Kingdom unavailable" }, { status: 503 }); }
}
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { version, positions } = await readJson(request);
    if (typeof version !== 'number' || !Array.isArray(positions)) throw new HttpError(400,'Invalid layout');
    const result = await saveLayout(session.user.id, version, positions as {id:string;x:number;y:number}[]);
    return Response.json(result, { status: result.status });
  } catch { return Response.json({ error: "Unable to save layout" }, { status: 400 }); }
}
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  try {
    const { resting, timezone, buildingId, roomId } = await readJson(request);
    const d = database();
    await ensureKingdom(userId);
    if (typeof timezone === "string") {
      new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
      await d.prepare("UPDATE userProfiles SET timezone=? WHERE userId=?").bind(timezone,userId).run();
    }
    if (typeof resting === "boolean") await d.batch([
      d.prepare("UPDATE kingdomBuildings SET restoredAt=restoredAt+?-(SELECT restStartedAt FROM userProfiles WHERE userId=?) WHERE userId=? AND EXISTS (SELECT 1 FROM userProfiles WHERE userId=? AND resting=1 AND restStartedAt IS NOT NULL) AND ?=0").bind(Date.now(),userId,userId,userId,Number(resting)),
      d.prepare("UPDATE userProfiles SET restStartedAt=CASE WHEN ?=1 AND resting=0 THEN ? WHEN ?=0 THEN NULL ELSE restStartedAt END,resting=? WHERE userId=?").bind(Number(resting),Date.now(),Number(resting),Number(resting),userId),
    ]);
    if (typeof roomId === "string" && typeof buildingId === "string") {
      const result = await d.prepare("UPDATE kingdomRoomLinks SET buildingId=? WHERE roomId=? AND EXISTS (SELECT 1 FROM rooms WHERE id=? AND userId=?) AND EXISTS (SELECT 1 FROM kingdomBuildings WHERE id=? AND userId=?) RETURNING roomId").bind(buildingId,roomId,roomId,userId,buildingId,userId).all();
      if (!result.results.length) return Response.json({ error: "Invalid room or building" }, { status: 400 });
    }
    return Response.json(await getKingdom(userId));
  } catch { return Response.json({ error: "Invalid settings" }, { status: 400 }); }
}
