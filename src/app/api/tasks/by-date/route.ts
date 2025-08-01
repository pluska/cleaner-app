import { createServerSupabaseClient } from "@/libs/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Get task instances for the specified date with template information
    const { data: taskInstances, error: taskInstancesError } = await supabase
      .from("task_instances")
      .select(
        `
        *,
        user_tasks!inner(
          *,
          task_templates(*)
        )
      `
      )
      .eq("user_tasks.user_id", user.id)
      .eq("due_date", date)
      .order("created_at", { ascending: true });

    if (taskInstancesError) {
      console.error("Error fetching task instances:", taskInstancesError);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    // Get user tasks that don't have instances yet (for display purposes)
    const { data: userTasks, error: userTasksError } = await supabase
      .from("user_tasks")
      .select(
        `
        *,
        task_templates(*)
      `
      )
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (userTasksError) {
      console.error("Error fetching user tasks:", userTasksError);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      taskInstances,
      userTasks,
      date,
    });
  } catch (error) {
    console.error("Error fetching tasks by date:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
