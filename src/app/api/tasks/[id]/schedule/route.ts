import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { taskTemplates, taskInstances } from "@/db/schema";
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
    const body = await request.json();
    const { newDueDate, isRecurring } = body;

    if (!newDueDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDueDate)) {
      return NextResponse.json(
        { error: "Invalid due date format" },
        { status: 400 }
      );
    }

    if (isRecurring) {
      // Find template
      const [template] = await db
        .select()
        .from(taskTemplates)
        .where(and(eq(taskTemplates.id, id), eq(taskTemplates.userId, session.user.id)))
        .limit(1);

      if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

      // For recurring tasks, update the recurrence start date
      const [updated] = await db
        .update(taskTemplates)
        .set({
          startDate: new Date(newDueDate),
          nextOccurrence: new Date(newDueDate),
        })
        .where(eq(taskTemplates.id, id))
        .returning();

      return NextResponse.json({ task: updated });
    } else {
      // Find instance
      const [instance] = await db.select().from(taskInstances).where(eq(taskInstances.id, id)).limit(1);
      if (!instance) return NextResponse.json({ error: "Instance not found" }, { status: 404 });

      // Check ownership via template
      const [template] = await db
        .select()
        .from(taskTemplates)
        .where(and(eq(taskTemplates.id, instance.templateId), eq(taskTemplates.userId, session.user.id)))
        .limit(1);

      if (!template) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      // Update the instance's due date
      const [updated] = await db
        .update(taskInstances)
        .set({ dueDate: newDueDate })
        .where(eq(taskInstances.id, id))
        .returning();

      return NextResponse.json({ task: updated });
    }
  } catch (error) {
    console.error("API Error in schedule PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
