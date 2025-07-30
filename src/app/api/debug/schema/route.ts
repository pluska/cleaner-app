import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if gamified tables exist
    const tables = [
      "user_profiles",
      "user_tools",
      "home_areas",
      "task_templates",
      "task_subtasks",
      "user_tasks",
      "task_instances",
    ];

    const schemaInfo: Record<
      string,
      { exists: boolean; error?: string; count?: number }
    > = {};

    for (const table of tables) {
      try {
        const { data, error } = await serviceRoleClient
          .from(table)
          .select("*")
          .limit(1);

        if (error) {
          schemaInfo[table] = { exists: false, error: error.message };
        } else {
          schemaInfo[table] = { exists: true, count: data?.length || 0 };
        }
      } catch {
        schemaInfo[table] = { exists: false, error: "Table not found" };
      }
    }

    return NextResponse.json({ schema: schemaInfo });
  } catch (error) {
    console.error("Schema check error:", error);
    return NextResponse.json(
      { error: "Failed to check schema" },
      { status: 500 }
    );
  }
}
