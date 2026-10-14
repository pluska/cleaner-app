import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { taskTemplates, taskInstances } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { readJson, errorResponse, textField, HttpError } from "@/libs/server/http";
import { PATCH as toggleCompletion } from "./toggle/route";

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
    return errorResponse(error);
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
    const body = await readJson(request);

    // Check if it's an instance
    const [instance] = await db.select().from(taskInstances).where(eq(taskInstances.id, id)).limit(1);
    if (instance) {
      const [template] = await db.select().from(taskTemplates).where(and(eq(taskTemplates.id, instance.templateId), eq(taskTemplates.userId, session.user.id))).limit(1);
      if (!template) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      if (body.status === "completed") return toggleCompletion(request,{params:Promise.resolve({id})});
      throw new HttpError(409,"Use the reschedule action; completion cannot be undone");
    }

    // Check if it's a template
    const [template] = await db.select().from(taskTemplates).where(and(eq(taskTemplates.id, id), eq(taskTemplates.userId, session.user.id))).limit(1);
    if (template) {
      const updated = await db
        .update(taskTemplates)
        .set({
          title: body.title === undefined ? template.title : textField(body.title,"title",200),
          description: body.description === undefined ? template.description : body.description === "" || body.description === null ? null : textField(body.description,"description",2000),
          importanceLevel: template.importanceLevel,
        })
        .where(eq(taskTemplates.id, id))
        .returning();

      return NextResponse.json({ task: updated[0] });
    }

    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
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
      const [owner] = await db.select().from(taskTemplates).where(and(eq(taskTemplates.id,instance.templateId),eq(taskTemplates.userId,session.user.id)));
      if (!owner) throw new HttpError(404,"Task not found");
      if (instance.status !== "pending") throw new HttpError(409,"Only pending tasks can be removed");
      await db.update(taskInstances).set({status:"skipped"}).where(eq(taskInstances.id,id));
      return NextResponse.json({ success: true });
    }

    // Try deleting template
    const [template] = await db.select().from(taskTemplates).where(and(eq(taskTemplates.id, id), eq(taskTemplates.userId, session.user.id))).limit(1);
    if (template) {
      await db.update(taskTemplates).set({isArchived:true}).where(eq(taskTemplates.id, id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
}
