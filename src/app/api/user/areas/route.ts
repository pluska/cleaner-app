import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { rooms, userProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/user/areas - Get user home areas
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRooms = await db
      .select()
      .from(rooms)
      .where(eq(rooms.userId, session.user.id))
      .orderBy(rooms.name);

    return NextResponse.json({ areas: userRooms || [] });
  } catch (error) {
    console.error("Unexpected error in areas GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/user/areas - Add new home area
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      area_name,
      area_type,
    } = body;

    // Validate input
    if (!area_name || !area_type) {
      return NextResponse.json(
        { error: "Area name and type are required" },
        { status: 400 }
      );
    }

    // Check if user has a profile, create one if not
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);

    if (!profile) {
      await db.insert(userProfiles).values({
        userId: session.user.id,
        level: 1,
        xp: 0,
        coins: 100,
      });
    }

    // Check if area already exists
    const [existingArea] = await db
      .select({ id: rooms.id })
      .from(rooms)
      .where(
        and(
          eq(rooms.userId, session.user.id),
          eq(rooms.name, area_name)
        )
      )
      .limit(1);

    if (existingArea) {
      return NextResponse.json(
        { error: "Area already exists" },
        { status: 400 }
      );
    }

    // Add area to user's home
    const [newRoom] = await db
      .insert(rooms)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        name: area_name,
        icon: area_type === "kitchen" ? "Utensils" : area_type === "bathroom" ? "Bath" : "Home",
        isCustom: true,
      })
      .returning();

    return NextResponse.json({ area: newRoom }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in areas POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
