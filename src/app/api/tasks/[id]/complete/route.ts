import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { taskTemplates, taskInstances, userProfiles, activityLog, taskTemplateTools, userTools } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth";
import { rrulestr } from "rrule";


// POST /api/tasks/[id]/complete - Complete task and apply gamification
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // id represents the Template ID for virtual tasks
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { dueDate } = body; // Format: YYYY-MM-DD

    if (!dueDate) {
      return NextResponse.json({ error: "dueDate is required to complete a virtual task" }, { status: 400 });
    }

    const p = await params;
    const templateId = p.id;

    // 1. Fetch the blueprint (TaskTemplate) to get exp rewards and verify ownership
    const [template] = await db
      .select()
      .from(taskTemplates)
      .where(and(eq(taskTemplates.id, templateId), eq(taskTemplates.userId, userId)));

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
      .where(eq(userProfiles.userId, userId));
      
    if (!profile) {
      [profile] = await db.insert(userProfiles).values({
        userId: userId,
        level: 1,
        xp: 0,
        coins: 0,
        currentStreak: 0,
        maxStreak: 0
      }).returning();
    }

    // --- STREAK LOGIC ---
    let newStreak = profile.currentStreak;
    let newMaxStreak = profile.maxStreak;
    const todayStr = new Date().toISOString().split("T")[0];
    
    if (profile.lastActivityDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      if (profile.lastActivityDate === yesterdayStr) {
        newStreak += 1; // Continued streak!
      } else if (profile.lastActivityDate !== todayStr) {
        newStreak = 1; // Broken streak, restart
      }
      
      if (newStreak > newMaxStreak) {
        newMaxStreak = newStreak;
      }
    } else {
      newStreak = 1; // First day!
      newMaxStreak = 1;
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
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        lastActivityDate: todayStr
      })
      .where(eq(userProfiles.userId, userId))
      .returning();

    // --- ACTIVITY LOGGING ---
    if (expReward > 0) {
      await db.insert(activityLog).values({
        userId: userId,
        type: "task_completion",
        amount: expReward,
        description: `Completed task: ${template.title}`
      });
      if (coinsEarned > 0) {
         await db.insert(activityLog).values({
          userId: userId,
          type: "coin_gain",
          amount: coinsEarned,
          description: `Coins earned from task: ${template.title}`
        });
      }
    }

    // --- DURABILITY LOGIC ---
    // Find what tools are required
    const requiredTools = await db
      .select()
      .from(taskTemplateTools)
      .where(eq(taskTemplateTools.templateId, templateId));

    const durabilityLost = [];
    if (requiredTools.length > 0) {
      // Find user equipped tools that match
      for (const reqTool of requiredTools) {
        // Just arbitrarily pick the first matching equipped tool to degrade
        const [equipped] = await db
          .select()
          .from(userTools)
          .where(and(
            eq(userTools.userId, userId), 
            eq(userTools.toolId, reqTool.toolId),
            eq(userTools.isEquipped, true)
          ));
        
        if (equipped && equipped.currentDurability > 0) {
          const loss = reqTool.durabilityLossOverride || 1; // Default to 1 if no override
          const newDurability = Math.max(0, equipped.currentDurability - loss);
          
          await db
            .update(userTools)
            .set({ 
              currentDurability: newDurability,
              updatedAt: new Date()
              // If it reaches 0, we could unequip it, but keeping it empty feels like a better UX so they repair it
            })
            .where(eq(userTools.id, equipped.id));
            
          durabilityLost.push({ toolId: reqTool.toolId, loss, remaining: newDurability });
        }
      }
    }

    // --- ADVANCE NEXT OCCURRENCE ---
    try {
      const parsedRule = rrulestr(template.rrule, { dtstart: new Date(template.startDate) });
      const completedDateObj = new Date(`${dueDate}T00:00:00.000Z`); // the day they just checked off
      // Calculate strictly AFTER the completed day (not today, the completed date)
      const nextDate = parsedRule.after(completedDateObj, false); 
      if (nextDate) {
        await db
          .update(taskTemplates)
          .set({ nextOccurrence: nextDate })
          .where(eq(taskTemplates.id, template.id));
      }
    } catch (err) {
      console.error("Failed to advance RRULE nextOccurrence:", err);
    }

    return NextResponse.json({
      taskInstance: instance,
      profile: updatedProfile,
      rewards: {
        expEarned: expReward,
        levelUp: newLevel > profile.level,
        coinsEarned: coinsEarned,
        currentStreak: newStreak
      },
      durabilityChanges: durabilityLost
    });
  } catch (error) {
    console.error("Unexpected error in task completion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
