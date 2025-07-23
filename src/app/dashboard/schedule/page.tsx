import { createServerSupabaseClient } from "@/libs/supabase-server";
import { ScheduleView } from "@/components/dashboard/ScheduleView";
import { ScheduleHeader } from "@/components/dashboard/ScheduleHeader";
import { getAllTasksForSchedule } from "@/libs/task-utils";

export default async function SchedulePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get all tasks for the schedule view, including instances
  const allTasks = await getAllTasksForSchedule(user.id);

  return (
    <div className="max-w-7xl mx-auto">
      <ScheduleHeader />

      <ScheduleView tasks={allTasks} userId={user.id} />
    </div>
  );
}
