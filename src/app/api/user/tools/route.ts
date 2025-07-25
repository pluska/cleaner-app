import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// GET /api/user/tools - Get user tools
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user tools
    const { data: tools, error } = await supabase
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
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
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
    const toolDefinition = toolsData.tools.find((t: any) => t.id === tool_id);

    if (!toolDefinition) {
      return NextResponse.json({ error: "Invalid tool ID" }, { status: 400 });
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

    // Add tool to user inventory
    const { data: tool, error } = await supabase
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
