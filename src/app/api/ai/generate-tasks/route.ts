import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { homeAssessments } from "@/db/schema";
import { generateCleaningTasks } from "@/libs/gemini";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const assessment = body;
    const language = body.language || "en";

    if (!assessment.home_type || !assessment.lifestyle || assessment.cleaning_preferences === undefined) {
      return NextResponse.json(
        { error: "Missing required assessment fields" },
        { status: 400 }
      );
    }

    // Store the assessment
    const [stored] = await db
      .insert(homeAssessments)
      .values({
        userId: session.user.id,
        homeType: assessment.home_type,
        lifestyle: assessment.lifestyle,
        cleaningPreferences: assessment.cleaning_preferences,
        pets: assessment.pets ? JSON.stringify(assessment.pets) : null,
        children: assessment.children ? JSON.stringify(assessment.children) : null,
        allergies: assessment.allergies ? JSON.stringify(assessment.allergies) : null,
        rooms: assessment.rooms, // Assuming it's already a JSON-compatible array
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: homeAssessments.userId,
        set: {
          homeType: assessment.home_type,
          lifestyle: assessment.lifestyle,
          cleaningPreferences: assessment.cleaning_preferences,
          pets: assessment.pets ? JSON.stringify(assessment.pets) : null,
          children: assessment.children ? JSON.stringify(assessment.children) : null,
          allergies: assessment.allergies ? JSON.stringify(assessment.allergies) : null,
          rooms: assessment.rooms,
          updatedAt: new Date().toISOString(),
        }
      })
      .returning();

    // Generate recommendations via Gemini
    const recommendations = await generateCleaningTasks(
      {
        ...assessment,
        home_type: assessment.home_type,
        cleaning_preferences: assessment.cleaning_preferences,
      },
      language as "en" | "es"
    );

    return NextResponse.json({
      assessment: stored,
      recommendations,
      metadata: {
        total_tasks: recommendations.length,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI Task Generation Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
