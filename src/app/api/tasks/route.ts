import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabase-server";
import { TaskFormData } from "@/types";

// GET /api/tasks - Get all tasks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const frequency = searchParams.get("frequency");
    const completed = searchParams.get("completed");
    const dueDate = searchParams.get("dueDate");
    const includeInstances = searchParams.get("includeInstances") === "true";

    // Build query
    let query = supabase.from("tasks").select("*").eq("user_id", user.id);

    // Apply filters
    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    if (frequency) {
      query = query.eq("frequency", frequency);
    }
    if (completed !== null) {
      query = query.eq("completed", completed === "true");
    }
    if (dueDate) {
      query = query.eq("due_date", dueDate);
    }

    const { data: tasks, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    // If includeInstances is requested, also fetch task instances
    if (includeInstances && tasks) {
      const { data: instances } = await supabase
        .from("task_instances")
        .select("*")
        .eq("user_id", user.id)
        .gte("due_date", new Date().toISOString().split("T")[0]);

      return NextResponse.json({ tasks, instances });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: TaskFormData = await request.json();

    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Validate frequency
    const validFrequencies = ["daily", "weekly", "monthly", "yearly"];
    if (!validFrequencies.includes(body.frequency)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
    }

    // Validate category
    const validCategories = [
      "kitchen",
      "bathroom",
      "bedroom",
      "living_room",
      "laundry",
      "exterior",
      "general",
    ];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }

    // Validate day_of_week if provided
    if (
      body.day_of_week !== undefined &&
      (body.day_of_week < 0 || body.day_of_week > 6)
    ) {
      return NextResponse.json(
        { error: "Invalid day of week" },
        { status: 400 }
      );
    }

    // Calculate the initial due date based on frequency and day_of_week
    let initialDueDate =
      body.due_date || new Date().toISOString().split("T")[0];

    if (body.frequency === "weekly" && body.day_of_week !== undefined) {
      const today = new Date();
      const currentDayOfWeek = today.getDay(); // 0-6 (Sunday-Saturday)
      const targetDayOfWeek = body.day_of_week;

      let daysToAdd = 0;
      if (targetDayOfWeek > currentDayOfWeek) {
        daysToAdd = targetDayOfWeek - currentDayOfWeek;
      } else if (targetDayOfWeek < currentDayOfWeek) {
        daysToAdd = 7 - currentDayOfWeek + targetDayOfWeek;
      } else {
        // Same day, schedule for next week
        daysToAdd = 7;
      }

      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysToAdd);
      initialDueDate = targetDate.toISOString().split("T")[0];
    }

    // Determine if task should be recurring
    const isRecurring = body.frequency !== "daily" || body.is_recurring;

    // Create task data
    const taskData = {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      frequency: body.frequency,
      category: body.category,
      priority: body.priority,
      completed: false,
      due_date: initialDueDate,
      user_id: user.id,
      is_recurring: isRecurring,
      recurrence_start_date: body.recurrence_start_date || initialDueDate,
      recurrence_end_date: body.recurrence_end_date || null,
      day_of_week: body.day_of_week || null,
      preferred_time: body.preferred_time || null,
    };

    const { data: task, error } = await supabase
      .from("tasks")
      .insert([taskData])
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
