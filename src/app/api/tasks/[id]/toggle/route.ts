import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabase-server";

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

    const taskId = (await params).id;

    // First, check if this is a task instance
    const { data: instance, error: instanceError } = await supabase
      .from("task_instances")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single();

    if (instance && !instanceError) {
      // This is a task instance, toggle its completion
      const { data: updatedInstance, error: updateError } = await supabase
        .from("task_instances")
        .update({ completed: !instance.completed })
        .eq("id", taskId)
        .select(
          `
          *,
          tasks (*)
        `
        )
        .single();

      if (updateError) {
        console.error("Error updating task instance:", updateError);
        return NextResponse.json(
          { error: "Failed to update task instance" },
          { status: 500 }
        );
      }

      // Return the task data with instance completion status
      if (updatedInstance && updatedInstance.tasks) {
        return NextResponse.json({
          task: {
            ...updatedInstance.tasks,
            id: updatedInstance.id,
            completed: updatedInstance.completed,
            due_date: updatedInstance.due_date,
            is_instance: true,
            original_task_id: updatedInstance.task_id,
          },
        });
      }
    }

    // If not a task instance, treat as regular task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single();

    if (taskError || !task) {
      console.error("Error fetching task:", taskError);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Toggle the task completion
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", taskId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating task:", updateError);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
