import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// GET /api/user/areas - Get user home areas
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

    // Get user home areas
    const { data: areas, error } = await supabase
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

    const validAreaTypes = [
      "kitchen",
      "bathroom",
      "bedroom",
      "living_room",
      "dining_room",
      "office",
      "laundry_room",
      "garage",
      "basement",
      "attic",
      "hallway",
      "entryway",
    ];

    if (!validAreaTypes.includes(area_type)) {
      return NextResponse.json({ error: "Invalid area type" }, { status: 400 });
    }

    const validSizes = ["small", "medium", "large"];
    if (!validSizes.includes(size)) {
      return NextResponse.json({ error: "Invalid size" }, { status: 400 });
    }

    // Check if area already exists for this user
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

    // Add home area
    const { data: area, error } = await supabase
      .from("home_areas")
      .insert([
        {
          user_id: user.id,
          area_name: area_name,
          area_type: area_type,
          current_health: 100,
          max_health: 100,
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
