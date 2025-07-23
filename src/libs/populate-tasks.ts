import { createServerSupabaseClient } from "./supabase-server";
import { generateMissingInstances } from "./task-utils";

// Sample tasks data with enhanced scheduling
const sampleTasks = [
  {
    title: "Clean Kitchen Counters",
    description: "Wipe down all kitchen surfaces and sanitize",
    frequency: "daily" as const,
    category: "kitchen" as const,
    priority: "high" as const,
    is_recurring: true,
    day_of_week: 1, // Monday
    preferred_time: "08:00",
  },
  {
    title: "Vacuum Living Room",
    description: "Vacuum carpets and clean furniture",
    frequency: "weekly" as const,
    category: "living_room" as const,
    priority: "medium" as const,
    is_recurring: true,
    day_of_week: 3, // Wednesday
    preferred_time: "14:00",
  },
  {
    title: "Clean Bathroom",
    description: "Scrub toilet, sink, and shower",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "high" as const,
    is_recurring: true,
    day_of_week: 5, // Friday
    preferred_time: "10:00",
  },
  {
    title: "Change Bed Sheets",
    description: "Wash and change all bed sheets",
    frequency: "weekly" as const,
    category: "bedroom" as const,
    priority: "medium" as const,
    is_recurring: true,
    day_of_week: 6, // Saturday
    preferred_time: "09:00",
  },
  {
    title: "Do Laundry",
    description: "Wash, dry, and fold clothes",
    frequency: "weekly" as const,
    category: "laundry" as const,
    priority: "medium" as const,
    is_recurring: true,
    day_of_week: 2, // Tuesday
    preferred_time: "16:00",
  },
  {
    title: "Clean Windows",
    description: "Wipe down windows and mirrors",
    frequency: "monthly" as const,
    category: "exterior" as const,
    priority: "low" as const,
    is_recurring: true,
    day_of_week: 0, // Sunday
    preferred_time: "11:00",
  },
  {
    title: "Deep Clean Kitchen",
    description: "Deep clean appliances and cabinets",
    frequency: "monthly" as const,
    category: "kitchen" as const,
    priority: "high" as const,
    is_recurring: true,
    day_of_week: 4, // Thursday
    preferred_time: "13:00",
  },
  {
    title: "Organize Closets",
    description: "Sort and organize clothing and items",
    frequency: "monthly" as const,
    category: "bedroom" as const,
    priority: "low" as const,
    is_recurring: true,
    day_of_week: 6, // Saturday
    preferred_time: "15:00",
  },
];

export async function populateSampleTasks(userId: string) {
  const supabase = await createServerSupabaseClient();

  console.log("Populating sample tasks for user:", userId);

  for (const taskData of sampleTasks) {
    // Calculate initial due date based on day of week
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const targetDayOfWeek = taskData.day_of_week || 0;

    let daysToAdd = 0;
    if (targetDayOfWeek > currentDayOfWeek) {
      daysToAdd = targetDayOfWeek - currentDayOfWeek;
    } else if (targetDayOfWeek < currentDayOfWeek) {
      daysToAdd = 7 - currentDayOfWeek + targetDayOfWeek;
    } else {
      daysToAdd = 7; // Same day, schedule for next week
    }

    const initialDueDate = new Date(today);
    initialDueDate.setDate(today.getDate() + daysToAdd);

    const task = {
      ...taskData,
      user_id: userId,
      due_date: initialDueDate.toISOString().split("T")[0],
      recurrence_start_date: initialDueDate.toISOString().split("T")[0],
      completed: false,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert([task])
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
    } else {
      console.log("Created task:", data.title);
    }
  }

  // Generate missing instances for all recurring tasks
  console.log("Generating missing task instances...");
  await generateMissingInstances();

  console.log("Sample tasks populated successfully!");
}

// Function to run database migrations
export async function runMigrations() {
  const supabase = await createServerSupabaseClient();

  console.log("Running database migrations...");

  // Call the database function to generate missing instances
  const { error } = await supabase.rpc("generate_missing_instances");

  if (error) {
    console.error("Error running migrations:", error);
  } else {
    console.log("Migrations completed successfully!");
  }
}
