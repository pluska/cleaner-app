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
}

export type TimeView = "daily" | "weekly" | "monthly" | "yearly";

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}
