import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// GET /api/user/tools - Get user tools
export async function GET(request: NextRequest) {
  try {
    // Use direct client for now to avoid cookie issues
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

    // Get user tools using service role client
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: tools, error } = await serviceRoleClient
      .from("user_tools")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("acquired_at", { ascending: false });

    if (error) {
      console.error("Error fetching user tools:", error);
      return NextResponse.json(
        { error: "Failed to fetch tools" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tools: tools || [] });
  } catch (error) {
    console.error("Unexpected error in tools GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/user/tools - Add new tool to user inventory
export async function POST(request: NextRequest) {
  try {
    // Use direct client for now to avoid cookie issues
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
    const { tool_id, tool_name } = body;

    // Validate input
    if (!tool_id || !tool_name) {
      return NextResponse.json(
        { error: "Tool ID and name are required" },
        { status: 400 }
      );
    }

    // Get tool definition from cleaning-tools.json
    const toolsData = await import("@/data/templates/cleaning-tools.json");
    const toolDefinition = toolsData.default.tools.find(
      (t: any) => t.id === tool_id
    );

    if (!toolDefinition) {
      return NextResponse.json({ error: "Invalid tool ID" }, { status: 400 });
    }

    // Check if user has a profile, create one if not
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if profile exists using service role client
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

    // Check if user already has this tool
    const { data: existingTool } = await supabase
      .from("user_tools")
      .select("id")
      .eq("user_id", user.id)
      .eq("tool_id", tool_id)
      .eq("is_active", true)
      .single();

    if (existingTool) {
      return NextResponse.json(
        { error: "Tool already in inventory" },
        { status: 400 }
      );
    }

    // Add tool to user inventory using service role client
    const { data: tool, error } = await serviceRoleClient
      .from("user_tools")
      .insert([
        {
          user_id: user.id,
          tool_id: tool_id,
          tool_name: tool_name,
          current_durability: toolDefinition.durability_max,
          max_durability: toolDefinition.durability_max,
          uses_count: 0,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding tool to inventory:", error);
      return NextResponse.json(
        { error: "Failed to add tool" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tool }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in tools POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
