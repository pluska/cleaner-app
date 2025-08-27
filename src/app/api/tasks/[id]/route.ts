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

    const taskId = (await params).id;
    console.log(
      "PUT /api/tasks/[id] - Updating task:",
      taskId,
      "for user:",
      user.id
    );

    // Parse request body
    const body: Partial<TaskFormData> = await request.json();
    console.log("Update data:", body);

    // Validate required fields if provided
    if (body.title !== undefined && (!body.title || !body.title.trim())) {
      return NextResponse.json(
        { error: "Title is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Validate frequency if provided
    if (body.frequency !== undefined) {
      const validFrequencies = ["daily", "weekly", "monthly", "yearly"];
      if (!validFrequencies.includes(body.frequency)) {
        return NextResponse.json(
          {
            error:
              "Invalid frequency. Must be one of: daily, weekly, monthly, yearly",
          },
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
          {
            error:
              "Invalid category. Must be one of: kitchen, bathroom, bedroom, living_room, laundry, exterior, general",
          },
          { status: 400 }
        );
      }
    }

    // Validate priority if provided
    if (body.priority !== undefined) {
      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: "Invalid priority. Must be one of: low, medium, high" },
          { status: 400 }
        );
      }
    }

    // Validate due_date format if provided
    if (body.due_date !== undefined && body.due_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.due_date)) {
        return NextResponse.json(
          { error: "Invalid date format. Must be YYYY-MM-DD" },
          { status: 400 }
        );
      }

      // Validate date is not in the past (optional business rule)
      const selectedDate = new Date(body.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return NextResponse.json(
          { error: "Due date cannot be in the past" },
          { status: 400 }
        );
      }
    }

    // First, check if this is a task instance (new schema)
    const { data: instance, error: instanceError } = await supabase
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
      .eq("id", taskId)
      .eq("user_tasks.user_id", user.id)
      .single();

    if (instance && !instanceError) {
      console.log("Found task instance:", instance.id);
      // This is a task instance, update the task template
      const templateId = instance.user_tasks.task_templates.id;

      const { data: updatedTemplate, error: updateError } = await supabase
        .from("task_templates")
        .update({
          name: body.title || instance.user_tasks.task_templates.name,
          description:
            body.description || instance.user_tasks.task_templates.description,
          category:
            body.category || instance.user_tasks.task_templates.category,
        })
        .eq("id", templateId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating task template:", updateError);
        return NextResponse.json(
          { error: "Failed to update task template" },
          { status: 500 }
        );
      }

      // Return the updated task data
      return NextResponse.json({
        task: {
          id: instance.id,
          title: updatedTemplate.name,
          description: updatedTemplate.description,
          frequency: "daily",
          category: updatedTemplate.category,
          priority: "medium",
          completed: instance.completed,
          due_date: instance.due_date,
          user_id: user.id,
          is_recurring:
            instance.user_tasks.task_templates.base_frequency_days > 1,
          recurrence_start_date: instance.due_date,
          recurrence_end_date: undefined,
          last_generated_date: undefined,
          original_task_id: instance.user_task_id,
          day_of_week: undefined,
          preferred_time: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    // Check if this is a user_task (new schema)
    console.log("Checking user_tasks table for task:", taskId);
    const { data: userTask, error: userTaskError } = await supabase
      .from("user_tasks")
      .select(
        `
        *,
        task_templates(*)
      `
      )
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single();

    if (userTask && !userTaskError) {
      console.log("Found user_task:", userTask.id);
      console.log(
        "Task templates data:",
        JSON.stringify(userTask.task_templates, null, 2)
      );

      // Check if task_templates exists and has an ID
      if (!userTask.task_templates || !userTask.task_templates.id) {
        console.error("No task_templates found for user_task:", userTask.id);
        return NextResponse.json(
          { error: "Task template not found" },
          { status: 404 }
        );
      }

      // Instead of updating task_templates, update the user_tasks custom fields
      console.log("Updating user_task custom fields for ID:", userTask.id);

      // Prepare update data for user_tasks
      const userTaskUpdateData: any = {};

      // Only update custom_name if title is provided and valid
      if (body.title !== undefined) {
        if (!body.title || !body.title.trim()) {
          return NextResponse.json(
            { error: "Title is required and cannot be empty" },
            { status: 400 }
          );
        }
        userTaskUpdateData.custom_name = body.title.trim();
      }

      // Only update custom_description if description is provided
      if (body.description !== undefined) {
        userTaskUpdateData.custom_description =
          body.description?.trim() || null;
      }

      // Only update custom_frequency_days if frequency is provided and valid
      if (body.frequency !== undefined) {
        const frequencyToDays = {
          daily: 1,
          weekly: 7,
          monthly: 30,
          yearly: 365,
        };
        userTaskUpdateData.custom_frequency_days =
          frequencyToDays[body.frequency as keyof typeof frequencyToDays];
      }

      // Add updated_at timestamp
      userTaskUpdateData.updated_at = new Date().toISOString();

      console.log("User task update data:", userTaskUpdateData);

      const { data: updatedUserTask, error: updateError } = await supabase
        .from("user_tasks")
        .update(userTaskUpdateData)
        .eq("id", userTask.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating user_task:", updateError);
        return NextResponse.json(
          { error: "Failed to update user task" },
          { status: 500 }
        );
      }

      // Return the updated task data, prioritizing custom fields over template fields
      return NextResponse.json({
        task: {
          id: userTask.id,
          title: updatedUserTask.custom_name || userTask.task_templates.name,
          description:
            updatedUserTask.custom_description ||
            userTask.task_templates.description,
          frequency: body.frequency || "daily", // Use provided frequency or default
          category: userTask.task_templates.category as any, // Category comes from template
          priority: body.priority || "medium", // Use provided priority or default
          completed: false,
          due_date: body.due_date || new Date().toISOString().split("T")[0],
          user_id: user.id,
          is_recurring:
            (updatedUserTask.custom_frequency_days ||
              userTask.task_templates.base_frequency_days) > 1,
          recurrence_start_date:
            body.due_date || new Date().toISOString().split("T")[0],
          recurrence_end_date: undefined,
          last_generated_date: undefined,
          original_task_id: userTask.id,
          day_of_week: undefined,
          preferred_time: undefined,
          created_at: userTask.created_at,
          updated_at: updatedUserTask.updated_at,
        },
      });
    }

    // If not found in either new schema table, try the old tasks table
    console.log("Checking old tasks table for task:", taskId);
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single();

    if (taskError || !task) {
      console.error("Task not found in either table:", taskError);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    console.log("Found task in old table:", task.id);

    // Prepare update data for old tasks table
    const oldTaskUpdateData: Partial<TaskFormData> = {};
    if (body.title !== undefined) oldTaskUpdateData.title = body.title.trim();
    if (body.description !== undefined)
      oldTaskUpdateData.description = body.description?.trim() || undefined;
    if (body.frequency !== undefined)
      oldTaskUpdateData.frequency = body.frequency;
    if (body.category !== undefined) oldTaskUpdateData.category = body.category;
    if (body.priority !== undefined) oldTaskUpdateData.priority = body.priority;
    if (body.due_date !== undefined) oldTaskUpdateData.due_date = body.due_date;

    console.log("Old task update data:", oldTaskUpdateData);

    // Update the task in the old table
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(oldTaskUpdateData)
      .eq("id", taskId)
      .eq("user_id", user.id)
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
