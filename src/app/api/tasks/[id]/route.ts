import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { taskTemplates, taskInstances } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/tasks/[id] - Get a specific task (Template or Instance)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Try finding in Instances first
    const [instance] = await db
      .select()
      .from(taskInstances)
      .where(eq(taskInstances.id, id))
      .limit(1);

    if (instance) {
      // Check if this instance's template belongs to the user
      const [template] = await db
        .select()
        .from(taskTemplates)
        .where(and(eq(taskTemplates.id, instance.templateId), eq(taskTemplates.userId, session.user.id)))
        .limit(1);

      if (template) {
        return NextResponse.json({ task: { ...instance, title: template.title, description: template.description } });
      }
    }

    // Try finding in Templates
    const [template] = await db
      .select()
      .from(taskTemplates)
      .where(and(eq(taskTemplates.id, id), eq(taskTemplates.userId, session.user.id)))
      .limit(1);

    if (template) {
      return NextResponse.json({ task: template });
    }

    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  } catch (error) {
    console.error("API Error in task GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/tasks/[id] - Update a specific task (usually status or template fields)
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

    // Check if it's an instance
    const [instance] = await db.select().from(taskInstances).where(eq(taskInstances.id, id)).limit(1);
    if (instance) {
      const [template] = await db.select().from(taskTemplates).where(and(eq(taskTemplates.id, instance.templateId), eq(taskTemplates.userId, session.user.id))).limit(1);
      if (!template) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const updated = await db
        .update(taskInstances)
        .set({
          status: body.status || instance.status,
          completedAt: body.status === "completed" ? new Date() : null,
        })
        .where(eq(taskInstances.id, id))
        .returning();

      return NextResponse.json({ task: updated[0] });
    }

    // Check if it's a template
    const [template] = await db.select().from(taskTemplates).where(and(eq(taskTemplates.id, id), eq(taskTemplates.userId, session.user.id))).limit(1);
    if (template) {
      const updated = await db
        .update(taskTemplates)
        .set({
          title: body.title || template.title,
          description: body.description ?? template.description,
          importanceLevel: body.importanceLevel ?? template.importanceLevel,
        })
        .where(eq(taskTemplates.id, id))
        .returning();

      return NextResponse.json({ task: updated[0] });
    }

    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  } catch (error) {
    console.error("API Error in task PATCH:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete a specific task
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Try deleting instance
    const [instance] = await db.select().from(taskInstances).where(eq(taskInstances.id, id)).limit(1);
    if (instance) {
      await db.delete(taskInstances).where(eq(taskInstances.id, id));
      return NextResponse.json({ success: true });
    }

    // Try deleting template
    const [template] = await db.select().from(taskTemplates).where(and(eq(taskTemplates.id, id), eq(taskTemplates.userId, session.user.id))).limit(1);
    if (template) {
      await db.delete(taskTemplates).where(eq(taskTemplates.id, id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  } catch (error) {
    console.error("API Error in task DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
