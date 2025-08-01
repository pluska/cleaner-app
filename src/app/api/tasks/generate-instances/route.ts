import { createServerSupabaseClient } from "@/libs/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { getTodayDate } from "@/libs/date-utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = getTodayDate();

    // Get all active user tasks
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
        { error: "Failed to fetch user tasks" },
        { status: 500 }
      );
    }

    const createdInstances = [];
    const errors = [];

    // Create instances for each user task
    for (const userTask of userTasks || []) {
      try {
        // Check if instance already exists for today
        const { data: existingInstance } = await supabase
          .from("task_instances")
          .select("*")
          .eq("user_task_id", userTask.id)
          .eq("due_date", today)
          .single();

        if (existingInstance) {
          console.log(
            `Instance already exists for task ${userTask.task_templates.name} on ${today}`
          );
          continue;
        }

        // Create new instance
        const { data: newInstance, error: createError } = await supabase
          .from("task_instances")
          .insert({
            user_task_id: userTask.id,
            due_date: today,
            completed: false,
            tools_used: [],
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating instance:", createError);
          errors.push({
            task: userTask.task_templates.name,
            error: createError.message,
          });
        } else {
          createdInstances.push({
            task_name: userTask.task_templates.name,
            instance_id: newInstance.id,
          });
          console.log(
            `Created instance for task: ${userTask.task_templates.name}`
          );
        }
      } catch (error) {
        console.error("Error processing task:", error);
        errors.push({
          task: userTask.task_templates.name,
          error: "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      created_instances: createdInstances,
      errors: errors,
      total_created: createdInstances.length,
      total_errors: errors.length,
    });
  } catch (error) {
    console.error("Error generating instances:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
