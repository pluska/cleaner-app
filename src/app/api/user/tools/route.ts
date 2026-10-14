import { readJson, textField, errorResponse } from "@/libs/server/http";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { tools, userTools, userProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/user/tools - Get user tools
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uTools = await db
      .select({
        id: userTools.id,
        toolId: userTools.toolId,
        currentDurability: userTools.currentDurability,
        isEquipped: userTools.isEquipped,
        acquiredAt: userTools.acquiredAt,
        tool: {
          nameEn: tools.nameEn,
          nameEs: tools.nameEs,
          category: tools.category,
          rarity: tools.rarity,
          durabilityMax: tools.durabilityMax,
        }
      })
      .from(userTools)
      .innerJoin(tools, eq(userTools.toolId, tools.id))
      .where(eq(userTools.userId, session.user.id))
      .orderBy(userTools.acquiredAt);

    return NextResponse.json({ tools: uTools || [] });
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
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await readJson(request);
    const tool_id = textField(body.tool_id,"tool_id",100);

    // Validate input
    if (!tool_id) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      );
    }

    // Check if tool exists in dictionary, seed if empty
    let toolDefinition = await db
      .select()
      .from(tools)
      .where(eq(tools.id, tool_id))
      .limit(1)
      .then(rows => rows[0]);

    if (!toolDefinition) {
      // Seed from JSON if needed
      const toolsData = (await import("@/data/templates/cleaning-tools.json")).default as {
        tools: Array<{
          id: string;
          name_en?: string;
          name_es?: string;
          name?: string;
          category: string;
          rarity: string;
          durability_max: number;
        }>;
      };
      const jsonTool = toolsData.tools.find((t) => t.id === tool_id);

      if (!jsonTool) {
        return NextResponse.json({ error: "Invalid tool ID" }, { status: 400 });
      }

      for (const t of toolsData.tools) {
        await db.insert(tools).values({
          id: t.id,
          nameEn: t.name_en || t.name || "",
          nameEs: t.name_es || t.name || "",
          category: t.category,
          rarity: t.rarity || "common",
          durabilityMax: t.durability_max || 100,
          durabilityLossPerUse: 1,
        }).onConflictDoNothing();
      }

      toolDefinition = await db
        .select()
        .from(tools)
        .where(eq(tools.id, tool_id))
        .limit(1)
        .then(rows => rows[0]);
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
        coins: 0,
      }).onConflictDoNothing();
    }

    // Check if user already has this tool
    const [existingTool] = await db
      .select({ id: userTools.id })
      .from(userTools)
      .where(
        and(
          eq(userTools.userId, session.user.id),
          eq(userTools.toolId, tool_id)
        )
      )
      .limit(1);

    if (existingTool) {
      return NextResponse.json(
        { error: "Tool already in inventory" },
        { status: 400 }
      );
    }

    // Add tool to user inventory
    const [newUserTool] = await db
      .insert(userTools)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        toolId: tool_id,
        currentDurability: toolDefinition.durabilityMax,
        isEquipped: false,
      })
      .returning();

    return NextResponse.json({ tool: newUserTool }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
