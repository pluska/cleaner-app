import { auth } from "@/auth";
import { db } from "@/db";
import { taskTemplates, taskInstances } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { localDay } from "@/libs/kingdom-rules";
import { scheduledOn } from "@/libs/task-schedule";
import { userTimezone } from "@/services/rescheduleService";

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const timezone = await userTimezone(session.user.id);
    const today = localDay(new Date(),timezone);

    // Get all active user tasks (Templates in new schema)
    const tTemplates = await db
      .select()
      .from(taskTemplates)
      .where(and(eq(taskTemplates.userId, session.user.id),eq(taskTemplates.isArchived,false)));

    const createdInstances = [];
    const errors = [];

    // Create instances for each task template
    for (const template of tTemplates || []) {
      try {
        if (!scheduledOn(template,today,timezone)) continue;
        // Check if instance already exists for today
        const [existingInstance] = await db
          .select()
          .from(taskInstances)
          .where(
            and(
              eq(taskInstances.templateId, template.id),
              eq(taskInstances.dueDate, today)
            )
          )
          .limit(1);

        if (existingInstance) {
          continue;
        }

        // Create new instance
        const [newInstance] = await db
          .insert(taskInstances)
          .values({
            id: crypto.randomUUID(),
            templateId: template.id,
            dueDate: today,
            status: "pending",
          })
          .onConflictDoNothing()
          .returning();
        if (!newInstance) continue;

        createdInstances.push({
          task_name: template.title,
          instance_id: newInstance.id,
        });
      } catch (error) {
        console.error("Error processing task:", error);
        errors.push({
          task: template.title,
          error: "Could not create occurrence",
        });
      }
    }

    return NextResponse.json({
      success: true,
      created_instances: createdInstances,
      errors: errors,
      total_created: createdInstances.length,
      total_errors: errors.length,
    });
  } catch (error) {
    console.error("Error generating instances:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
