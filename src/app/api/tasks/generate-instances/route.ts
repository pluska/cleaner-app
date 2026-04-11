import { auth } from "@/auth";
import { db } from "@/db";
import { taskTemplates, taskInstances } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getTodayDate } from "@/libs/date-utils";

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = getTodayDate();

    // Get all active user tasks (Templates in new schema)
    const tTemplates = await db
      .select()
      .from(taskTemplates)
      .where(eq(taskTemplates.userId, session.user.id));

    const createdInstances = [];
    const errors = [];

    // Create instances for each task template
    for (const template of tTemplates || []) {
      try {
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
          console.log(`Instance already exists for task ${template.title} on ${today}`);
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
          .returning();

        createdInstances.push({
          task_name: template.title,
          instance_id: newInstance.id,
        });
        console.log(`Created instance for task: ${template.title}`);
      } catch (error) {
        console.error("Error processing task:", error);
        errors.push({
          task: template.title,
          error: error instanceof Error ? error.message : "Unknown error",
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
