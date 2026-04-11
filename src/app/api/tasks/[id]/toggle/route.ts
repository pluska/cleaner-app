import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { taskInstances, taskTemplates } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

    // Check if this is a task instance
    const [instance] = await db
      .select({
        id: taskInstances.id,
        status: taskInstances.status,
        templateId: taskInstances.templateId,
      })
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

      const newStatus = instance.status === "completed" ? "pending" : "completed";
      
      const [updatedInstance] = await db
        .update(taskInstances)
        .set({ 
          status: newStatus,
          completedAt: newStatus === "completed" ? new Date() : null
        })
        .where(eq(taskInstances.id, id))
        .returning();

      return NextResponse.json({
        task: {
          ...template,
          id: updatedInstance.id,
          status: updatedInstance.status,
          dueDate: updatedInstance.dueDate,
          isInstance: true,
          templateId: updatedInstance.templateId,
        },
      });
    }

    return NextResponse.json({ error: "Task instance not found" }, { status: 404 });
  } catch (error) {
    console.error("API Error in toggle PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
