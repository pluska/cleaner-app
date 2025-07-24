import { createServerSupabaseClient } from "@/libs/supabase-server";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { getTodayDate } from "@/libs/date-utils";

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

  // Get tasks that are due today (including recurring tasks)
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .or(`due_date.eq.${today},is_recurring.eq.true`)
    .order("priority", { ascending: false });

  // Get task instances for today
  const { data: taskInstances } = await supabase
    .from("task_instances")
    .select(
      `
      *,
      tasks (*)
    `
    )
    .eq("user_id", user.id)
    .eq("due_date", today)
    .order("created_at", { ascending: true });

  // Get tasks that are coming soon (future due dates)
  const { data: comingSoonTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .gt("due_date", today)
    .order("due_date", { ascending: true });

  // Combine tasks and instances for today
  const todayTasks = [];

  // Add regular tasks due today
  if (tasks) {
    todayTasks.push(...tasks.filter((task) => task.due_date === today));
  }

  // Add recurring task instances
  if (taskInstances) {
    taskInstances.forEach((instance) => {
      if (instance.tasks) {
        todayTasks.push({
          ...instance.tasks,
          id: instance.id, // Use instance ID for proper identification
          completed: instance.completed,
          due_date: instance.due_date,
          is_instance: true,
          original_task_id: instance.task_id,
        });
      }
    });
  }

  return (
    <DashboardContent
      initialTodayTasks={todayTasks}
      initialComingSoonTasks={comingSoonTasks || []}
      userId={user.id}
    />
  );
}
