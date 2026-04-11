import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.email, email));

    // Do not reveal if the user exists or not to prevent user enumeration
    if (user) {
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      await db.insert(verificationTokens).values({
        identifier: email,
        token: token,
        expires: expires,
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
      
      // Since no email API key is configured, log the URL to verify in tests
      console.log(`[Email Simulation] Password reset link for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
