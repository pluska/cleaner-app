import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { taskTemplates, taskSubtemplates, rooms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AIRecommendation } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tasks }: { tasks: AIRecommendation[] } = body;

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Invalid tasks data" },
        { status: 400 }
      );
    }

    const userRooms = await db.select().from(rooms).where(eq(rooms.userId, session.user.id));
    const createdTasks = [];
    const errors = [];

    for (const task of tasks) {
      try {
        const templateId = crypto.randomUUID();
        const targetRoom = userRooms.find(r => r.name.toLowerCase() === (task.room_specific || "general").toLowerCase())?.id || "general";

        // Create task template
        const [template] = await db.insert(taskTemplates).values({
          id: templateId,
          userId: session.user.id,
          roomId: targetRoom,
          title: task.task_name,
          description: task.friendly_explanation || "",
          importanceLevel: task.importance_level || 3,
          expReward: task.exp_reward || 10,
          healthImpact: task.health_impact,
          scientificSource: task.scientific_source,
          aiExplanation: task.reasoning,
          rrule: `FREQ=DAILY;INTERVAL=${task.frequency_days || 7}`,
          startDate: new Date(),
          nextOccurrence: new Date(),
        }).returning();

        // Create subtasks if any
        if (task.subtasks && task.subtasks.length > 0) {
          for (const [index, sub] of task.subtasks.entries()) {
            await db.insert(taskSubtemplates).values({
              id: crypto.randomUUID(),
              templateId: templateId,
              title: sub.title,
              description: sub.description || "",
              estimatedMinutes: sub.estimated_minutes || 5,
              orderIndex: index,
              isRequired: sub.is_required !== false,
              expReward: sub.exp_reward || 5,
              difficulty: (sub.difficulty as string) || "medium",
            });
          }
        }

        createdTasks.push({
          task_name: task.task_name,
          template_id: template.id,
        });
      } catch (error) {
        console.error("Error creating AI task:", error);
        errors.push({ task: task.task_name, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }

    return NextResponse.json({
      success: true,
      created_tasks: createdTasks,
      errors,
      total_created: createdTasks.length,
      total_errors: errors.length,
    });
  } catch (error) {
    console.error("AI Task Creation Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
