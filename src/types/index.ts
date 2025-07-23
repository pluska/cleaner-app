export interface User {
  id: string;
  email?: string;
  name?: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  category:
    | "kitchen"
    | "bathroom"
    | "bedroom"
    | "living_room"
    | "laundry"
    | "exterior"
    | "general";
  priority: "low" | "medium" | "high";
  completed: boolean;
  due_date?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // New fields for enhanced scheduling
  is_recurring: boolean;
  recurrence_start_date: string;
  recurrence_end_date?: string;
  original_task_id?: string; // For recurring instances
  // New fields for day-of-week scheduling
  day_of_week?: number; // 0-6 (Sunday-Saturday)
  preferred_time?: string; // HH:MM format
}

export interface TaskFormData {
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  category:
    | "kitchen"
    | "bathroom"
    | "bedroom"
    | "living_room"
    | "laundry"
    | "exterior"
    | "general";
  priority: "low" | "medium" | "high";
  due_date?: string;
  is_recurring?: boolean;
  recurrence_start_date?: string;
  recurrence_end_date?: string;
  // New fields for day-of-week scheduling
  day_of_week?: number; // 0-6 (Sunday-Saturday)
  preferred_time?: string; // HH:MM format
}

export interface TaskInstance {
  id: string;
  task_id: string;
  due_date: string;
  completed: boolean;
  user_id: string;
  created_at: string;
}

export type TimeView = "daily" | "weekly" | "monthly" | "yearly";

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}
