import { NextRequest, NextResponse } from "next/server";
import { TaskService } from "@/services/taskService";
// Note: Authentication will be migrated to NextAuth later, for now we mock the userId
// since we removed the direct Supabase dependency for tasks.
const MOCK_USER_ID = "user-123";

// GET /api/tasks - Get all tasks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];
    
    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Generate and merge tasks for the requested date using our gamified RRule service
    const tasks = await TaskService.getTasksForDate(MOCK_USER_ID, targetDate);

    return NextResponse.json({ 
      date: dateParam,
      tasks 
    });
  } catch (error) {
    console.error("API Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { RRule } from "rrule";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { taskTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST /api/tasks - Create a new gamified task blueprint (template)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate minimal required fields
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!body.roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    const validFrequencies = ["daily", "weekly", "monthly", "yearly", "once"];
    if (body.frequency && !validFrequencies.includes(body.frequency)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
    }

    // 1. Generate the mathematical RRULE string
    let rruleStr = "";
    const startDate = new Date(body.startDate || new Date());
    
    if (body.frequency === "daily") {
      rruleStr = new RRule({ freq: RRule.DAILY, dtstart: startDate }).toString();
    } else if (body.frequency === "weekly") {
       // If a specific day is passed, use it, otherwise use the start date's day
       const byweekday = body.dayOfWeek !== undefined ? [body.dayOfWeek] : undefined;
       rruleStr = new RRule({ freq: RRule.WEEKLY, byweekday, dtstart: startDate }).toString();
    } else if (body.frequency === "monthly") {
      rruleStr = new RRule({ freq: RRule.MONTHLY, dtstart: startDate }).toString();
    } else if (body.frequency === "yearly") {
      rruleStr = new RRule({ freq: RRule.YEARLY, dtstart: startDate }).toString();
    } else {
      // "once" - we use EXACTLY one count so it only occurs on the start date
      rruleStr = new RRule({ freq: RRule.DAILY, count: 1, dtstart: startDate }).toString();
    }

    // 2. Insert the Template into D1
    const newTemplateId = uuidv4();
    await db.insert(taskTemplates).values({
      id: newTemplateId,
      userId: MOCK_USER_ID,
      roomId: body.roomId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      
      // Gamification Base Defaults (Can be passed from frontend if complex UI exists)
      importanceLevel: body.importanceLevel || 3,
      expReward: body.expReward || 10,
      healthImpact: body.healthImpact || null,
      scientificSource: body.scientificSource || null,
      aiExplanation: body.aiExplanation || null,

      // Recurrence
      rrule: rruleStr,
      startDate: startDate,
      endDate: body.endDate ? new Date(body.endDate) : null,
    });

    // 3. (Optional) Insert Subtasks / Tools if provided in the body layer
    // This could be expanded based on frontend payload...

    // Fetch the newly inserted template to return
    const [inserted] = await db.select().from(taskTemplates).where(eq(taskTemplates.id, newTemplateId));

    return NextResponse.json({ task: inserted }, { status: 201 });
  } catch (error) {
    console.error("API Error creating task template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
