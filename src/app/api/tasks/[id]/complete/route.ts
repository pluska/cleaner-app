import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { taskTemplates, taskInstances, userProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const MOCK_USER_ID = "user-123";

// POST /api/tasks/[id]/complete - Complete task and apply gamification
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } } // id represents the Template ID for virtual tasks
) {
  try {
    const body = await request.json();
    const { dueDate } = body; // Format: YYYY-MM-DD

    if (!dueDate) {
      return NextResponse.json({ error: "dueDate is required to complete a virtual task" }, { status: 400 });
    }

    const templateId = params.id;

    // 1. Fetch the blueprint (TaskTemplate) to get exp rewards and verify ownership
    const [template] = await db
      .select()
      .from(taskTemplates)
      .where(and(eq(taskTemplates.id, templateId), eq(taskTemplates.userId, MOCK_USER_ID)));

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // 2. Check if an instance already exists for this exact day
    const [existingInstance] = await db
      .select()
      .from(taskInstances)
      .where(and(eq(taskInstances.templateId, templateId), eq(taskInstances.dueDate, dueDate)));

    let instance;

    if (existingInstance) {
      // It already exists, just update its status
      if (existingInstance.status === "completed") {
        return NextResponse.json({ error: "Task already completed for this day" }, { status: 400 });
      }

      [instance] = await db
        .update(taskInstances)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(taskInstances.id, existingInstance.id))
        .returning();
    } else {
      // It's a Virtual task turning real! Insert the Instance
      [instance] = await db
        .insert(taskInstances)
        .values({
          id: uuidv4(),
          templateId: templateId,
          dueDate: dueDate,
          status: "completed",
          completedAt: new Date(),
        })
        .returning();
    }

    // 3. Apply Gamification Rewards to UserProfile
    const expReward = template.expReward || 0;
    
    // Create/Update profile
    let [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, MOCK_USER_ID));
      
    if (!profile) {
      [profile] = await db.insert(userProfiles).values({
        userId: MOCK_USER_ID,
        level: 1,
        xp: 0,
        coins: 0
      }).returning();
    }

    const newXp = profile.xp + expReward;
    const newLevel = Math.floor(newXp / 100) + 1; // 100 XP per level scaling
    const coinsEarned = Math.floor(expReward / 10);
    const newCoins = profile.coins + coinsEarned;

    const [updatedProfile] = await db
      .update(userProfiles)
      .set({
        xp: newXp,
        level: newLevel,
        coins: newCoins,
      })
      .where(eq(userProfiles.userId, MOCK_USER_ID))
      .returning();

    return NextResponse.json({
      taskInstance: instance,
      profile: updatedProfile,
      rewards: {
        expEarned: expReward,
        levelUp: newLevel > profile.level,
        coinsEarned: coinsEarned,
      },
    });
  } catch (error) {
    console.error("Unexpected error in task completion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
