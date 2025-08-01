import { createServerSupabaseClient } from "@/libs/supabase-server";
import { DashboardContent } from "@/components/dashboard/core/DashboardContent";
import { getTodayDate } from "@/libs/date-utils";
import { Task } from "@/types";

interface TodayTask {
  id: string;
  name: string;
  description: string;
  category: string;
  base_frequency_days: number;
  importance_level: number;
  exp_reward: number;
  completed: boolean;
  due_date: string;
  is_instance: boolean;
  original_task_id: string;
  is_ai_generated?: boolean;
}

// Convert TodayTask to LegacyTask format
function convertToLegacyTask(task: TodayTask): Task {
  return {
    id: task.id,
    title: task.name,
    description: task.description,
    frequency: "daily", // Default frequency
    category: task.category as any,
    priority: "medium", // Default priority
    completed: task.completed,
    due_date: task.due_date,
    user_id: "", // Will be set by the component
    is_recurring: task.base_frequency_days > 1,
    recurrence_start_date: task.due_date,
    recurrence_end_date: undefined,
    last_generated_date: undefined,
    original_task_id: task.original_task_id,
    day_of_week: undefined,
    preferred_time: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get today's date
  const today = getTodayDate();

  // Get user tasks with template information
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
  }

  // Get task instances for today
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
    .eq("due_date", today)
    .order("created_at", { ascending: true });

  if (taskInstancesError) {
    console.error("Error fetching task instances:", taskInstancesError);
  }

  // Get future task instances (coming soon)
  const { data: comingSoonInstances, error: comingSoonError } = await supabase
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
    .gt("due_date", today)
    .order("due_date", { ascending: true });

  if (comingSoonError) {
    console.error("Error fetching coming soon instances:", comingSoonError);
  }

  // Combine tasks and instances for today
  const todayTasks: TodayTask[] = [];

  // Add task instances for today
  if (taskInstances) {
    taskInstances.forEach((instance) => {
      if (instance.user_tasks?.task_templates) {
        todayTasks.push({
          ...instance.user_tasks.task_templates,
          id: instance.id, // Use instance ID for proper identification
          completed: instance.completed,
          due_date: instance.due_date,
          is_instance: true,
          original_task_id: instance.user_task_id,
        });
      }
    });
  }

  // Add user tasks that don't have instances yet (for display purposes)
  if (userTasks) {
    userTasks.forEach((userTask) => {
      // Only add if no instance exists for today
      const hasInstanceToday = taskInstances?.some(
        (instance) => instance.user_task_id === userTask.id
      );

      if (!hasInstanceToday) {
        todayTasks.push({
          ...userTask.task_templates,
          id: userTask.id,
          completed: false,
          due_date: today,
          is_instance: false,
          original_task_id: userTask.id,
        });
      }
    });
  }

  return (
    <DashboardContent
      initialTodayTasks={todayTasks.map(convertToLegacyTask)}
      initialComingSoonTasks={(comingSoonInstances || []).map((instance) =>
        convertToLegacyTask({
          id: instance.id,
          name: instance.user_tasks.task_templates.name,
          description: instance.user_tasks.task_templates.description,
          category: instance.user_tasks.task_templates.category,
          base_frequency_days:
            instance.user_tasks.task_templates.base_frequency_days,
          importance_level: instance.user_tasks.task_templates.importance_level,
          exp_reward: instance.user_tasks.task_templates.exp_reward,
          completed: instance.completed,
          due_date: instance.due_date,
          is_instance: true,
          original_task_id: instance.user_task_id,
          is_ai_generated: instance.user_tasks.task_templates.is_ai_generated,
        })
      )}
      userId={user.id}
    />
  );
}
