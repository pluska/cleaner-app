import { readJson, errorResponse, textField, HttpError } from "@/libs/server/http";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { userProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    if (!profile) {
      const [newProfile] = await db
        .insert(userProfiles)
        .values({
          userId: userId,
          level: 1,
          xp: 0,
          coins: 0,
          currentStreak: 0,
          maxStreak: 0,
        })
        .onConflictDoNothing()
        .returning();

      if (newProfile) return NextResponse.json({ profile: newProfile });
      const [existing] = await db.select().from(userProfiles).where(eq(userProfiles.userId,userId));
      return NextResponse.json({profile:existing});
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Unexpected error in profile GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await readJson(request);
    const { username, display_name, avatar_url, name, image } = body;

    const candidate = name ?? display_name ?? username;
    const newName = candidate === undefined ? undefined : textField(candidate, "name", 100);
    const newImage = image ?? avatar_url;
    if (newImage !== undefined && newImage !== null && (typeof newImage !== 'string' || newImage.length > 2048 || !(/^(https:\/\/|\/(?!\/))/.test(newImage)))) throw new HttpError(400,'Invalid image URL');

    if (newName && (typeof newName !== "string" || newName.length < 2)) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (newName !== undefined) updateData.name = newName;
    if (newImage !== undefined) updateData.image = newImage;

    if (Object.keys(updateData).length > 0) {
      await db.update(users).set(updateData).where(eq(users.id, session.user.id));
    }

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id));

    return NextResponse.json({ profile, user: updateData });
  } catch (error) {
    return errorResponse(error);
  }
}
