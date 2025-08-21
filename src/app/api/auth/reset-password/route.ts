import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, access_token } = body;

    if (!password || !access_token) {
      return NextResponse.json(
        { error: "Password and access token are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Create Supabase client with the access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      }
    );

    // First, we need to set the session using the access token
    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({
        access_token: access_token,
        refresh_token: body.refresh_token || "",
      });

    if (sessionError) {
      console.error("Session error:", sessionError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    if (!sessionData.session) {
      console.error("No session created");
      return NextResponse.json(
        { error: "Could not create session" },
        { status: 400 }
      );
    }

    // Now update the user's password
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Password update error:", error);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error in reset-password route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
