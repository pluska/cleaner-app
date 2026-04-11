import { auth } from "@/auth";
import { db } from "@/db";
import { taskTemplates, taskInstances } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Get task instances for the specified date with template information
    const tInstances = await db
      .select({
        id: taskInstances.id,
        templateId: taskInstances.templateId,
        dueDate: taskInstances.dueDate,
        status: taskInstances.status,
        completedAt: taskInstances.completedAt,
        template: {
          id: taskTemplates.id,
          title: taskTemplates.title,
          description: taskTemplates.description,
          importanceLevel: taskTemplates.importanceLevel,
          expReward: taskTemplates.expReward,
          roomId: taskTemplates.roomId,
        }
      })
      .from(taskInstances)
      .innerJoin(taskTemplates, eq(taskInstances.templateId, taskTemplates.id))
      .where(
        and(
          eq(taskTemplates.userId, session.user.id),
          eq(taskInstances.dueDate, date)
        )
      )
      .orderBy(taskInstances.id);

    // Get all user task templates (as fallback/context)
    const tTemplates = await db
      .select()
      .from(taskTemplates)
      .where(eq(taskTemplates.userId, session.user.id));

    return NextResponse.json({
      taskInstances: tInstances || [],
      userTasks: tTemplates || [], // frontend might use this for templates
      date,
    });
  } catch (error) {
    console.error("Error fetching tasks by date:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
