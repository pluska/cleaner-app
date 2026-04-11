import { auth } from "@/auth";
import { db } from "@/db";
import { taskInstances, taskTemplates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    // Check if this is a task instance
    const [instance] = await db
      .select()
      .from(taskInstances)
      .where(eq(taskInstances.id, id))
      .limit(1);

    if (instance) {
      // Check ownership via template
      const [template] = await db
        .select()
        .from(taskTemplates)
        .where(and(eq(taskTemplates.id, instance.templateId), eq(taskTemplates.userId, session.user.id)))
        .limit(1);

      if (!template) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Update the task instance's due date to tomorrow
      const [updatedInstance] = await db
        .update(taskInstances)
        .set({ dueDate: tomorrowDate })
        .where(eq(taskInstances.id, id))
        .returning();

      return NextResponse.json({ task: updatedInstance });
    }

    return NextResponse.json({ error: "Task instance not found" }, { status: 404 });
  } catch (error) {
    console.error("Error in move-to-tomorrow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
