import 'server-only';
import { database } from '@/db';
import { HttpError, textField } from '@/libs/server/http';
import { digest, normalizeEmail } from '@/libs/server/security';
import type { HouseholdDetail, HouseholdList, HouseholdSummary } from '@/types/household';

function householdName(value: unknown) {
  return textField(value, 'household_name', 80).normalize('NFC');
}
const ownerGuard = 'EXISTS(SELECT 1 FROM households h WHERE h.id=? AND h.ownerId=?)';

export async function listHouseholds(userId: string): Promise<HouseholdList> {
  const d = database();
  const { results } = await d.prepare(`SELECT h.id,h.name,CASE WHEN h.ownerId=? THEN 'owner' ELSE 'member' END role,
    (SELECT count(*) FROM householdMembers x WHERE x.householdId=h.id) memberCount
    FROM households h JOIN householdMembers m ON m.householdId=h.id WHERE m.userId=? ORDER BY h.createdAt,h.id`).bind(userId,userId).all<HouseholdSummary>();
  const preference = await d.prepare('SELECT householdId FROM householdPreferences WHERE userId=?').bind(userId).first<{householdId:string}>();
  return { households: results, activeHouseholdId: results.find(h=>h.id===preference?.householdId)?.id ?? results[0]?.id ?? null };
}

export async function createHousehold(userId: string, name: unknown) {
  const d = database(), id = crypto.randomUUID();
  const result = await d.batch([
    d.prepare(`INSERT INTO households(id,name,ownerId,createdAt) SELECT ?,?,?,?
      WHERE (SELECT count(*) FROM householdMembers WHERE userId=?)<10 RETURNING id`).bind(id,householdName(name),userId,Date.now(),userId),
    d.prepare(`INSERT INTO householdPreferences(userId,householdId) SELECT userId,householdId FROM householdMembers WHERE householdId=? AND userId=?
      ON CONFLICT(userId) DO UPDATE SET householdId=excluded.householdId`).bind(id,userId),
  ]);
  if (!result[0].results.length) throw new HttpError(409,'household_limit');
  return { id };
}

export async function selectHousehold(userId: string, householdId: string) {
  const result = await database().prepare(`INSERT INTO householdPreferences(userId,householdId)
    SELECT userId,householdId FROM householdMembers WHERE userId=? AND householdId=?
    ON CONFLICT(userId) DO UPDATE SET householdId=excluded.householdId RETURNING householdId`).bind(userId,householdId).all();
  if (!result.results.length) throw new HttpError(404,'household_not_found');
}

export async function getHousehold(userId: string, householdId: string): Promise<HouseholdDetail> {
  const d=database();
  // Read all projections in one D1 batch so removal cannot race a later member-data read.
  const membership = 'EXISTS(SELECT 1 FROM householdMembers a WHERE a.householdId=? AND a.userId=?)';
  const result = await d.batch([
    d.prepare(`SELECT h.id,h.name,CASE WHEN h.ownerId=? THEN 'owner' ELSE 'member' END role,
      (SELECT count(*) FROM householdMembers x WHERE x.householdId=h.id) memberCount FROM households h WHERE h.id=? AND ${membership}`).bind(userId,householdId,householdId,userId),
    d.prepare(`SELECT m.userId,coalesce(nullif(trim(u.name),''),u.email,'Camarada') name,
      CASE WHEN h.ownerId=m.userId THEN 'owner' ELSE 'member' END role,m.joinedAt
      FROM householdMembers m JOIN users u ON u.id=m.userId JOIN households h ON h.id=m.householdId
      WHERE m.householdId=? AND ${membership} ORDER BY role DESC,m.joinedAt,m.userId`).bind(householdId,householdId,userId),
    d.prepare(`SELECT id,email,createdAt,expiresAt,revokedAt,acceptedAt FROM householdInvitations
      WHERE householdId=? AND ${ownerGuard} ORDER BY (acceptedAt IS NULL AND revokedAt IS NULL AND expiresAt>?) DESC,createdAt DESC LIMIT 50`).bind(householdId,householdId,userId,Date.now()),
  ]);
  const household = result[0].results[0] as unknown as HouseholdSummary | undefined;
  if (!household) throw new HttpError(404,'household_not_found');
  return {...household,members:result[1].results as unknown as HouseholdDetail['members'],invitations:result[2].results as unknown as HouseholdDetail['invitations']};
}

export async function inviteMember(userId: string, householdId: string, value: unknown) {
  const email=normalizeEmail(value),d=database(),now=Date.now();
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
  const expiresAt=now+7*86_400_000,id=crypto.randomUUID();
  const result=await d.prepare(`INSERT INTO householdInvitations(id,householdId,invitedBy,email,tokenHash,createdAt,expiresAt)
    SELECT ?,?,?,?,?,?,? WHERE ${ownerGuard}
    AND (SELECT count(*) FROM householdInvitations WHERE householdId=? AND acceptedAt IS NULL AND revokedAt IS NULL AND expiresAt>?)<20
    RETURNING id`).bind(id,householdId,userId,email,await digest(token),now,expiresAt,householdId,userId,householdId,now).all();
  if (!result.results.length) throw new HttpError(403,'invite_not_allowed');
  // Only the creator sees the raw token, once. It is never stored in a retrievable form.
  return { id, token, expiresAt };
}

export async function revokeInvitation(userId: string, householdId: string, invitationId: string) {
  const result=await database().prepare(`UPDATE householdInvitations SET revokedAt=? WHERE id=? AND householdId=?
    AND acceptedAt IS NULL AND revokedAt IS NULL AND ${ownerGuard} RETURNING id`).bind(Date.now(),invitationId,householdId,householdId,userId).all();
  if (!result.results.length) throw new HttpError(404,'invitation_unavailable');
}

export async function inspectInvitation(userId: string, token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new HttpError(410,'invitation_unavailable');
  const result=await database().prepare(`SELECT i.householdId,h.name,i.expiresAt,i.acceptedAt,i.acceptedBy,
    EXISTS(SELECT 1 FROM householdMembers m WHERE m.householdId=i.householdId AND m.userId=?) isMember
    FROM householdInvitations i JOIN households h ON h.id=i.householdId JOIN users u ON u.id=?
    WHERE i.tokenHash=? AND i.revokedAt IS NULL AND i.expiresAt>? AND h.ownerId=i.invitedBy AND lower(u.email)=i.email`).bind(userId,userId,await digest(token),Date.now()).first<{householdId:string;name:string;expiresAt:number;acceptedAt:number|null;acceptedBy:string|null;isMember:number}>();
  if (!result || (result.acceptedAt!==null && (result.acceptedBy!==userId || !result.isMember))) throw new HttpError(410,'invitation_unavailable');
  return { householdId:result.householdId,name:result.name,expiresAt:result.expiresAt,accepted:result.acceptedAt!==null };
}

export async function acceptInvitation(userId: string, token: string) {
  const invitation=await inspectInvitation(userId,token);
  if (invitation.accepted) { await selectHousehold(userId,invitation.householdId); return {householdId:invitation.householdId}; }
  const d=database(),hash=await digest(token),claim=crypto.randomUUID(),now=Date.now();
  const result=await d.batch([
    d.prepare(`UPDATE householdInvitations SET acceptedBy=?,acceptedAt=?,acceptanceId=? WHERE tokenHash=?
      AND acceptedAt IS NULL AND revokedAt IS NULL AND expiresAt>? AND email=(SELECT lower(email) FROM users WHERE id=?)
      AND EXISTS(SELECT 1 FROM households h WHERE h.id=householdId AND h.ownerId=invitedBy) RETURNING householdId`).bind(userId,now,claim,hash,now,userId),
    d.prepare(`INSERT INTO householdMembers(householdId,userId,joinedAt) SELECT householdId,acceptedBy,acceptedAt FROM householdInvitations
      WHERE tokenHash=? AND acceptanceId=? ON CONFLICT(householdId,userId) DO NOTHING`).bind(hash,claim),
    d.prepare(`INSERT INTO householdPreferences(userId,householdId) SELECT acceptedBy,householdId FROM householdInvitations
      WHERE tokenHash=? AND acceptanceId=? ON CONFLICT(userId) DO UPDATE SET householdId=excluded.householdId`).bind(hash,claim),
  ]);
  if (!result[0].results.length) {
    // A concurrent acceptance may have completed for this same account.
    const current=await inspectInvitation(userId,token);
    if (!current.accepted) throw new HttpError(410,'invitation_unavailable');
  }
  return {householdId:invitation.householdId};
}

export async function removeMember(userId: string, householdId: string, memberId: string) {
  const result=await database().prepare(`DELETE FROM householdMembers WHERE householdId=? AND userId=?
    AND NOT EXISTS(SELECT 1 FROM households WHERE id=? AND ownerId=?)
    AND (userId=? OR ${ownerGuard}) RETURNING userId`).bind(householdId,memberId,householdId,memberId,userId,householdId,userId).all();
  if (!result.results.length) throw new HttpError(403,'member_removal_not_allowed');
}

export async function transferHousehold(userId: string, householdId: string, memberId: string) {
  const result=await database().prepare(`UPDATE households SET ownerId=? WHERE id=? AND ownerId=? AND ownerId!=?
    AND EXISTS(SELECT 1 FROM householdMembers WHERE householdId=? AND userId=?) RETURNING id`).bind(memberId,householdId,userId,memberId,householdId,memberId).all();
  if (!result.results.length) throw new HttpError(403,'transfer_not_allowed');
}
