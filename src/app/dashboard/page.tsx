import { createServerSupabaseClient } from "@/libs/supabase-server";
import { DailyTasks } from "@/components/dashboard/DailyTasks";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get today's tasks
  const today = new Date().toISOString().split("T")[0];
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .gte("due_date", today)
    .lte("due_date", today)
    .order("priority", { ascending: false });

  // Get stats
  const { data: allTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id);

  const stats = {
    totalTasks: allTasks?.length || 0,
    completedTasks: allTasks?.filter((task) => task.completed).length || 0,
    pendingTasks: allTasks?.filter((task) => !task.completed).length || 0,
    completionRate: allTasks?.length
      ? Math.round(
          (allTasks.filter((task) => task.completed).length / allTasks.length) *
            100
        )
      : 0,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardHeader />

      <DashboardStats stats={stats} />

      <div className="mt-8">
        <DailyTasks tasks={tasks || []} userId={user.id} />
      </div>
    </div>
  );
}
