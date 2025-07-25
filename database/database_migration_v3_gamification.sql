-- =====================================================
-- CLEANER PLANNER - DATABASE MIGRATION V3 (GAMIFICATION)
-- Complete fresh start with gamification, tools, and area health system
-- =====================================================

-- ⚠️ WARNING: This migration will DROP ALL EXISTING DATA
-- Make sure you have backups if needed

-- Step 1: Drop all existing tables, functions, triggers, and policies
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Step 2: Create the gamified schema from scratch

-- User profiles with gamification
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  total_subtasks_completed INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 100,
  gems INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Cleaning tools inventory
CREATE TABLE user_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL, -- References cleaning-tools.json
  tool_name TEXT NOT NULL,
  current_durability INTEGER NOT NULL,
  max_durability INTEGER NOT NULL,
  uses_count INTEGER DEFAULT 0,
  last_cleaned_at TIMESTAMP WITH TIME ZONE,
  last_maintained_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Home areas with health tracking
CREATE TABLE home_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  area_name TEXT NOT NULL,
  area_type TEXT NOT NULL CHECK (area_type IN ('kitchen', 'bathroom', 'bedroom', 'living_room', 'dining_room', 'office', 'laundry_room', 'garage', 'basement', 'attic', 'hallway', 'entryway')),
  current_health INTEGER DEFAULT 100 CHECK (current_health >= 0 AND current_health <= 100),
  max_health INTEGER DEFAULT 100,
  size TEXT CHECK (size IN ('small', 'medium', 'large')),
  has_carpet BOOLEAN DEFAULT FALSE,
  has_hardwood BOOLEAN DEFAULT FALSE,
  has_tile BOOLEAN DEFAULT FALSE,
  special_features JSONB DEFAULT '{}',
  last_cleaned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, area_name)
);

-- Task templates (now language-specific)
CREATE TABLE task_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id TEXT NOT NULL, -- References JSON files
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('kitchen', 'bathroom', 'bedroom', 'living_room', 'laundry', 'exterior', 'general')),
  base_frequency_days INTEGER NOT NULL CHECK (base_frequency_days > 0),
  importance_level INTEGER NOT NULL CHECK (importance_level >= 1 AND importance_level <= 5),
  health_impact TEXT,
  scientific_source TEXT,
  source_url TEXT,
  ai_explanation TEXT,
  exp_reward INTEGER DEFAULT 0,
  area_health_impact INTEGER DEFAULT 0,
  tools_required JSONB DEFAULT '[]',
  tools_usage JSONB DEFAULT '{}',
  language TEXT NOT NULL CHECK (language IN ('en', 'es')),
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, language)
);

-- Task subtasks with gamification
CREATE TABLE task_subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES task_templates(id) ON DELETE CASCADE,
  subtask_id TEXT NOT NULL, -- References JSON files
  title TEXT NOT NULL,
  description TEXT,
  estimated_minutes INTEGER DEFAULT 5 CHECK (estimated_minutes > 0),
  order_index INTEGER NOT NULL CHECK (order_index > 0),
  is_required BOOLEAN DEFAULT TRUE,
  exp_reward INTEGER DEFAULT 0,
  tools_needed JSONB DEFAULT '[]',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, subtask_id)
);

-- User's selected tasks
CREATE TABLE user_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES task_templates(id) ON DELETE CASCADE,
  custom_frequency_days INTEGER CHECK (custom_frequency_days > 0),
  custom_name TEXT,
  custom_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Task instances with gamification tracking
CREATE TABLE task_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_task_id UUID REFERENCES user_tasks(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  exp_earned INTEGER DEFAULT 0,
  area_health_restored INTEGER DEFAULT 0,
  tools_used JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_task_id, due_date)
);

-- Task instance subtasks with completion tracking
CREATE TABLE task_instance_subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_instance_id UUID REFERENCES task_instances(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES task_subtasks(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  exp_earned INTEGER DEFAULT 0,
  tools_used JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_instance_id, subtask_id)
);

-- Task instance overrides
CREATE TABLE task_instance_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_task_id UUID REFERENCES user_tasks(id) ON DELETE CASCADE,
  original_due_date DATE NOT NULL,
  new_due_date DATE NOT NULL,
  override_type TEXT NOT NULL CHECK (override_type IN ('moved', 'skipped', 'completed_early')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_task_id, original_due_date)
);

-- Task modification history
CREATE TABLE task_modification_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_task_id UUID REFERENCES user_tasks(id) ON DELETE CASCADE,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('single_override', 'future_pattern', 'complete_reset')),
  old_frequency_days INTEGER,
  new_frequency_days INTEGER,
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_by UUID REFERENCES auth.users(id)
);

-- Home assessment data
CREATE TABLE home_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  home_type TEXT NOT NULL CHECK (home_type IN ('apartment', 'house', 'studio')),
  rooms JSONB NOT NULL,
  pets BOOLEAN DEFAULT FALSE,
  children BOOLEAN DEFAULT FALSE,
  allergies BOOLEAN DEFAULT FALSE,
  lifestyle TEXT NOT NULL CHECK (lifestyle IN ('busy', 'moderate', 'relaxed')),
  cleaning_preferences TEXT NOT NULL CHECK (cleaning_preferences IN ('minimal', 'standard', 'thorough')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  exp_reward INTEGER DEFAULT 0,
  coins_reward INTEGER DEFAULT 0,
  gems_reward INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- User statistics
CREATE TABLE user_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stat_type TEXT NOT NULL,
  stat_value INTEGER DEFAULT 0,
  stat_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stat_type, stat_date)
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_level ON user_profiles(level);
CREATE INDEX idx_user_tools_user_id ON user_tools(user_id);
CREATE INDEX idx_user_tools_active ON user_tools(is_active);
CREATE INDEX idx_user_tools_durability ON user_tools(current_durability);
CREATE INDEX idx_home_areas_user_id ON home_areas(user_id);
CREATE INDEX idx_home_areas_health ON home_areas(current_health);
CREATE INDEX idx_task_templates_language ON task_templates(language);
CREATE INDEX idx_task_templates_category ON task_templates(category);
CREATE INDEX idx_task_subtasks_template_id ON task_subtasks(template_id);
CREATE INDEX idx_task_subtasks_order ON task_subtasks(template_id, order_index);
CREATE INDEX idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX idx_user_tasks_active ON user_tasks(is_active);
CREATE INDEX idx_task_instances_user_task_id ON task_instances(user_task_id);
CREATE INDEX idx_task_instances_due_date ON task_instances(due_date);
CREATE INDEX idx_task_instances_completed ON task_instances(completed);
CREATE INDEX idx_task_instance_subtasks_instance_id ON task_instance_subtasks(task_instance_id);
CREATE INDEX idx_task_instance_subtasks_completed ON task_instance_subtasks(completed);
CREATE INDEX idx_task_instance_overrides_user_task_id ON task_instance_overrides(user_task_id);
CREATE INDEX idx_task_instance_overrides_dates ON task_instance_overrides(original_due_date, new_due_date);
CREATE INDEX idx_task_modification_history_user_task_id ON task_modification_history(user_task_id);
CREATE INDEX idx_task_modification_history_modified_at ON task_modification_history(modified_at);
CREATE INDEX idx_home_assessments_user_id ON home_assessments(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX idx_user_statistics_date ON user_statistics(stat_date);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_instance_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_instance_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_modification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies

-- User profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- User tools: Users can only access their own tools
CREATE POLICY "Users can view own tools" ON user_tools
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tools" ON user_tools
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tools" ON user_tools
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tools" ON user_tools
  FOR DELETE USING (auth.uid() = user_id);

-- Home areas: Users can only access their own areas
CREATE POLICY "Users can view own areas" ON home_areas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own areas" ON home_areas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own areas" ON home_areas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own areas" ON home_areas
  FOR DELETE USING (auth.uid() = user_id);

-- Task templates: Read-only for all authenticated users
CREATE POLICY "Anyone can view task templates" ON task_templates
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify task templates" ON task_templates
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Task subtasks: Read-only for all authenticated users
CREATE POLICY "Anyone can view task subtasks" ON task_subtasks
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify task subtasks" ON task_subtasks
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- User tasks: Users can only access their own tasks
CREATE POLICY "Users can view own user tasks" ON user_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user tasks" ON user_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user tasks" ON user_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own user tasks" ON user_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Task instances: Users can only access their own instances
CREATE POLICY "Users can view own task instances" ON task_instances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instances.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task instances" ON task_instances
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instances.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own task instances" ON task_instances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instances.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task instances" ON task_instances
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instances.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

-- Task instance subtasks: Users can only access their own
CREATE POLICY "Users can view own task instance subtasks" ON task_instance_subtasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM task_instances ti
      JOIN user_tasks ut ON ti.user_task_id = ut.id
      WHERE ti.id = task_instance_subtasks.task_instance_id 
      AND ut.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task instance subtasks" ON task_instance_subtasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_instances ti
      JOIN user_tasks ut ON ti.user_task_id = ut.id
      WHERE ti.id = task_instance_subtasks.task_instance_id 
      AND ut.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own task instance subtasks" ON task_instance_subtasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM task_instances ti
      JOIN user_tasks ut ON ti.user_task_id = ut.id
      WHERE ti.id = task_instance_subtasks.task_instance_id 
      AND ut.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task instance subtasks" ON task_instance_subtasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM task_instances ti
      JOIN user_tasks ut ON ti.user_task_id = ut.id
      WHERE ti.id = task_instance_subtasks.task_instance_id 
      AND ut.user_id = auth.uid()
    )
  );

-- Task instance overrides: Users can only access their own overrides
CREATE POLICY "Users can view own task instance overrides" ON task_instance_overrides
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instance_overrides.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task instance overrides" ON task_instance_overrides
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instance_overrides.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own task instance overrides" ON task_instance_overrides
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instance_overrides.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task instance overrides" ON task_instance_overrides
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instance_overrides.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

-- Task modification history: Users can only access their own history
CREATE POLICY "Users can view own task modification history" ON task_modification_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_modification_history.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task modification history" ON task_modification_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_modification_history.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

-- Home assessments: Users can only access their own assessment
CREATE POLICY "Users can view own home assessment" ON home_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own home assessment" ON home_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own home assessment" ON home_assessments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own home assessment" ON home_assessments
  FOR DELETE USING (auth.uid() = user_id);

-- User achievements: Users can only access their own achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User statistics: Users can only access their own statistics
CREATE POLICY "Users can view own statistics" ON user_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own statistics" ON user_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statistics" ON user_statistics
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 6: Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tools_updated_at
  BEFORE UPDATE ON user_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_home_areas_updated_at
  BEFORE UPDATE ON home_areas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON task_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_subtasks_updated_at
  BEFORE UPDATE ON task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tasks_updated_at
  BEFORE UPDATE ON user_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_home_assessments_updated_at
  BEFORE UPDATE ON home_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_statistics_updated_at
  BEFORE UPDATE ON user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Create gamification functions

-- Function to calculate level from experience points
CREATE OR REPLACE FUNCTION calculate_level(exp_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(exp_points / 100)) + 1;
END;
$$ language 'plpgsql';

-- Function to calculate experience needed for next level
CREATE OR REPLACE FUNCTION exp_needed_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (level * level) * 100;
END;
$$ language 'plpgsql';

-- Function to award experience points
CREATE OR REPLACE FUNCTION award_experience(
  p_user_id UUID,
  p_exp_amount INTEGER,
  p_task_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  old_level INTEGER;
  new_level INTEGER;
  old_exp INTEGER;
  new_exp INTEGER;
  level_up BOOLEAN := FALSE;
  result JSONB;
BEGIN
  -- Get current profile
  SELECT level, experience_points INTO old_level, old_exp
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- Calculate new values
  new_exp := old_exp + p_exp_amount;
  new_level := calculate_level(new_exp);
  
  -- Check if level up
  IF new_level > old_level THEN
    level_up := TRUE;
  END IF;
  
  -- Update profile
  UPDATE user_profiles
  SET 
    experience_points = new_exp,
    level = new_level,
    total_tasks_completed = total_tasks_completed + CASE WHEN p_task_name IS NOT NULL THEN 1 ELSE 0 END
  WHERE user_id = p_user_id;
  
  -- Log statistics
  INSERT INTO user_statistics (user_id, stat_type, stat_value)
  VALUES (p_user_id, 'exp_earned', p_exp_amount)
  ON CONFLICT (user_id, stat_type, stat_date) 
  DO UPDATE SET stat_value = user_statistics.stat_value + p_exp_amount;
  
  -- Return result
  result := jsonb_build_object(
    'old_level', old_level,
    'new_level', new_level,
    'old_exp', old_exp,
    'new_exp', new_exp,
    'exp_gained', p_exp_amount,
    'level_up', level_up,
    'exp_needed_next', CASE WHEN level_up THEN 0 ELSE exp_needed_for_level(new_level) - new_exp END
  );
  
  RETURN result;
END;
$$ language 'plpgsql';

-- Function to generate next task instance when one is completed
CREATE OR REPLACE FUNCTION generate_next_task_instance()
RETURNS TRIGGER AS $$
DECLARE
  user_task_record RECORD;
  next_due_date DATE;
BEGIN
  -- Only generate next instance if this one was just completed
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    -- Get the user task details
    SELECT * INTO user_task_record
    FROM user_tasks
    WHERE id = NEW.user_task_id;
    
    IF user_task_record IS NOT NULL AND user_task_record.is_active = TRUE THEN
      -- Calculate next due date based on frequency
      next_due_date := NEW.due_date + (user_task_record.custom_frequency_days || ' days')::INTERVAL;
      
      -- Insert next instance
      INSERT INTO task_instances (user_task_id, due_date)
      VALUES (NEW.user_task_id, next_due_date)
      ON CONFLICT (user_task_id, due_date) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create a single instance override
CREATE OR REPLACE FUNCTION create_task_override(
  p_user_task_id UUID,
  p_original_due_date DATE,
  p_new_due_date DATE,
  p_override_type TEXT DEFAULT 'moved',
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  override_id UUID;
BEGIN
  -- Insert the override
  INSERT INTO task_instance_overrides (
    user_task_id, 
    original_due_date, 
    new_due_date, 
    override_type, 
    reason
  ) VALUES (
    p_user_task_id, 
    p_original_due_date, 
    p_new_due_date, 
    p_override_type, 
    p_reason
  ) RETURNING id INTO override_id;
  
  -- Log the modification
  INSERT INTO task_modification_history (
    user_task_id,
    modification_type,
    modified_by
  ) VALUES (
    p_user_task_id,
    'single_override',
    auth.uid()
  );
  
  RETURN override_id;
END;
$$ language 'plpgsql';

-- Function to modify future pattern
CREATE OR REPLACE FUNCTION modify_future_pattern(
  p_user_task_id UUID,
  p_new_frequency_days INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  old_frequency INTEGER;
BEGIN
  -- Get current frequency
  SELECT COALESCE(custom_frequency_days, 
    (SELECT base_frequency_days FROM task_templates WHERE id = template_id)
  ) INTO old_frequency
  FROM user_tasks WHERE id = p_user_task_id;
  
  -- Update the user task
  UPDATE user_tasks 
  SET custom_frequency_days = p_new_frequency_days
  WHERE id = p_user_task_id;
  
  -- Log the modification
  INSERT INTO task_modification_history (
    user_task_id,
    modification_type,
    old_frequency_days,
    new_frequency_days,
    modified_by
  ) VALUES (
    p_user_task_id,
    'future_pattern',
    old_frequency,
    p_new_frequency_days,
    auth.uid()
  );
END;
$$ language 'plpgsql';

-- Function to get calendar tasks with overrides
CREATE OR REPLACE FUNCTION get_calendar_tasks_with_overrides(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  due_date DATE,
  task_name TEXT,
  display_name TEXT,
  category TEXT,
  importance_level INTEGER,
  estimated_minutes INTEGER,
  subtask_count INTEGER,
  is_override BOOLEAN,
  override_reason TEXT,
  frequency_days INTEGER,
  exp_reward INTEGER,
  area_health_impact INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::INTERVAL)::DATE as date
  ),
  regular_tasks AS (
    SELECT 
      ds.date as due_date,
      tt.name as task_name,
      COALESCE(ut.custom_name, tt.name) as display_name,
      tt.category,
      tt.importance_level,
      COUNT(ts.id) as subtask_count,
      COALESCE(ut.custom_frequency_days, tt.base_frequency_days) as frequency_days,
      FALSE as is_override,
      NULL::TEXT as override_reason,
      (SELECT SUM(estimated_minutes) FROM task_subtasks ts2 
       WHERE ts2.template_id = tt.id) as estimated_minutes,
      tt.exp_reward,
      tt.area_health_impact
    FROM date_series ds
    CROSS JOIN user_tasks ut
    JOIN task_templates tt ON ut.template_id = tt.id
    LEFT JOIN task_subtasks ts ON tt.id = ts.template_id
    WHERE ut.user_id = p_user_id 
    AND ut.is_active = TRUE
    AND ds.date % COALESCE(ut.custom_frequency_days, tt.base_frequency_days) = 0
    GROUP BY ds.date, tt.name, ut.custom_name, tt.category, tt.importance_level, ut.custom_frequency_days, tt.base_frequency_days, tt.id, tt.exp_reward, tt.area_health_impact
  ),
  override_tasks AS (
    SELECT 
      tio.new_due_date as due_date,
      tt.name as task_name,
      COALESCE(ut.custom_name, tt.name) as display_name,
      tt.category,
      tt.importance_level,
      COUNT(ts.id) as subtask_count,
      COALESCE(ut.custom_frequency_days, tt.base_frequency_days) as frequency_days,
      TRUE as is_override,
      tio.reason as override_reason,
      (SELECT SUM(estimated_minutes) FROM task_subtasks ts2 
       WHERE ts2.template_id = tt.id) as estimated_minutes,
      tt.exp_reward,
      tt.area_health_impact
    FROM task_instance_overrides tio
    JOIN user_tasks ut ON tio.user_task_id = ut.id
    JOIN task_templates tt ON ut.template_id = tt.id
    LEFT JOIN task_subtasks ts ON tt.id = ts.template_id
    WHERE ut.user_id = p_user_id
    AND tio.new_due_date BETWEEN p_start_date AND p_end_date
    GROUP BY tio.new_due_date, tt.name, ut.custom_name, tt.category, tt.importance_level, ut.custom_frequency_days, tt.base_frequency_days, tio.reason, tt.id, tt.exp_reward, tt.area_health_impact
  )
  SELECT * FROM regular_tasks
  WHERE due_date NOT IN (
    SELECT original_due_date FROM task_instance_overrides tio
    JOIN user_tasks ut ON tio.user_task_id = ut.id
    WHERE ut.user_id = p_user_id
  )
  UNION ALL
  SELECT * FROM override_tasks
  ORDER BY due_date, importance_level DESC, display_name;
END;
$$ language 'plpgsql';

-- Step 8: Create trigger for automatic next instance generation
CREATE TRIGGER generate_next_task_instance_trigger
  AFTER UPDATE ON task_instances
  FOR EACH ROW
  EXECUTE FUNCTION generate_next_task_instance();

-- Step 9: Create views for easy querying
CREATE OR REPLACE VIEW user_task_view AS
SELECT 
  ut.id as user_task_id,
  ut.user_id,
  tt.id as template_id,
  tt.name as task_name,
  COALESCE(ut.custom_name, tt.name) as display_name,
  COALESCE(ut.custom_description, tt.description) as description,
  tt.category,
  COALESCE(ut.custom_frequency_days, tt.base_frequency_days) as frequency_days,
  tt.importance_level,
  tt.health_impact,
  tt.scientific_source,
  tt.source_url,
  tt.ai_explanation,
  tt.exp_reward,
  tt.area_health_impact,
  ut.is_active,
  ut.created_at as user_task_created_at,
  tt.created_at as template_created_at
FROM user_tasks ut
JOIN task_templates tt ON ut.template_id = tt.id;

CREATE OR REPLACE VIEW task_instance_view AS
SELECT 
  ti.id as instance_id,
  ti.user_task_id,
  ti.due_date,
  ti.completed,
  ti.completed_at,
  ti.exp_earned,
  ti.area_health_restored,
  ti.tools_used,
  ti.created_at as instance_created_at,
  utv.user_id,
  utv.task_name,
  utv.display_name,
  utv.description,
  utv.category,
  utv.frequency_days,
  utv.importance_level,
  utv.health_impact,
  utv.scientific_source,
  utv.source_url,
  utv.ai_explanation,
  utv.exp_reward,
  utv.area_health_impact,
  utv.is_active
FROM task_instances ti
JOIN user_task_view utv ON ti.user_task_id = utv.user_task_id;

CREATE OR REPLACE VIEW task_subtask_view AS
SELECT 
  ts.id as subtask_id,
  ts.template_id,
  ts.title,
  ts.description,
  ts.estimated_minutes,
  ts.order_index,
  ts.is_required,
  ts.exp_reward,
  ts.tools_needed,
  ts.difficulty,
  ts.metadata,
  tt.name as template_name,
  tt.category
FROM task_subtasks ts
JOIN task_templates tt ON ts.template_id = tt.id
ORDER BY ts.template_id, ts.order_index;

-- =====================================================
-- MIGRATION COMPLETE - GAMIFIED SCHEMA
-- ===================================================== 