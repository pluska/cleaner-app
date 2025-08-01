import { createServerSupabaseClient } from "@/libs/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = (await params).id;

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    // First, check if this is a task instance
    const { data: taskInstance, error: instanceError } = await supabase
      .from("task_instances")
      .select(
        `
        *,
        user_tasks!inner(
          user_id
        )
      `
      )
      .eq("id", taskId)
      .eq("user_tasks.user_id", user.id)
      .single();

    if (taskInstance) {
      // Update the task instance's due date to tomorrow
      const { data: updatedInstance, error: updateError } = await supabase
        .from("task_instances")
        .update({ due_date: tomorrowDate })
        .eq("id", taskId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating task instance:", updateError);
        return NextResponse.json(
          { error: "Failed to update task instance" },
          { status: 500 }
        );
      }

      return NextResponse.json({ task: updatedInstance });
    }

    // If not a task instance, check if it's a user task and create an instance
    const { data: userTask, error: userTaskError } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single();

    if (userTask) {
      // Create a new task instance for tomorrow
      const { data: newInstance, error: createError } = await supabase
        .from("task_instances")
        .insert({
          user_task_id: taskId,
          due_date: tomorrowDate,
          completed: false,
          tools_used: [],
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating task instance:", createError);
        return NextResponse.json(
          { error: "Failed to create task instance" },
          { status: 500 }
        );
      }

      return NextResponse.json({ task: newInstance });
    }

    // If neither found, return error
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  } catch (error) {
    console.error("Error in move-to-tomorrow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
