import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { TaskTemplate, HomeAssessmentInput } from "@/types";

// Load task templates
const loadTaskTemplates = async (
  language: string = "en"
): Promise<TaskTemplate[]> => {
  try {
    const templates = await import(
      `@/data/templates/task-templates-${language}.json`
    );
    const templateData = templates.default.templates || [];
    return templateData.map((template: any) => ({
      ...template,
      template_id: template.id,
      language,
      is_ai_generated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tools_usage: Object.fromEntries(
        Object.entries(template.tools_usage || {}).filter(
          ([_, value]) => value !== undefined
        )
      ),
    }));
  } catch (error) {
    // Fallback to English if language-specific templates not found
    const englishTemplates = await import(
      "@/data/templates/task-templates-en.json"
    );
    const templateData = englishTemplates.default.templates || [];
    // Add language and is_ai_generated fields to each template
    return templateData.map((template) => ({
      ...template,
      template_id: template.id,
      language: "en",
      is_ai_generated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tools_usage: Object.fromEntries(
        Object.entries(template.tools_usage || {}).filter(
          ([_, value]) => value !== undefined
        )
      ),
    }));
  }
};

// Filter templates based on user's rooms and preferences
const filterTemplatesByUserProfile = (
  templates: TaskTemplate[],
  rooms: string[],
  lifestyle: string,
  cleaning_preferences: string,
  pets: boolean,
  children: boolean,
  allergies: boolean
): TaskTemplate[] => {
  return templates.filter((template) => {
    // Check if template is for a room the user has
    if (template.category && !rooms.includes(template.category)) {
      return false;
    }

    // Adjust frequency based on lifestyle
    let adjustedFrequency = template.base_frequency_days;

    if (lifestyle === "busy") {
      adjustedFrequency = Math.max(adjustedFrequency * 1.5, 7); // Less frequent for busy people
    } else if (lifestyle === "relaxed") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.7, 3); // More frequent for relaxed people
    }

    // Adjust frequency based on cleaning preferences
    if (cleaning_preferences === "minimal") {
      adjustedFrequency = Math.max(adjustedFrequency * 1.8, 10);
    } else if (cleaning_preferences === "thorough") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.6, 2);
    }

    // Adjust for pets (more frequent cleaning)
    if (pets && template.category !== "exterior") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.8, 3);
    }

    // Adjust for children (more frequent cleaning)
    if (children && template.category !== "exterior") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.8, 3);
    }

    // Adjust for allergies (more frequent cleaning)
    if (allergies && template.category !== "exterior") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.7, 2);
    }

    // Update the template with adjusted frequency
    template.base_frequency_days = Math.round(adjustedFrequency);

    return true;
  });
};

// Generate task instances for the next 30 days
const generateTaskInstances = (templates: TaskTemplate[]): any[] => {
  const instances = [];
  const today = new Date();

  for (const template of templates) {
    // Generate instances for the next 30 days
    for (let i = 0; i < 30; i += template.base_frequency_days) {
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + i);

      instances.push({
        template_id: template.id,
        task_name: template.name,
        display_name: template.name,
        description: template.description,
        category: template.category,
        frequency_days: template.base_frequency_days,
        importance_level: template.importance_level,
        health_impact: template.health_impact,
        scientific_source: template.scientific_source,
        source_url: template.source_url,
        ai_explanation: template.ai_explanation,
        exp_reward: template.exp_reward,
        area_health_impact: template.area_health_impact,
        tools_required: template.tools_required,
        due_date: dueDate.toISOString().split("T")[0],
        estimated_minutes: 15, // Default estimate since subtasks aren't available in TaskTemplate
      });
    }
  }

  return instances;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      rooms,
      lifestyle,
      cleaning_preferences,
      pets,
      children,
      allergies,
      language = "en",
    } = body;

    // Validate required fields
    if (!rooms || !lifestyle || cleaning_preferences === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Load task templates
    const allTemplates = await loadTaskTemplates(language);

    // Filter templates based on user profile
    const filteredTemplates = filterTemplatesByUserProfile(
      allTemplates,
      rooms,
      lifestyle,
      cleaning_preferences,
      pets,
      children,
      allergies
    );

    // Generate task instances
    const suggestedTasks = generateTaskInstances(filteredTemplates);

    // Create user tasks in database
    const userTasks = [];
    for (const template of filteredTemplates) {
      const { data: userTask, error: userTaskError } = await supabase
        .from("user_tasks")
        .insert({
          user_id: user.id,
          template_id: template.id,
          is_active: true,
        })
        .select()
        .single();

      if (userTaskError) {
        console.error("Error creating user task:", userTaskError);
        continue;
      }

      userTasks.push(userTask);
    }

    // Generate task instances for the next 30 days
    const taskInstances = [];
    for (const userTask of userTasks) {
      const template = filteredTemplates.find(
        (t) => t.id === userTask.template_id
      );
      if (!template) continue;

      const today = new Date();
      for (let i = 0; i < 30; i += template.base_frequency_days) {
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + i);

        const { data: instance, error: instanceError } = await supabase
          .from("task_instances")
          .insert({
            user_task_id: userTask.id,
            due_date: dueDate.toISOString().split("T")[0],
            completed: false,
            tools_used: {},
          })
          .select()
          .single();

        if (instanceError) {
          console.error("Error creating task instance:", instanceError);
          continue;
        }

        taskInstances.push(instance);
      }
    }

    return NextResponse.json({
      success: true,
      tasks: suggestedTasks,
      userTasks: userTasks.length,
      instances: taskInstances.length,
      message: `Generated ${userTasks.length} user tasks and ${taskInstances.length} task instances`,
    });
  } catch (error) {
    console.error("Error generating suggested tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
