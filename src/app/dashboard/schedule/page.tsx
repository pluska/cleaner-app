import { createServerSupabaseClient } from "@/libs/supabase-server";
import { ScheduleView } from "@/components/dashboard/schedule/ScheduleView";
import { ScheduleHeader } from "@/components/dashboard/schedule/ScheduleHeader";

export default async function SchedulePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get all tasks for the schedule view
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching tasks for schedule:", error);
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ScheduleHeader />

      <ScheduleView tasks={tasks || []} />
    </div>
  );
}
