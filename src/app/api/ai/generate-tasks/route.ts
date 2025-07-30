import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabase-server";
import { HomeAssessment, AIRecommendation } from "@/types";
import { generateCleaningTasks } from "@/libs/gemini";

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

    // Parse request body
    const body = await request.json();
    const assessment: HomeAssessment = body;
    const language = body.language || "en";

    // Validate required fields
    if (
      !assessment.home_type ||
      !assessment.lifestyle ||
      !assessment.cleaning_preferences
    ) {
      return NextResponse.json(
        { error: "Missing required assessment fields" },
        { status: 400 }
      );
    }

    // Store the home assessment
    const { data: storedAssessment, error: assessmentError } = await supabase
      .from("home_assessments")
      .insert([
        {
          ...assessment,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (assessmentError) {
      console.error("Error storing assessment:", assessmentError);
      return NextResponse.json(
        { error: "Failed to store assessment" },
        { status: 500 }
      );
    }

    // Generate recommendations using Gemini AI
    const recommendations = await generateCleaningTasks(
      assessment,
      language as "en" | "es"
    );

    return NextResponse.json({
      assessment: storedAssessment,
      recommendations,
    });
  } catch (error) {
    console.error("AI Task Generation Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
