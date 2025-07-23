import { createServerSupabaseClient } from "./supabase-server";

export interface TaskWithInstances {
  id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  category: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  due_date?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_recurring: boolean;
  recurrence_start_date: string;
  recurrence_end_date?: string;
  last_generated_date?: string;
  original_task_id?: string;
  day_of_week?: number;
  preferred_time?: string;
  is_instance?: boolean;
}

/**
 * Generate missing task instances for recurring tasks
 */
export async function generateMissingInstances() {
  const supabase = await createServerSupabaseClient();

  // Get all recurring tasks that need instance generation
  const { data: recurringTasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("is_recurring", true)
    .or("last_generated_date.is.null,last_generated_date.lt.now()");

  if (error) {
    console.error("Error fetching recurring tasks:", error);
    return;
  }

  if (!recurringTasks) return;

  for (const task of recurringTasks) {
    // Update the task to trigger the database trigger for instance generation
    await supabase
      .from("tasks")
      .update({
        last_generated_date:
          task.last_generated_date || task.recurrence_start_date,
      })
      .eq("id", task.id);
  }
}

/**
 * Get tasks for a specific date range, including instances
 */
export async function getTasksForDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TaskWithInstances[]> {
  const supabase = await createServerSupabaseClient();

  // Get regular tasks in the date range
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .gte("due_date", startDate)
    .lte("due_date", endDate);

  // Get task instances in the date range
  const { data: instances } = await supabase
    .from("task_instances")
    .select(
      `
      *,
      tasks (*)
    `
    )
    .eq("user_id", userId)
    .gte("due_date", startDate)
    .lte("due_date", endDate);

  const result: TaskWithInstances[] = [];

  // Add regular tasks
  if (tasks) {
    result.push(...tasks);
  }

  // Add task instances
  if (instances) {
    instances.forEach((instance) => {
      if (instance.tasks) {
        result.push({
          ...instance.tasks,
          id: instance.id,
          completed: instance.completed,
          due_date: instance.due_date,
          is_instance: true,
          original_task_id: instance.task_id,
        });
      }
    });
  }

  return result;
}

/**
 * Get all tasks for the schedule view, including instances
 */
export async function getAllTasksForSchedule(
  userId: string
): Promise<TaskWithInstances[]> {
  const supabase = await createServerSupabaseClient();

  // Get all tasks for the user (including recurring tasks)
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });

  // Get all task instances for the user
  const { data: taskInstances } = await supabase
    .from("task_instances")
    .select(
      `
      *,
      tasks (*)
    `
    )
    .eq("user_id", userId)
    .order("due_date", { ascending: true });

  const result: TaskWithInstances[] = [];

  // Add regular tasks
  if (tasks) {
    result.push(...tasks);
  }

  // Add recurring task instances
  if (taskInstances) {
    taskInstances.forEach((instance) => {
      if (instance.tasks) {
        result.push({
          ...instance.tasks,
          id: instance.id, // Use instance ID for proper identification
          completed: instance.completed,
          due_date: instance.due_date,
          is_instance: true,
          original_task_id: instance.task_id,
        });
      }
    });
  }

  return result;
}

/**
 * Calculate the next occurrence date for a recurring task
 */
export function calculateNextOccurrence(
  startDate: Date,
  frequency: string,
  dayOfWeek?: number
): Date {
  const nextDate = new Date(startDate);

  switch (frequency) {
    case "daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "weekly":
      if (dayOfWeek !== undefined) {
        const currentDayOfWeek = nextDate.getDay();
        let daysToAdd = 0;

        if (dayOfWeek > currentDayOfWeek) {
          daysToAdd = dayOfWeek - currentDayOfWeek;
        } else if (dayOfWeek < currentDayOfWeek) {
          daysToAdd = 7 - currentDayOfWeek + dayOfWeek;
        } else {
          daysToAdd = 7; // Same day, schedule for next week
        }

        nextDate.setDate(nextDate.getDate() + daysToAdd);
      } else {
        nextDate.setDate(nextDate.getDate() + 7);
      }
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }

  return nextDate;
}

/**
 * Get the day name from day of week number
 */
export function getDayName(
  dayOfWeek: number,
  language: "en" | "es" = "en"
): string {
  const days = {
    en: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    es: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ],
  };

  return days[language][dayOfWeek] || "";
}
