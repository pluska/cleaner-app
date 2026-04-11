import { NextResponse } from "next/server";
import { db } from "@/db";
import { taskTemplates, taskInstances, userProfiles } from "@/db/schema";
import { eq, and, lt, gt } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { rrulestr } from "rrule";

// /api/cron/daily
// SECURE ENDPOINT: Must pass Authorization: Bearer <CRON_SECRET> or similar
export async function GET(request: Request) {
  // 1. Authorization
  const authHeader = request.headers.get("Authorization");
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    // --- 1. INSTANTIATE PAST DUE TASKS ---
    // Find all active templates that have their next occurrence before or exactly on today.
    // They should become actual 'pending' instances so the user can see they missed them.
    const dueTemplates = await db
      .select()
      .from(taskTemplates)
      .where(
        and(
          eq(taskTemplates.isArchived, false),
          lt(taskTemplates.nextOccurrence, today) // Strictly past due or today based on time
        )
      );

    const instancesToInsert: (typeof taskInstances.$inferInsert)[] = [];
    
    for (const template of dueTemplates) {
      if (!template.nextOccurrence) continue;
      
      const occurrenceDateStr = template.nextOccurrence.toISOString().split("T")[0];
      
      // Check if instance already exists to avoid duplicates
      const [existing] = await db
        .select()
        .from(taskInstances)
        .where(
            and(
                eq(taskInstances.templateId, template.id), 
                eq(taskInstances.dueDate, occurrenceDateStr)
            )
        );
        
      if (!existing) {
        instancesToInsert.push({
          id: uuidv4(),
          templateId: template.id,
          dueDate: occurrenceDateStr,
          status: "pending"
        });
      }

      // Calculate the NEXT occurrence for this template and update it
      try {
        const parsedRule = rrulestr(template.rrule, { dtstart: new Date(template.startDate) });
        const nextDate = parsedRule.after(template.nextOccurrence, false); // get next one
        
        if (nextDate) {
          await db
            .update(taskTemplates)
            .set({ nextOccurrence: nextDate })
            .where(eq(taskTemplates.id, template.id));
        }
      } catch (err) {
         console.error(`Error advancing RRULE for template ${template.id}`, err);
      }
    }

    if (instancesToInsert.length > 0) {
      await db.insert(taskInstances).values(instancesToInsert);
    }
    
    // --- 2. BREAK ABANDONED STREAKS ---
    // Anyone whose lastActivityDate is OLDER than yesterday loses their streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Find profiles with streak > 0 but last activity < yesterday
    const abandonedProfiles = await db
      .select()
      .from(userProfiles)
      .where(
        and(
          gt(userProfiles.currentStreak, 0),
          lt(userProfiles.lastActivityDate, yesterdayStr)
        )
      );
      
    for (const profile of abandonedProfiles) {
      await db
        .update(userProfiles)
        .set({ currentStreak: 0 })
        .where(eq(userProfiles.userId, profile.userId));
    }

    return NextResponse.json({ 
      success: true, 
      instancesCreated: instancesToInsert.length,
      streaksReset: abandonedProfiles.length
    });
    
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
