import { auth } from '@/auth';
import { database } from '@/db';
import { readJson, errorResponse, HttpError } from '@/libs/server/http';
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new HttpError(401, 'Unauthorized');
    const {rewardId,requestId} = await readJson(request,4096);
    if (typeof rewardId !== 'string' || !rewardId || rewardId.length>200 || typeof requestId !== 'string' || requestId.length<8 || requestId.length>100)
      throw new HttpError(400,'rewardId and requestId required');
    const d=database(), userId=session.user.id, id=`${userId}:${requestId}`;
    const prior=await d.prepare('SELECT rewardId FROM userRewards WHERE id=?').bind(id).first<{rewardId:string}>();
    if (prior && prior.rewardId!==rewardId) throw new HttpError(409,'Request already used');
    // A reward unlocks once per user, even when separate requests race with different IDs.
    await d.prepare(`INSERT OR IGNORE INTO userRewards(id,userId,rewardId,purchasedAt)
      SELECT ?,?,?,? FROM rewardsStore r JOIN userProfiles p ON p.userId=?
      WHERE r.id=? AND r.isPurchasable=1 AND r.cost>=0 AND p.coins>=r.cost
      AND NOT EXISTS(SELECT 1 FROM userRewards WHERE userId=? AND rewardId=?)`)
      .bind(id,userId,rewardId,Date.now(),userId,rewardId,userId,rewardId).run();
    const bought=await d.prepare('SELECT rewardId FROM userRewards WHERE id=?').bind(id).first<{rewardId:string}>();
    if (!bought) throw new HttpError(400,'Reward unavailable or insufficient balance');
    if (bought.rewardId!==rewardId) throw new HttpError(409,'Request already used');
    const profile=await d.prepare('SELECT coins FROM userProfiles WHERE userId=?').bind(userId).first<{coins:number}>();
    return Response.json({success:true,newBalance:profile!.coins});
  } catch (error) { return errorResponse(error); }
}
