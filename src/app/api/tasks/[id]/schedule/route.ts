import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabase-server";

// PATCH /api/tasks/[id]/schedule - Update task due date (for drag & drop)
export async function PATCH(
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
    const body = await request.json();
    const { newDueDate, isRecurring } = body;

    // Validate due date
    if (!newDueDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDueDate)) {
      return NextResponse.json(
        { error: "Invalid due date format" },
        { status: 400 }
      );
    }

    if (isRecurring) {
      // For recurring tasks, update the recurrence start date
      const { data: task, error } = await supabase
        .from("tasks")
        .update({
          recurrence_start_date: newDueDate,
          last_generated_date: null, // Reset to regenerate instances
        })
        .eq("id", (await params).id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating recurring task:", error);
        return NextResponse.json(
          { error: "Failed to update task" },
          { status: 500 }
        );
      }

      return NextResponse.json({ task });
    } else {
      // For one-time tasks, update the due date
      const { data: task, error } = await supabase
        .from("tasks")
        .update({ due_date: newDueDate })
        .eq("id", (await params).id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating task due date:", error);
        return NextResponse.json(
          { error: "Failed to update task" },
          { status: 500 }
        );
      }

      return NextResponse.json({ task });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
