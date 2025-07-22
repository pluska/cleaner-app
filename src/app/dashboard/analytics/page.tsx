import { createServerSupabaseClient } from "@/libs/supabase-server";
import { AnalyticsView } from "@/components/dashboard/AnalyticsView";
import { AnalyticsHeader } from "@/components/dashboard/AnalyticsHeader";

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get all tasks for analytics
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id);

  return (
    <div className="max-w-7xl mx-auto">
      <AnalyticsHeader />

      <AnalyticsView tasks={tasks || []} />
    </div>
  );
}
