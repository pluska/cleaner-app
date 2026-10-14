import { assessmentSchema } from "@/libs/ai/schemas";
import { readJson, errorResponse, HttpError } from "@/libs/server/http";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { homeAssessments } from "@/db/schema";
import { generateCleaningTasks } from "@/libs/ai/cleaning";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = assessmentSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400,"Invalid home assessment");
    const assessment = parsed.data;
    const language = assessment.language;

    // Store the assessment
    const [stored] = await db
      .insert(homeAssessments)
      .values({
        userId: session.user.id,
        homeType: assessment.home_type,
        lifestyle: assessment.lifestyle,
        cleaningPreferences: {minimal:1,standard:2,thorough:3}[assessment.cleaning_preferences],
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
          cleaningPreferences: {minimal:1,standard:2,thorough:3}[assessment.cleaning_preferences],
          pets: assessment.pets ? JSON.stringify(assessment.pets) : null,
          children: assessment.children ? JSON.stringify(assessment.children) : null,
          allergies: assessment.allergies ? JSON.stringify(assessment.allergies) : null,
          rooms: assessment.rooms,
          updatedAt: new Date().toISOString(),
        }
      })
      .returning();

    // Generate validated recommendations or curated fallback content
    const recommendations = await generateCleaningTasks(
      {
        ...assessment,
        id: session.user.id, user_id: session.user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        home_type: assessment.home_type,
        cleaning_preferences: assessment.cleaning_preferences,
      },
      language, session.user.id
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
    return errorResponse(error);
  }
}
