import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = (await params).id;
    const today = new Date().toISOString().split("T")[0];

    // Update the task's due_date to today
    const { data: task, error } = await supabase
      .from("tasks")
      .update({ due_date: today })
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
