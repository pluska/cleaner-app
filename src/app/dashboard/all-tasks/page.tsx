import { createServerSupabaseClient } from "@/libs/supabase-server";
import { AllTasksView } from "@/components/dashboard/tasks/AllTasksView";

export default async function AllTasksPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get all user tasks with template information
  const { data: userTasks, error: userTasksError } = await supabase
    .from("user_tasks")
    .select(
      `
      *,
      task_templates(*)
    `
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (userTasksError) {
    console.error("Error fetching user tasks:", userTasksError);
  }

  // Get all task instances
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
    .order("due_date", { ascending: true });

  if (taskInstancesError) {
    console.error("Error fetching task instances:", taskInstancesError);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
        <p className="text-gray-600 mt-2">
          View all your tasks, including base recurring tasks and their
          generated instances
        </p>
      </div>

      <AllTasksView
        userTasks={userTasks || []}
        taskInstances={taskInstances || []}
        userId={user.id}
      />
    </div>
  );
}
