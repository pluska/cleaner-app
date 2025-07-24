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
  tasks?: Task; // For joined queries
}

export interface TaskWithInstance extends Task {
  is_instance?: boolean;
  original_task_id?: string;
}

export interface ComingSoonTask extends Task {
  daysUntilDue?: number;
}

export interface TaskFilters {
  category?: string;
  frequency?: string;
  completed?: boolean;
  dueDate?: string;
  includeInstances?: boolean;
  userId?: string;
  comingSoon?: boolean;
  today?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  instances?: TaskInstance[];
}

export interface TaskInstanceResponse {
  taskInstances: TaskInstance[];
}

export type TimeView = "daily" | "weekly" | "monthly" | "yearly";

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

export interface RescheduleModalState {
  isOpen: boolean;
  taskId: string;
  taskTitle: string;
  currentDueDate: string;
}

export interface DayOfWeek {
  value: number;
  label: string;
}

export interface TaskCategory {
  value: string;
  label: string;
}

export interface TaskPriority {
  value: string;
  label: string;
}

export interface TaskFrequency {
  value: string;
  label: string;
}

export interface TaskStatusBadge {
  text: string;
  className: string;
}
