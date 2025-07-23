import { createServerSupabaseClient } from "@/libs/supabase-server";
import { AllTasksView } from "@/components/dashboard/AllTasksView";

export default async function AllTasksPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get all base tasks
  const { data: baseTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get all task instances
  const { data: taskInstances } = await supabase
    .from("task_instances")
    .select(
      `
      *,
      tasks (*)
    `
    )
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  // Get generation state for recurring tasks
  const { data: generationState } = await supabase
    .from("task_generation_state")
    .select("*")
    .in("task_id", baseTasks?.map((t) => t.id) || []);

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
        baseTasks={baseTasks || []}
        taskInstances={taskInstances || []}
        generationState={generationState || []}
        userId={user.id}
      />
    </div>
  );
}
