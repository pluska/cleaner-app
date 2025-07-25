import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// POST /api/tasks/[id]/complete - Complete task with gamification
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskInstanceId = params.id;

    // Get task instance with template data
    const { data: taskInstance, error: fetchError } = await supabase
      .from("task_instances")
      .select(
        `
        *,
        user_tasks!inner(
          *,
          task_templates!inner(*)
        )
      `
      )
      .eq("id", taskInstanceId)
      .eq("user_tasks.user_id", user.id)
      .single();

    if (fetchError || !taskInstance) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (taskInstance.completed) {
      return NextResponse.json(
        { error: "Task already completed" },
        { status: 400 }
      );
    }

    const template = taskInstance.user_tasks.task_templates;
    const expReward = template.exp_reward || 0;
    const areaHealthImpact = template.area_health_impact || 0;

    // Start transaction
    const { data: updatedInstance, error: updateError } = await supabase
      .from("task_instances")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        exp_earned: expReward,
        area_health_restored: areaHealthImpact,
      })
      .eq("id", taskInstanceId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating task instance:", updateError);
      return NextResponse.json(
        { error: "Failed to complete task" },
        { status: 500 }
      );
    }

    // Update user profile with EXP and stats
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    const newExp = profile.experience_points + expReward;
    const newLevel = Math.floor(newExp / 100) + 1; // Simple level calculation
    const newTotalTasks = profile.total_tasks_completed + 1;

    // Update user profile
    const { data: updatedProfile, error: updateProfileError } = await supabase
      .from("user_profiles")
      .update({
        experience_points: newExp,
        level: newLevel,
        total_tasks_completed: newTotalTasks,
        coins: profile.coins + Math.floor(expReward / 10), // 1 coin per 10 EXP
        gems: profile.gems + (newLevel > profile.level ? 1 : 0), // 1 gem per level up
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateProfileError) {
      console.error("Error updating user profile:", updateProfileError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Update area health if applicable
    if (areaHealthImpact > 0) {
      // First get current area health
      const { data: area, error: areaFetchError } = await supabase
        .from("home_areas")
        .select("current_health, max_health")
        .eq("user_id", user.id)
        .eq("area_type", template.category)
        .single();

      if (!areaFetchError && area) {
        const newHealth = Math.min(
          area.current_health + areaHealthImpact,
          area.max_health
        );
        const { error: areaError } = await supabase
          .from("home_areas")
          .update({
            current_health: newHealth,
            last_cleaned_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("area_type", template.category);

        if (areaError) {
          console.error("Error updating area health:", areaError);
          // Don't fail the request, just log the error
        }
      }
    }

    // Update tool durability if tools were used
    if (template.tools_required && template.tools_required.length > 0) {
      for (const toolId of template.tools_required) {
        const toolUsage = template.tools_usage?.[toolId];
        if (toolUsage?.durability_loss) {
          // First get current tool durability
          const { data: tool, error: toolFetchError } = await supabase
            .from("user_tools")
            .select("current_durability, uses_count")
            .eq("user_id", user.id)
            .eq("tool_id", toolId)
            .eq("is_active", true)
            .single();

          if (!toolFetchError && tool) {
            const newDurability = Math.max(
              tool.current_durability - toolUsage.durability_loss,
              0
            );
            const newUsesCount = tool.uses_count + 1;

            const { error: toolError } = await supabase
              .from("user_tools")
              .update({
                current_durability: newDurability,
                uses_count: newUsesCount,
              })
              .eq("user_id", user.id)
              .eq("tool_id", toolId)
              .eq("is_active", true);

            if (toolError) {
              console.error("Error updating tool durability:", toolError);
              // Don't fail the request, just log the error
            }
          }
        }
      }
    }

    return NextResponse.json({
      task: updatedInstance,
      profile: updatedProfile,
      rewards: {
        exp_earned: expReward,
        area_health_restored: areaHealthImpact,
        level_up: newLevel > profile.level,
        coins_earned: Math.floor(expReward / 10),
        gems_earned: newLevel > profile.level ? 1 : 0,
      },
    });
  } catch (error) {
    console.error("Unexpected error in task completion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
