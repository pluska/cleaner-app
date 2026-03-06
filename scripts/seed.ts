import { db } from "../src/db";
import { rooms, tools, taskTemplates, taskSubtemplates, taskTemplateTools, users, userProfiles } from "../src/db/schema";
import { RRule } from "rrule";
import * as fs from "fs";
import * as path from "path";
import { eq } from "drizzle-orm";

const MOCK_USER_ID = "user-123";

async function main() {
  console.log("Seeding D1 database...");

  // 1. Create Mock User
  const existingUser = await db.select().from(users).where(eq(users.id, MOCK_USER_ID));
  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: MOCK_USER_ID,
      name: "Test User",
      email: "test@example.com",
    });
    await db.insert(userProfiles).values({
      userId: MOCK_USER_ID,
      level: 1,
      xp: 0,
      coins: 0,
    });
    console.log("Created mock user.");
  }

  // Read JSON
  const jsonPath = path.join(process.cwd(), "src/data/templates/task-templates-en.json");
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  // Track rooms and tools to insert them
  const generatedRooms = new Set<string>();
  const generatedTools = new Set<string>();
  
  data.templates.forEach((t: any) => {
    generatedRooms.add(t.category);
    t.tools_required.forEach((toolId: string) => generatedTools.add(toolId));
  });

  // 2. Insert Rooms
  for (const cat of generatedRooms) {
    const existing = await db.select().from(rooms).where(eq(rooms.id, cat));
    if (existing.length === 0) {
      await db.insert(rooms).values({
        id: cat,
        name: String(cat).toUpperCase().replace("_", " "),
        icon: "Home",
      });
    }
  }

  // 3. Insert Tools (stubbing data from JSON IDs)
  for (const tId of generatedTools) {
    const existing = await db.select().from(tools).where(eq(tools.id, tId));
    if (existing.length === 0) {
      await db.insert(tools).values({
        id: tId,
        nameEn: String(tId).replace(/_/g, " "),
        nameEs: String(tId).replace(/_/g, " "),
        category: "cleaning_supplies",
      });
    }
  }

  // 4. Insert Templates
  for (const t of data.templates) {
    const existing = await db.select().from(taskTemplates).where(eq(taskTemplates.id, t.id));
    if (existing.length > 0) {
      // Reset logic for repeatable seeds
      await db.delete(taskTemplates).where(eq(taskTemplates.id, t.id)); 
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day to avoid time offset shifting
    const rruleStr = new RRule({ freq: RRule.DAILY, interval: t.base_frequency_days, dtstart: today }).toString();

    await db.insert(taskTemplates).values({
      id: t.id,
      userId: MOCK_USER_ID,
      roomId: t.category,
      title: t.name,
      description: t.description,
      importanceLevel: t.importance_level,
      expReward: t.exp_reward,
      healthImpact: t.health_impact,
      scientificSource: t.scientific_source,
      aiExplanation: t.ai_explanation,
      rrule: rruleStr,
      startDate: today,
    });

    // 5. Insert Subtasks
    if (t.subtasks) {
      for (const sub of t.subtasks) {
        await db.insert(taskSubtemplates).values({
          id: sub.id,
          templateId: t.id,
          title: sub.title,
          description: sub.description,
          estimatedMinutes: sub.estimated_minutes,
          orderIndex: sub.order_index,
          isRequired: sub.is_required,
          expReward: sub.exp_reward,
          difficulty: sub.difficulty || "medium",
        });
      }
    }

    // 6. Insert TemplateTools
    if (t.tools_required) {
      for (const toolId of t.tools_required) {
        await db.insert(taskTemplateTools).values({
          templateId: t.id,
          toolId: toolId,
          durabilityLossOverride: t.tools_usage?.[toolId]?.durability_loss || null,
        });
      }
    }
  }

  console.log(`Seeded ${data.templates.length} templates successfully!`);
}

main().catch(console.error);
