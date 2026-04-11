import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { rewardsStore, userRewards, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rewardId } = await request.json();
    if (!rewardId) {
      return NextResponse.json({ error: "rewardId is required" }, { status: 400 });
    }

    const [reward] = await db
      .select()
      .from(rewardsStore)
      .where(eq(rewardsStore.id, rewardId));

    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id));

    if (!profile || profile.coins < reward.cost) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Deduct coins and add reward
    await db
      .update(userProfiles)
      .set({ coins: profile.coins - reward.cost })
      .where(eq(userProfiles.userId, session.user.id));

    await db.insert(userRewards).values({
      userId: session.user.id,
      rewardId: reward.id,
    });

    return NextResponse.json({ success: true, newBalance: profile.coins - reward.cost });
  } catch (error) {
    console.error("Error computing reward purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
