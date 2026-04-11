import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { weeklyActivity } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await db
      .select()
      .from(weeklyActivity)
      .where(eq(weeklyActivity.userId, session.user.id));

    // For missing days, fill with default zero
    const defaultDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const formattedData = defaultDays.map((day) => {
      const match = activities.find((a) => a.dayOfWeek === day);
      return {
        day,
        score: match?.score || 0,
        isToday: new Date().toLocaleDateString("en-US", { weekday: "short" }) === day,
      };
    });

    return NextResponse.json({ activities: formattedData });
  } catch (error) {
    console.error("Error fetching weekly activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
