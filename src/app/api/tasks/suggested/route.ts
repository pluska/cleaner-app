import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { taskTemplates, taskInstances, rooms } from "@/db/schema";
import { eq } from "drizzle-orm";

interface JsonTaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  base_frequency_days: number;
  importance_level: number;
  exp_reward: number;
  subtasks: unknown[];
}

// Load task templates from JSON
const loadTaskTemplates = async (
  language: string = "en"
): Promise<JsonTaskTemplate[]> => {
  try {
    const templates = await import(
      `@/data/templates/task-templates-${language}.json`
    );
    return templates.default.templates || [];
  } catch {
    const englishTemplates = await import(
      "@/data/templates/task-templates-en.json"
    );
    return englishTemplates.default.templates || [];
  }
};

// Filter templates based on user's rooms and preferences
const filterTemplatesByUserProfile = (
  templates: JsonTaskTemplate[],
  userRooms: (typeof rooms.$inferSelect)[],
  lifestyle: string,
  cleaning_preferences: string,
  pets: boolean,
  children: boolean,
  allergies: boolean
): JsonTaskTemplate[] => {
  const roomNames = userRooms.map(r => r.name.toLowerCase());
  
  return templates.filter((template) => {
    // Check if template is for a room the user has
    if (template.category && !roomNames.includes(template.category.toLowerCase())) {
      return false;
    }

    // Adjust frequency based on lifestyle
    let adjustedFrequency = template.base_frequency_days || 7;

    if (lifestyle === "busy") {
      adjustedFrequency = Math.max(adjustedFrequency * 1.5, 7);
    } else if (lifestyle === "relaxed") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.7, 3);
    }

    if (cleaning_preferences === "minimal") {
      adjustedFrequency = Math.max(adjustedFrequency * 1.8, 10);
    } else if (cleaning_preferences === "thorough") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.6, 2);
    }

    if (pets && template.category !== "exterior") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.8, 3);
    }

    if (children && template.category !== "exterior") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.8, 3);
    }

    if (allergies && template.category !== "exterior") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.7, 2);
    }

    template.base_frequency_days = Math.round(adjustedFrequency);
    return true;
  });
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      rooms: roomList,
      lifestyle,
      cleaning_preferences,
      pets,
      children,
      allergies,
      language = "en",
    } = body;

    if (!roomList || !lifestyle || cleaning_preferences === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get real user rooms from Drizzle
    const userRooms = await db
      .select()
      .from(rooms)
      .where(eq(rooms.userId, session.user.id));

    // Load and filter templates
    const allTemplates = await loadTaskTemplates(language);
    const filteredTemplates = filterTemplatesByUserProfile(
      allTemplates,
      userRooms,
      lifestyle,
      cleaning_preferences,
      pets,
      children,
      allergies
    );

    const createdTemplates = [];
    const createdInstances = [];
    const today = new Date();

    // Create task templates and initial instances
    for (const template of filteredTemplates) {
      const templateId = crypto.randomUUID();
      
      // Insert Template
      const [newTemplate] = await db.insert(taskTemplates).values({
        id: templateId,
        userId: session.user.id,
        roomId: userRooms.find(r => r.name.toLowerCase() === template.category.toLowerCase())?.id || "general",
        title: template.name,
        description: template.description || "",
        importanceLevel: template.importance_level || 3,
        expReward: template.exp_reward || 10,
        rrule: `FREQ=DAILY;INTERVAL=${template.base_frequency_days}`,
        startDate: today,
        nextOccurrence: today,
      }).returning();

      createdTemplates.push(newTemplate);

      // Generate instances for the next 30 days
      for (let i = 0; i < 30; i += template.base_frequency_days) {
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + i);
        const dateStr = dueDate.toISOString().split("T")[0];

        const [instance] = await db.insert(taskInstances).values({
          id: crypto.randomUUID(),
          templateId: templateId,
          dueDate: dateStr,
          status: "pending",
        }).returning();
        
        createdInstances.push(instance);
      }
    }

    return NextResponse.json({
      success: true,
      templatesCount: createdTemplates.length,
      instancesCount: createdInstances.length,
      message: `Generated ${createdTemplates.length} task templates and ${createdInstances.length} instances`,
    });
  } catch (error) {
    console.error("Error generating suggested tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
