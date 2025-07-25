// =====================================================
// CLEANER PLANNER - TYPE DEFINITIONS
// Updated for gamified database schema with user profiles, tools, and areas
// =====================================================

// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// =====================================================
// GAMIFICATION SYSTEM TYPES
// =====================================================

// User Profile with gamification stats
export interface UserProfile extends BaseEntity {
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  level: number;
  experience_points: number;
  total_tasks_completed: number;
  total_subtasks_completed: number;
  streak_days: number;
  longest_streak: number;
  coins: number;
  gems: number;
}

// User Tool Inventory
export interface UserTool extends BaseEntity {
  user_id: string;
  tool_id: string; // References cleaning-tools.json
  tool_name: string;
  current_durability: number;
  max_durability: number;
  uses_count: number;
  last_cleaned_at?: string;
  last_maintained_at?: string;
  is_active: boolean;
  acquired_at: string;
}

// Home Area with Health Tracking
export interface HomeArea extends BaseEntity {
  user_id: string;
  area_name: string;
  area_type: AreaType;
  current_health: number; // 0-100
  max_health: number;
  size: AreaSize;
  has_carpet: boolean;
  has_hardwood: boolean;
  has_tile: boolean;
  special_features: Record<string, any>;
  last_cleaned_at?: string;
}

// =====================================================
// ENHANCED TASK SYSTEM TYPES
// =====================================================

// Task Template (now with gamification data)
export interface TaskTemplate extends BaseEntity {
  template_id: string; // References JSON files
  name: string;
  description?: string;
  category: TaskCategory;
  base_frequency_days: number;
  importance_level: number; // 1-5 scale
  health_impact?: string;
  scientific_source?: string;
  source_url?: string;
  ai_explanation?: string;
  exp_reward: number;
  area_health_impact: number;
  tools_required: string[]; // Tool IDs from cleaning-tools.json
  tools_usage: Record<
    string,
    {
      durability_loss: number;
      clean_after_uses: number;
    }
  >;
  language: "en" | "es";
  is_ai_generated: boolean;
}

// Task Subtask (enhanced with gamification)
export interface TaskSubtask extends BaseEntity {
  template_id: string;
  title: string;
  description?: string;
  estimated_minutes: number;
  order_index: number;
  is_required: boolean;
  exp_reward: number;
  tools_needed: string[];
  difficulty: "easy" | "medium" | "hard";
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

// Task Instance (enhanced with gamification tracking)
export interface TaskInstance extends BaseEntity {
  user_task_id: string;
  due_date: string; // ISO date string
  completed: boolean;
  completed_at?: string;
  exp_earned?: number;
  area_health_restored?: number;
  tools_used: Record<
    string,
    {
      tool_id: string;
      durability_lost: number;
      uses: number;
    }
  >;
}

// Task Instance Subtask (tracking completion of individual subtasks)
export interface TaskInstanceSubtask extends BaseEntity {
  task_instance_id: string;
  subtask_id: string;
  completed: boolean;
  completed_at?: string;
  exp_earned?: number;
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

// =====================================================
// ENUM TYPES
// =====================================================

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
  | "attic"
  | "hallway"
  | "entryway";

export type RoomSize = "small" | "medium" | "large";

export type Lifestyle = "busy" | "moderate" | "relaxed";

export type CleaningPreference = "minimal" | "standard" | "thorough";

export type AreaType =
  | "kitchen"
  | "bathroom"
  | "bedroom"
  | "living_room"
  | "dining_room"
  | "office"
  | "laundry_room"
  | "garage"
  | "basement"
  | "attic"
  | "hallway"
  | "entryway";

export type AreaSize = "small" | "medium" | "large";

export type ToolRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

// Additional types for backward compatibility
export type ComingSoonTask = TaskInstanceView;
export type TimeView = "daily" | "weekly" | "monthly";
export type User = {
  id: string;
  email: string;
  created_at: string;
};

// =====================================================
// VIEW TYPES (Database Views)
// =====================================================

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
  exp_reward: number;
  area_health_impact: number;
  tools_required: string[];
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
  exp_earned?: number;
  area_health_restored?: number;
  tools_used: Record<string, any>;
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
  exp_reward: number;
  area_health_impact: number;
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
  exp_reward: number;
  tools_needed: string[];
  difficulty: "easy" | "medium" | "hard";
  template_name: string;
  category: TaskCategory;
}

// =====================================================
// FORM DATA TYPES
// =====================================================

export interface TaskFormData {
  name: string;
  description?: string;
  category: TaskCategory;
  frequency_days: number;
  importance_level: number;
  // Legacy properties for backward compatibility
  title?: string;
  frequency?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: "low" | "medium" | "high";
  due_date?: string;
  day_of_week?: number;
  preferred_time?: string;
  is_recurring?: boolean;
  recurrence_start_date?: string;
  recurrence_end_date?: string;
}

export interface SubtaskFormData {
  title: string;
  description?: string;
  estimated_minutes: number;
  order_index: number;
  is_required: boolean;
  exp_reward: number;
  tools_needed: string[];
  difficulty: "easy" | "medium" | "hard";
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

// =====================================================
// API RESPONSE TYPES
// =====================================================

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
export interface UserProfileResponse extends ApiResponse<UserProfile> {}
export interface UserToolResponse extends ApiResponse<UserTool> {}
export interface HomeAreaResponse extends ApiResponse<HomeArea> {}

export interface TaskTemplatesResponse extends ApiResponse<TaskTemplate[]> {}
export interface TaskSubtasksResponse extends ApiResponse<TaskSubtask[]> {}
export interface UserTasksResponse extends ApiResponse<UserTaskView[]> {}
export interface TaskInstancesResponse
  extends ApiResponse<TaskInstanceView[]> {}
export interface TaskInstanceSubtasksResponse
  extends ApiResponse<TaskInstanceSubtask[]> {}
export interface UserToolsResponse extends ApiResponse<UserTool[]> {}
export interface HomeAreasResponse extends ApiResponse<HomeArea[]> {}

// =====================================================
// LEGACY TYPES (for migration compatibility)
// =====================================================

// Legacy Task type for backward compatibility during migration
export type Task = LegacyTask;

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

// =====================================================
// UTILITY TYPES
// =====================================================

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

export interface AIRecommendation {
  task_name: string;
  frequency_days: number;
  importance_level: number;
  reasoning: string;
  health_impact: string;
  scientific_source: string;
  source_url: string;
  friendly_explanation: string;
  exp_reward: number;
  area_health_impact: number;
  tools_required: string[];
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

// =====================================================
// COMPONENT PROP TYPES
// =====================================================

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

// =====================================================
// GAMIFICATION COMPONENT PROPS
// =====================================================

export interface UserProfileProps {
  profile: UserProfile;
  onLevelUp?: (newLevel: number) => void;
}

export interface ToolInventoryProps {
  tools: UserTool[];
  onUseTool?: (toolId: string) => void;
  onMaintainTool?: (toolId: string) => void;
  onReplaceTool?: (toolId: string) => void;
}

export interface AreaHealthProps {
  areas: HomeArea[];
  onAreaCleaned?: (areaId: string, healthRestored: number) => void;
}

export interface ExperienceBarProps {
  currentExp: number;
  level: number;
  expToNextLevel: number;
}

export interface ToolDurabilityBarProps {
  currentDurability: number;
  maxDurability: number;
  toolName: string;
}

// =====================================================
// DASHBOARD & ANALYTICS TYPES
// =====================================================

export interface DashboardStats {
  total_tasks: number;
  completed_today: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  total_subtasks: number;
  completed_subtasks: number;
  subtask_completion_rate: number;
  total_exp_earned: number;
  current_level: number;
  streak_days: number;
  coins_earned: number;
  gems_earned: number;
  // Legacy properties for backward compatibility
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  completionRate?: number;
}

export interface WeeklyProgress {
  date: string;
  tasks_completed: number;
  subtasks_completed: number;
  total_minutes: number;
  exp_earned: number;
  coins_earned: number;
}

export interface CategoryProgress {
  category: TaskCategory;
  tasks_completed: number;
  total_tasks: number;
  completion_rate: number;
  average_minutes: number;
  exp_earned: number;
}

export interface CalendarTask {
  due_date: string;
  task_name: string;
  display_name: string;
  category: TaskCategory;
  importance_level: number;
  estimated_minutes: number;
  subtask_count: number;
  exp_reward: number;
  area_health_impact: number;
  is_override: boolean;
  override_reason?: string;
  frequency_days: number;
}

export interface CalendarDayData {
  date: string;
  task_count: number;
  total_estimated_minutes: number;
  total_exp_reward: number;
  categories: TaskCategory[];
  tasks: CalendarTask[];
}

export interface TaskModificationData {
  type: "single" | "future" | "all";
  new_due_date?: string;
  new_frequency_days?: number;
  reason?: string;
}

export interface TaskModificationModalProps {
  task: TaskInstanceView;
  onModify: (data: TaskModificationData) => void;
  onCancel: () => void;
  loading?: boolean;
}
