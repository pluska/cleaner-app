import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabase-server";

export async function GET(request: NextRequest) {
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

    // Get the user's home assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from("home_assessments")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (assessmentError) {
      if (assessmentError.code === "PGRST116") {
        // No assessment found
        return NextResponse.json({ assessment: null });
      }
      throw assessmentError;
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("Error fetching home assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
