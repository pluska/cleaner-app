import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// GET /api/user/areas - Get user home areas
export async function GET(request: NextRequest) {
  try {
    // Use direct client for consistent authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Set the session with the token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user home areas using service role client to bypass RLS
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: areas, error } = await serviceRoleClient
      .from("home_areas")
      .select("*")
      .eq("user_id", user.id)
      .order("area_name", { ascending: true });

    if (error) {
      console.error("Error fetching home areas:", error);
      return NextResponse.json(
        { error: "Failed to fetch areas" },
        { status: 500 }
      );
    }

    return NextResponse.json({ areas: areas || [] });
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
    // Use direct client for consistent authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Set the session with the token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      area_name,
      area_type,
      size = "medium",
      has_carpet = false,
      has_hardwood = false,
      has_tile = false,
      special_features = {},
    } = body;

    // Validate input
    if (!area_name || !area_type) {
      return NextResponse.json(
        { error: "Area name and type are required" },
        { status: 400 }
      );
    }

    // Create service role client to bypass RLS
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user has a profile, create one if not
    const { data: profile, error: profileError } = await serviceRoleClient
      .from("user_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, create one
      const { error: createProfileError } = await serviceRoleClient
        .from("user_profiles")
        .insert({
          user_id: user.id,
          username: user.email?.split("@")[0] || "User",
          display_name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User",
          level: 1,
          experience_points: 0,
          total_tasks_completed: 0,
          total_subtasks_completed: 0,
          streak_days: 0,
          longest_streak: 0,
          coins: 100,
          gems: 10,
        });

      if (createProfileError) {
        console.error("Error creating profile:", createProfileError);
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }
    } else if (profileError) {
      console.error("Error checking profile:", profileError);
      return NextResponse.json(
        { error: "Failed to check user profile" },
        { status: 500 }
      );
    }

    // Check if area already exists
    const { data: existingArea } = await supabase
      .from("home_areas")
      .select("id")
      .eq("user_id", user.id)
      .eq("area_name", area_name)
      .single();

    if (existingArea) {
      return NextResponse.json(
        { error: "Area already exists" },
        { status: 400 }
      );
    }

    // Calculate initial health based on area type and size
    let maxHealth = 100;
    if (area_type === "kitchen") maxHealth = 120;
    if (area_type === "bathroom") maxHealth = 80;
    if (size === "large") maxHealth += 20;
    if (size === "small") maxHealth -= 20;

    // Add area to user's home using service role client
    const { data: area, error } = await serviceRoleClient
      .from("home_areas")
      .insert([
        {
          user_id: user.id,
          area_name: area_name,
          area_type: area_type,
          current_health: maxHealth,
          max_health: maxHealth,
          size: size,
          has_carpet: has_carpet,
          has_hardwood: has_hardwood,
          has_tile: has_tile,
          special_features: special_features,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding home area:", error);
      return NextResponse.json(
        { error: "Failed to add area" },
        { status: 500 }
      );
    }

    return NextResponse.json({ area }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in areas POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
