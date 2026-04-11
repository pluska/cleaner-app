import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { rewardsStore, userRewards, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get available rewards
    let allRewards = await db.select().from(rewardsStore);

    if (allRewards.length === 0) {
      const MOCK_REWARDS = [
        { title: "1 Hour Video Games", cost: 50, icon: "Gamepad2", color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Movie Night Choice", cost: 150, icon: "Ticket", color: "text-purple-500", bg: "bg-purple-50" },
        { title: "Ice Cream Trip", cost: 200, icon: "IceCream", color: "text-pink-500", bg: "bg-pink-50" },
        { title: "New Book", cost: 300, icon: "BookOpen", color: "text-green-500", bg: "bg-green-50" },
        { title: "Mystery Gift", cost: 500, icon: "Gift", color: "text-yellow-500", bg: "bg-yellow-50" },
        { title: "Pizza Party", cost: 1000, icon: "PartyPopper", color: "text-red-500", bg: "bg-red-50" },
      ];
      await db.insert(rewardsStore).values(MOCK_REWARDS);
      allRewards = await db.select().from(rewardsStore);
    }

    // Get user purchased rewards
    const purchased = await db
      .select()
      .from(userRewards)
      .where(eq(userRewards.userId, session.user.id));

    // Get user wallet
    const [profile] = await db
      .select({ coins: userProfiles.coins })
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id));

    const purchasedIds = new Set(purchased.map((p) => p.rewardId));

    // Map the status
    const rewardsWithStatus = allRewards.map((reward) => ({
      ...reward,
      isPurchased: purchasedIds.has(reward.id),
      iconType: reward.icon || "Gift",
    }));

    return NextResponse.json({ 
      rewards: rewardsWithStatus, 
      balance: profile?.coins || 0 
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
