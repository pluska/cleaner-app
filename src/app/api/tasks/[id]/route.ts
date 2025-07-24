import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabase-server";
import { TaskFormData } from "@/types";

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", (await params).id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      console.error("Error fetching task:", error);
      return NextResponse.json(
        { error: "Failed to fetch task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a specific task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: Partial<TaskFormData> = await request.json();

    // Validate required fields if provided
    if (body.title !== undefined && (!body.title || !body.title.trim())) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Validate frequency if provided
    if (body.frequency !== undefined) {
      const validFrequencies = ["daily", "weekly", "monthly", "yearly"];
      if (!validFrequencies.includes(body.frequency)) {
        return NextResponse.json(
          { error: "Invalid frequency" },
          { status: 400 }
        );
      }
    }

    // Validate category if provided
    if (body.category !== undefined) {
      const validCategories = [
        "kitchen",
        "bathroom",
        "bedroom",
        "living_room",
        "laundry",
        "exterior",
        "general",
      ];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }

    // Validate priority if provided
    if (body.priority !== undefined) {
      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: "Invalid priority" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Partial<TaskFormData> = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined)
      updateData.description = body.description?.trim() || undefined;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;

    const { data: task, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", (await params).id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      console.error("Error updating task:", error);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a specific task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", (await params).id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting task:", error);
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
