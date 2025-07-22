import { createServerSupabaseClient } from "@/libs/supabase-server";
import { ScheduleView } from "@/components/dashboard/ScheduleView";
import { ScheduleHeader } from "@/components/dashboard/ScheduleHeader";

export default async function SchedulePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get all tasks for the user
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  return (
    <div className="max-w-7xl mx-auto">
      <ScheduleHeader />

      <ScheduleView tasks={tasks || []} userId={user.id} />
    </div>
  );
}
