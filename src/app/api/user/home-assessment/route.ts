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

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      home_type,
      lifestyle,
      cleaning_preferences,
      pets,
      children,
      allergies,
      rooms,
    } = body;

    // Validate required fields
    if (!home_type || !lifestyle || cleaning_preferences === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if assessment already exists
    const { data: existingAssessment } = await supabase
      .from("home_assessments")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let assessment;
    if (existingAssessment) {
      // Update existing assessment
      const { data, error } = await supabase
        .from("home_assessments")
        .update({
          home_type,
          lifestyle,
          cleaning_preferences,
          pets,
          children,
          allergies,
          rooms,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      assessment = data;
    } else {
      // Create new assessment
      const { data, error } = await supabase
        .from("home_assessments")
        .insert({
          user_id: user.id,
          home_type,
          lifestyle,
          cleaning_preferences,
          pets,
          children,
          allergies,
          rooms,
        })
        .select()
        .single();

      if (error) throw error;
      assessment = data;
    }

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating home assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
