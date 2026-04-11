import { db } from "@/db";
import { users, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Se requieren tanto el pergamino (email) como la palabra secreta (contraseña)." },
        { status: 400 }
      );
    }

    // RPG Themed Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Tu correo no parece pertenecer a ningún reino conocido." },
        { status: 400 }
      );
    }

    // RPG Themed Password Validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Tu santo y seña debe contener al menos 8 caracteres para ser seguro." },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: "Tu santo y seña debe contener al menos 8 caracteres, mayúsculas y números para ser seguro." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return NextResponse.json(
        { error: "Este pergamino de comunicación ya pertenece a otro Héroe del reino." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        hashedPassword,
        name: name || email.split("@")[0],
      })
      .returning();

    // Initialize user profile
    await db.insert(userProfiles).values({
      userId: newUser.id,
      level: 1,
      xp: 0,
      coins: 0,
      currentStreak: 0,
      maxStreak: 0,
    });

    // Return user without hashed password
    const userWithoutPassword = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };

    return NextResponse.json(
      { user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
