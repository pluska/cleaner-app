import { database } from "@/db";
import { BUILDINGS, corruption, localDay, roomKind, validPositions } from "@/libs/kingdom-rules";

export type KingdomBuilding = { id: string; kind: string; level: number; x: number; y: number; restoredAt: number; corruption: number };
export async function ensureKingdom(userId: string) {
  const d = database();
  const now = Date.now();
  await d.batch([
    d.prepare("INSERT OR IGNORE INTO userProfiles (userId) VALUES (?)").bind(userId),
    d.prepare("INSERT OR IGNORE INTO kingdomState (userId) VALUES (?)").bind(userId),
    ...BUILDINGS.map(b => d.prepare("INSERT OR IGNORE INTO kingdomBuildings (id,userId,kind,level,x,y,restoredAt) VALUES (?,?,?,1,?,?,?)").bind(`${userId}:${b.kind}`, userId, b.kind, b.x, b.y, now - 3 * 86400000)),
  ]);
  const rooms = await d.prepare("SELECT id,name FROM rooms WHERE userId=?").bind(userId).all<{ id: string; name: string }>();
  if (rooms.results.length) await d.batch(rooms.results.map(r => d.prepare("INSERT OR IGNORE INTO kingdomRoomLinks (roomId,buildingId) VALUES (?,?)").bind(r.id, `${userId}:${roomKind(r.name)}`)));
}

export async function getKingdom(userId: string) {
  await ensureKingdom(userId);
  const d = database();
  const profile = await d.prepare("SELECT * FROM userProfiles WHERE userId=?").bind(userId).first<{ xp: number; coins: number; level: number; timezone: string; resting: number; restStartedAt: number | null; currentStreak: number }>();
  if (!profile) throw new Error("Profile unavailable");
  const today = localDay(new Date(), profile.timezone);
  const state = await d.prepare("SELECT version FROM kingdomState WHERE userId=?").bind(userId).first<{ version: number }>();
  const buildings = await d.prepare("SELECT * FROM kingdomBuildings WHERE userId=? ORDER BY kind").bind(userId).all<KingdomBuilding>();
  const count = await d.prepare("SELECT COUNT(*) AS total FROM rewardEvents WHERE userId=? AND templateId IS NOT NULL").bind(userId).first<{ total: number }>();
  const weekStart = new Date(`${today}T00:00:00Z`);
  weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
  const weekly = await d.prepare("SELECT COUNT(*) AS total FROM rewardEvents WHERE userId=? AND templateId IS NOT NULL AND activityDate>=?").bind(userId, weekStart.toISOString().slice(0,10)).first<{ total: number }>();
  const links = await d.prepare("SELECT l.roomId,l.buildingId FROM kingdomRoomLinks l JOIN rooms r ON r.id=l.roomId WHERE r.userId=?").bind(userId).all();
  return { version: state!.version, profile, today, buildings: buildings.results.map(b => ({ ...b, corruption: corruption(b.restoredAt, profile.resting ? profile.restStartedAt ?? Date.now() : Date.now()) })), links: links.results, campaign: { completed: Math.min(7, count?.total ?? 0), total: 7 }, weekly: { completed: weekly?.total ?? 0, target: 5, unlocked: (weekly?.total ?? 0) >= 5 } };
}

export async function saveLayout(userId: string, version: number, positions: {id:string;x:number;y:number}[]) {
  if (!Number.isInteger(version) || !Array.isArray(positions) || !validPositions(positions) || !positions.every(p => BUILDINGS.some(b => p.id === `${userId}:${b.kind}`))) return { success: false, error: "Invalid layout", status: 400 };
  const d = database();
  // All writes use the same version guard inside one D1 transaction.
  const result = await d.batch([
    ...positions.map(p => d.prepare("UPDATE kingdomBuildings SET x=?,y=? WHERE id=? AND userId=? AND EXISTS (SELECT 1 FROM kingdomState WHERE userId=? AND version=?)").bind(p.x,p.y,p.id,userId,userId,version)),
    d.prepare("UPDATE kingdomState SET version=version+1 WHERE userId=? AND version=? RETURNING version").bind(userId,version),
  ]);
  return result[4].results.length ? { success: true, version: version + 1, status: 200 } : { success: false, error: "Layout changed in another session. Reload before saving.", status: 409 };
}
