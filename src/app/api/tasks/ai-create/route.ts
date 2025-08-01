import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabase-server";
import { AIRecommendation } from "@/types";

export async function POST(request: NextRequest) {
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
    const { tasks }: { tasks: AIRecommendation[] } = body;

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Invalid tasks data" },
        { status: 400 }
      );
    }

    const createdTasks = [];
    const errors = [];

    // Create each task
    for (const task of tasks) {
      try {
        // Create task template first
        const { data: template, error: templateError } = await supabase
          .from("task_templates")
          .insert([
            {
              template_id: `ai_generated_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              name: task.task_name,
              description: task.friendly_explanation,
              category: "general", // Default category, could be improved with AI categorization
              base_frequency_days: task.frequency_days,
              importance_level: task.importance_level,
              health_impact: task.health_impact,
              scientific_source: task.scientific_source,
              source_url: task.source_url,
              ai_explanation: task.reasoning,
              exp_reward: task.exp_reward,
              area_health_impact: task.area_health_impact,
              tools_required: task.tools_required,
              tools_usage: task.tools_usage || {},
              room_specific: task.room_specific || "general",
              language: "en", // Default language
              is_ai_generated: true,
            },
          ])
          .select()
          .single();

        if (templateError) {
          console.error("Error creating template:", templateError);
          errors.push({ task: task.task_name, error: templateError.message });
          continue;
        }

        // Create user task
        const { data: userTask, error: userTaskError } = await supabase
          .from("user_tasks")
          .insert([
            {
              user_id: user.id,
              template_id: template.id,
              is_active: true,
            },
          ])
          .select()
          .single();

        if (userTaskError) {
          console.error("Error creating user task:", userTaskError);
          errors.push({ task: task.task_name, error: userTaskError.message });
          continue;
        }

        // Create subtasks if they exist
        if (task.subtasks && task.subtasks.length > 0) {
          for (const subtask of task.subtasks) {
            const { error: subtaskError } = await supabase
              .from("task_subtasks")
              .insert([
                {
                  template_id: template.id,
                  subtask_id: `ai_generated_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                  title: subtask.title,
                  description: subtask.description,
                  estimated_minutes: subtask.estimated_minutes,
                  order_index: subtask.order_index,
                  is_required: subtask.is_required,
                  exp_reward: subtask.exp_reward,
                  tools_needed: subtask.tools_needed,
                  difficulty:
                    subtask.difficulty &&
                    ["easy", "medium", "hard"].includes(subtask.difficulty)
                      ? subtask.difficulty
                      : "medium", // Default to medium if invalid
                },
              ]);

            if (subtaskError) {
              console.error("Error creating subtask:", subtaskError);
              // Don't fail the whole task for subtask errors
            }
          }
        }

        createdTasks.push({
          task_name: task.task_name,
          template_id: template.id,
          user_task_id: userTask.id,
        });
      } catch (error) {
        console.error("Error processing task:", error);
        errors.push({ task: task.task_name, error: "Unknown error" });
      }
    }

    return NextResponse.json({
      success: true,
      created_tasks: createdTasks,
      errors: errors,
      total_created: createdTasks.length,
      total_errors: errors.length,
    });
  } catch (error) {
    console.error("AI Task Creation Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
