import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabase-server";
import { HomeAssessment, AIRecommendation } from "@/types";

// Mock AI response for now - in production this would call OpenAI API
const MOCK_AI_RESPONSE: AIRecommendation[] = [
  {
    task_name: "Kitchen Counter Cleaning",
    frequency_days: 1,
    importance_level: 5,
    reasoning:
      "Daily counter cleaning prevents bacterial growth and cross-contamination",
    health_impact: "Prevents foodborne illnesses and maintains kitchen hygiene",
    scientific_source: "CDC Food Safety Guidelines",
    source_url: "https://www.cdc.gov/foodsafety/",
    friendly_explanation:
      "Keeping your kitchen counters clean daily prevents the spread of bacteria that can cause food poisoning. It's especially important if you have children or pets.",
    exp_reward: 10,
    area_health_impact: 15,
    tools_required: ["microfiber_cloth", "all_purpose_cleaner"],
    subtasks: [
      {
        title: "Wipe down all counter surfaces",
        description: "Remove crumbs and spills",
        estimated_minutes: 5,
        order_index: 1,
        is_required: true,
        exp_reward: 5,
        tools_needed: ["microfiber_cloth"],
        difficulty: "easy",
      },
      {
        title: "Sanitize high-touch areas",
        description: "Clean around sink, stove, and handles",
        estimated_minutes: 3,
        order_index: 2,
        is_required: true,
        exp_reward: 5,
        tools_needed: ["all_purpose_cleaner"],
        difficulty: "easy",
      },
    ],
  },
  {
    task_name: "Bathroom Surface Cleaning",
    frequency_days: 2,
    importance_level: 4,
    reasoning: "Regular bathroom cleaning prevents mold and bacterial growth",
    health_impact: "Reduces risk of respiratory issues and infections",
    scientific_source: "EPA Mold Guidelines",
    source_url: "https://www.epa.gov/mold",
    friendly_explanation:
      "Bathrooms are high-moisture areas where bacteria and mold can thrive. Regular cleaning prevents these issues and keeps your family healthy.",
    exp_reward: 15,
    area_health_impact: 20,
    tools_required: ["bathroom_cleaner", "scrub_brush"],
    subtasks: [
      {
        title: "Clean toilet surfaces",
        description: "Wipe down toilet seat, handle, and base",
        estimated_minutes: 5,
        order_index: 1,
        is_required: true,
        exp_reward: 8,
        tools_needed: ["bathroom_cleaner"],
        difficulty: "medium",
      },
      {
        title: "Clean sink and counter",
        description: "Remove toothpaste and soap residue",
        estimated_minutes: 3,
        order_index: 2,
        is_required: true,
        exp_reward: 7,
        tools_needed: ["bathroom_cleaner"],
        difficulty: "easy",
      },
    ],
  },
  {
    task_name: "Floor Vacuuming",
    frequency_days: 3,
    importance_level: 3,
    reasoning: "Regular vacuuming removes allergens and improves air quality",
    health_impact: "Reduces allergy symptoms and improves respiratory health",
    scientific_source: "American Academy of Allergy, Asthma & Immunology",
    source_url: "https://www.aaaai.org/",
    friendly_explanation:
      "Vacuuming regularly removes dust, pet dander, and other allergens that can trigger allergies and asthma. It's especially important if you have pets or allergies.",
    exp_reward: 12,
    area_health_impact: 10,
    tools_required: ["vacuum_cleaner"],
    subtasks: [
      {
        title: "Vacuum all carpeted areas",
        description: "Focus on high-traffic areas",
        estimated_minutes: 10,
        order_index: 1,
        is_required: true,
        exp_reward: 8,
        tools_needed: ["vacuum_cleaner"],
        difficulty: "medium",
      },
      {
        title: "Vacuum hard floors",
        description: "Use appropriate attachment",
        estimated_minutes: 8,
        order_index: 2,
        is_required: true,
        exp_reward: 4,
        tools_needed: ["vacuum_cleaner"],
        difficulty: "easy",
      },
    ],
  },
];

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
    const assessment: HomeAssessment = await request.json();

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

    // TODO: In production, this would call OpenAI API
    // For now, return mock recommendations
    const recommendations = MOCK_AI_RESPONSE.map((rec) => ({
      ...rec,
      // Adjust frequency based on lifestyle
      frequency_days:
        assessment.lifestyle === "busy"
          ? Math.ceil(rec.frequency_days * 1.5)
          : assessment.lifestyle === "relaxed"
          ? Math.ceil(rec.frequency_days * 0.7)
          : rec.frequency_days,
      // Adjust importance based on cleaning preferences
      importance_level:
        assessment.cleaning_preferences === "thorough"
          ? Math.min(rec.importance_level + 1, 5)
          : assessment.cleaning_preferences === "minimal"
          ? Math.max(rec.importance_level - 1, 1)
          : rec.importance_level,
    }));

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
