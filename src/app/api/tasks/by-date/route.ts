import { createServerSupabaseClient } from "@/libs/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Get tasks that are due on the specified date
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("due_date", date)
      .order("priority", { ascending: false });

    // Get task instances for the specified date
    const { data: taskInstances } = await supabase
      .from("task_instances")
      .select(
        `
        *,
        tasks (*)
      `
      )
      .eq("user_id", user.id)
      .eq("due_date", date)
      .order("created_at", { ascending: true });

    return NextResponse.json({ tasks, taskInstances });
  } catch (error) {
    console.error("Error fetching tasks by date:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
