import { createServerSupabaseClient } from "@/libs/supabase-server";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardDragDropProvider } from "@/components/dashboard/DashboardDragDropProvider";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

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

  // Calculate stats for today only
  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionRate,
  };

  return (
    <div className="max-w-7xl mx-auto bg-bg min-h-screen p-8">
      <DashboardHeader />

      <div className="mb-8">
        <DashboardStats stats={stats} />
      </div>

      <DashboardDragDropProvider
        todayTasks={todayTasks}
        comingSoonTasks={comingSoonTasks || []}
        userId={user.id}
      />
    </div>
  );
}
