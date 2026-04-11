import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { taskInstances, taskTemplates } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { due_date } = await request.json();

    if (!due_date) {
      return NextResponse.json(
        { error: "Due date is required" },
        { status: 400 }
      );
    }

    // Validate that the date is in the future/today
    const today = new Date().toISOString().split("T")[0];
    if (due_date < today) {
        return NextResponse.json(
          { error: "Due date cannot be in the past" },
          { status: 400 }
        );
    }

    // Check if this is a task instance
    const [instance] = await db.select().from(taskInstances).where(eq(taskInstances.id, id)).limit(1);
    if (!instance) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Check ownership via template
    const [template] = await db
      .select()
      .from(taskTemplates)
      .where(and(eq(taskTemplates.id, instance.templateId), eq(taskTemplates.userId, session.user.id)))
      .limit(1);

    if (!template) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Update the instance's due_date
    const [updatedInstance] = await db
      .update(taskInstances)
      .set({ dueDate: due_date })
      .where(eq(taskInstances.id, id))
      .returning();

    return NextResponse.json({ task: updatedInstance });
  } catch (error) {
    console.error("API Error in reschedule PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
