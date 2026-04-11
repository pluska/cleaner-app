import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { homeAssessments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's home assessment
    const [assessment] = await db
      .select()
      .from(homeAssessments)
      .where(eq(homeAssessments.userId, session.user.id))
      .limit(1);

    return NextResponse.json({ assessment: assessment || null });
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
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
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

    // Update or insert (upsert)
    const [assessment] = await db
      .insert(homeAssessments)
      .values({
        userId: session.user.id,
        homeType: home_type,
        lifestyle,
        cleaningPreferences: cleaning_preferences,
        pets,
        children,
        allergies,
        rooms,
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: homeAssessments.userId,
        set: {
          homeType: home_type,
          lifestyle,
          cleaningPreferences: cleaning_preferences,
          pets,
          children,
          allergies,
          rooms,
          updatedAt: new Date().toISOString(),
        },
      })
      .returning();

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating home assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
