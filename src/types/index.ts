// =====================================================
// CLEANER PLANNER - TYPE DEFINITIONS
// Updated for new optimized database schema with subtasks
// =====================================================

// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// Task Template (AI-generated or predefined)
export interface TaskTemplate extends BaseEntity {
  name: string;
  description?: string;
  category: TaskCategory;
  base_frequency_days: number;
  importance_level: number; // 1-5 scale
  health_impact?: string;
  scientific_source?: string;
  source_url?: string;
  ai_explanation?: string;
  is_ai_generated: boolean;
}

// Task Subtask (detailed steps for each task)
export interface TaskSubtask extends BaseEntity {
  template_id: string;
  title: string;
  description?: string;
  estimated_minutes: number;
  order_index: number;
  is_required: boolean;
  metadata: {
    tools_needed?: string[];
    difficulty?: "easy" | "medium" | "hard";
    tips?: string[];
    video_url?: string;
    ai_generated?: boolean;
  };
}

// User Task (personalized from template)
export interface UserTask extends BaseEntity {
  user_id: string;
  template_id: string;
  custom_frequency_days?: number;
  custom_name?: string;
  custom_description?: string;
  is_active: boolean;
}

// Task Instance (created on-demand)
export interface TaskInstance extends BaseEntity {
  user_task_id: string;
  due_date: string; // ISO date string
  completed: boolean;
  completed_at?: string;
}

// Task Instance Subtask (tracking completion of individual subtasks)
export interface TaskInstanceSubtask extends BaseEntity {
  task_instance_id: string;
  subtask_id: string;
  completed: boolean;
  completed_at?: string;
  notes?: string;
}

// Task Instance Override (for single instance modifications)
export interface TaskInstanceOverride extends BaseEntity {
  user_task_id: string;
  original_due_date: string;
  new_due_date: string;
  override_type: "moved" | "skipped" | "completed_early";
  reason?: string;
}

// Task Modification History (audit trail)
export interface TaskModificationHistory extends BaseEntity {
  user_task_id: string;
  modification_type: "single_override" | "future_pattern" | "complete_reset";
  old_frequency_days?: number;
  new_frequency_days?: number;
  modified_by: string;
}

// Home Assessment (for AI personalization)
export interface HomeAssessment extends BaseEntity {
  user_id: string;
  home_type: HomeType;
  rooms: Room[];
  pets: boolean;
  children: boolean;
  allergies: boolean;
  lifestyle: Lifestyle;
  cleaning_preferences: CleaningPreference;
}

// Room definition
export interface Room {
  name: string;
  type: RoomType;
  size: RoomSize;
  has_carpet: boolean;
  has_hardwood: boolean;
  has_tile: boolean;
  special_features?: string[];
}

// Enums
export type TaskCategory =
  | "kitchen"
  | "bathroom"
  | "bedroom"
  | "living_room"
  | "laundry"
  | "exterior"
  | "general";

export type HomeType = "apartment" | "house" | "studio";

export type RoomType =
  | "kitchen"
  | "bathroom"
  | "bedroom"
  | "living_room"
  | "dining_room"
  | "office"
  | "laundry_room"
  | "garage"
  | "basement"
  | "attic";

export type RoomSize = "small" | "medium" | "large";

export type Lifestyle = "busy" | "moderate" | "relaxed";

export type CleaningPreference = "minimal" | "standard" | "thorough";

// View types (for database views)
export interface UserTaskView {
  user_task_id: string;
  user_id: string;
  template_id: string;
  task_name: string;
  display_name: string;
  description?: string;
  category: TaskCategory;
  frequency_days: number;
  importance_level: number;
  health_impact?: string;
  scientific_source?: string;
  source_url?: string;
  ai_explanation?: string;
  is_active: boolean;
  user_task_created_at: string;
  template_created_at: string;
}

export interface TaskInstanceView {
  instance_id: string;
  user_task_id: string;
  due_date: string;
  completed: boolean;
  completed_at?: string;
  instance_created_at: string;
  user_id: string;
  task_name: string;
  display_name: string;
  description?: string;
  category: TaskCategory;
  frequency_days: number;
  importance_level: number;
  health_impact?: string;
  scientific_source?: string;
  source_url?: string;
  ai_explanation?: string;
  is_active: boolean;
}

export interface TaskSubtaskView {
  subtask_id: string;
  template_id: string;
  title: string;
  description?: string;
  estimated_minutes: number;
  order_index: number;
  is_required: boolean;
  metadata: {
    tools_needed?: string[];
    difficulty?: "easy" | "medium" | "hard";
    tips?: string[];
    video_url?: string;
    ai_generated?: boolean;
  };
  template_name: string;
  category: TaskCategory;
}

// Form data types
export interface TaskFormData {
  name: string;
  description?: string;
  category: TaskCategory;
  frequency_days: number;
  importance_level: number;
}

export interface SubtaskFormData {
  title: string;
  description?: string;
  estimated_minutes: number;
  order_index: number;
  is_required: boolean;
  metadata?: {
    tools_needed?: string[];
    difficulty?: "easy" | "medium" | "hard";
    tips?: string[];
    video_url?: string;
  };
}

export interface HomeAssessmentFormData {
  home_type: HomeType;
  rooms: Room[];
  pets: boolean;
  children: boolean;
  allergies: boolean;
  lifestyle: Lifestyle;
  cleaning_preferences: CleaningPreference;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface TaskTemplateResponse extends ApiResponse<TaskTemplate> {}
export interface TaskSubtaskResponse extends ApiResponse<TaskSubtask> {}
export interface UserTaskResponse extends ApiResponse<UserTask> {}
export interface TaskInstanceResponse extends ApiResponse<TaskInstance> {}
export interface TaskInstanceSubtaskResponse
  extends ApiResponse<TaskInstanceSubtask> {}
export interface HomeAssessmentResponse extends ApiResponse<HomeAssessment> {}

export interface TaskTemplatesResponse extends ApiResponse<TaskTemplate[]> {}
export interface TaskSubtasksResponse extends ApiResponse<TaskSubtask[]> {}
export interface UserTasksResponse extends ApiResponse<UserTaskView[]> {}
export interface TaskInstancesResponse
  extends ApiResponse<TaskInstanceView[]> {}
export interface TaskInstanceSubtasksResponse
  extends ApiResponse<TaskInstanceSubtask[]> {}

// Legacy types (for backward compatibility during migration)
export interface LegacyTask extends BaseEntity {
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  category: TaskCategory;
  priority: "low" | "medium" | "high";
  completed: boolean;
  due_date?: string;
  user_id: string;
  is_recurring: boolean;
  recurrence_start_date?: string;
  recurrence_end_date?: string;
  last_generated_date?: string;
  original_task_id?: string;
  day_of_week?: number;
  preferred_time?: string;
}

export interface LegacyTaskInstance extends BaseEntity {
  task_id: string;
  due_date: string;
  completed: boolean;
  user_id: string;
}

// Utility types
export type TaskStatus = "pending" | "completed" | "overdue";

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completion_rate: number;
}

export interface CategoryStats {
  category: TaskCategory;
  count: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface SubtaskStats {
  total_subtasks: number;
  completed_subtasks: number;
  completion_rate: number;
  estimated_total_minutes: number;
  actual_minutes?: number;
}

// AI-related types
export interface AIRecommendation {
  task_name: string;
  frequency_days: number;
  importance_level: number;
  reasoning: string;
  health_impact: string;
  scientific_source: string;
  source_url: string;
  friendly_explanation: string;
  subtasks?: SubtaskFormData[];
}

export interface AIInterviewQuestion {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect" | "boolean";
  options?: string[];
  required: boolean;
  order: number;
}

export interface AIInterviewResponse {
  question_id: string;
  answer: string | string[] | boolean;
}

// Component prop types
export interface TaskItemProps {
  task: TaskInstanceView;
  subtasks?: TaskSubtaskView[];
  onComplete: (taskId: string) => void;
  onEdit?: (task: TaskInstanceView) => void;
  onDelete?: (taskId: string) => void;
}

export interface SubtaskItemProps {
  subtask: TaskSubtaskView;
  completed?: boolean;
  onToggle?: (subtaskId: string, completed: boolean) => void;
  onAddNote?: (subtaskId: string, note: string) => void;
}

export interface TaskListProps {
  tasks: TaskInstanceView[];
  subtasks?: Record<string, TaskSubtaskView[]>;
  onTaskComplete: (taskId: string) => void;
  onTaskEdit?: (task: TaskInstanceView) => void;
  onTaskDelete?: (taskId: string) => void;
  onSubtaskToggle?: (
    taskId: string,
    subtaskId: string,
    completed: boolean
  ) => void;
  loading?: boolean;
}

export interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
  loading?: boolean;
}

export interface SubtaskFormProps {
  onSubmit: (data: SubtaskFormData) => void;
  initialData?: Partial<SubtaskFormData>;
  loading?: boolean;
}

export interface HomeAssessmentFormProps {
  onSubmit: (data: HomeAssessmentFormData) => void;
  initialData?: Partial<HomeAssessmentFormData>;
  loading?: boolean;
}

// Dashboard and analytics types
export interface DashboardStats {
  total_tasks: number;
  completed_today: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  total_subtasks: number;
  completed_subtasks: number;
  subtask_completion_rate: number;
}

export interface WeeklyProgress {
  date: string;
  tasks_completed: number;
  subtasks_completed: number;
  total_minutes: number;
}

export interface CategoryProgress {
  category: TaskCategory;
  tasks_completed: number;
  total_tasks: number;
  completion_rate: number;
  average_minutes: number;
}

// Calendar types
export interface CalendarTask {
  due_date: string;
  task_name: string;
  display_name: string;
  category: TaskCategory;
  importance_level: number;
  estimated_minutes: number;
  subtask_count: number;
  is_override: boolean;
  override_reason?: string;
  frequency_days: number;
}

export interface CalendarDayData {
  date: string;
  task_count: number;
  total_estimated_minutes: number;
  categories: TaskCategory[];
  tasks: CalendarTask[];
}

export interface TaskModificationData {
  type: "single" | "future" | "all";
  new_due_date?: string;
  new_frequency_days?: number;
  reason?: string;
}

// Task modification modal props
export interface TaskModificationModalProps {
  task: TaskInstanceView;
  onModify: (data: TaskModificationData) => void;
  onCancel: () => void;
  loading?: boolean;
}
