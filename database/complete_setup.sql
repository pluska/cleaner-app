-- =====================================================
-- CLEANER PLANNER - COMPLETE SETUP SCRIPT
-- Everything needed for first run of the application
-- =====================================================

-- ⚠️ WARNING: This script will set up the complete database schema
-- Run this in Supabase SQL Editor for a fresh installation

-- Step 1: Create the complete gamified schema
-- =====================================================

-- User profiles with gamification
CREATE TABLE IF NOT EXISTS user_profiles (
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
CREATE TABLE IF NOT EXISTS user_tools (
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
CREATE TABLE IF NOT EXISTS home_areas (
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

-- Task templates (with all required columns for AI generation)
CREATE TABLE IF NOT EXISTS task_templates (
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
  room_specific TEXT DEFAULT 'general',
  language TEXT NOT NULL CHECK (language IN ('en', 'es')),
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, language)
);

-- Task subtasks with gamification
CREATE TABLE IF NOT EXISTS task_subtasks (
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
CREATE TABLE IF NOT EXISTS user_tasks (
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
CREATE TABLE IF NOT EXISTS task_instances (
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
CREATE TABLE IF NOT EXISTS task_instance_subtasks (
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
CREATE TABLE IF NOT EXISTS task_instance_overrides (
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
CREATE TABLE IF NOT EXISTS task_modification_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_task_id UUID REFERENCES user_tasks(id) ON DELETE CASCADE,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('single_override', 'future_pattern', 'complete_reset')),
  old_frequency_days INTEGER,
  new_frequency_days INTEGER,
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_by UUID REFERENCES auth.users(id)
);

-- Home assessment data (with language support)
CREATE TABLE IF NOT EXISTS home_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  home_type TEXT NOT NULL CHECK (home_type IN ('apartment', 'house', 'studio')),
  rooms JSONB NOT NULL,
  pets BOOLEAN DEFAULT FALSE,
  children BOOLEAN DEFAULT FALSE,
  allergies BOOLEAN DEFAULT FALSE,
  lifestyle TEXT NOT NULL CHECK (lifestyle IN ('busy', 'moderate', 'relaxed')),
  cleaning_preferences TEXT NOT NULL CHECK (cleaning_preferences IN ('minimal', 'standard', 'thorough')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  exp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- User statistics for analytics
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  subtasks_completed INTEGER DEFAULT 0,
  total_minutes_spent INTEGER DEFAULT 0,
  exp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  gems_earned INTEGER DEFAULT 0,
  streak_maintained BOOLEAN DEFAULT FALSE,
  areas_cleaned INTEGER DEFAULT 0,
  tools_used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stat_date)
);

-- Step 2: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_user_tools_user_id ON user_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tools_active ON user_tools(is_active);
CREATE INDEX IF NOT EXISTS idx_user_tools_durability ON user_tools(current_durability);
CREATE INDEX IF NOT EXISTS idx_home_areas_user_id ON home_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_home_areas_health ON home_areas(current_health);
CREATE INDEX IF NOT EXISTS idx_task_templates_language ON task_templates(language);
CREATE INDEX IF NOT EXISTS idx_task_templates_category ON task_templates(category);
CREATE INDEX IF NOT EXISTS idx_task_templates_room_specific ON task_templates(room_specific);
CREATE INDEX IF NOT EXISTS idx_task_subtasks_template_id ON task_subtasks(template_id);
CREATE INDEX IF NOT EXISTS idx_task_subtasks_order ON task_subtasks(template_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_active ON user_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_task_instances_user_task_id ON task_instances(user_task_id);
CREATE INDEX IF NOT EXISTS idx_task_instances_due_date ON task_instances(due_date);
CREATE INDEX IF NOT EXISTS idx_task_instances_completed ON task_instances(completed);
CREATE INDEX IF NOT EXISTS idx_task_instance_subtasks_instance_id ON task_instance_subtasks(task_instance_id);
CREATE INDEX IF NOT EXISTS idx_task_instance_subtasks_completed ON task_instance_subtasks(completed);
CREATE INDEX IF NOT EXISTS idx_task_instance_overrides_user_task_id ON task_instance_overrides(user_task_id);
CREATE INDEX IF NOT EXISTS idx_task_instance_overrides_dates ON task_instance_overrides(original_due_date, new_due_date);
CREATE INDEX IF NOT EXISTS idx_task_modification_history_user_task_id ON task_modification_history(user_task_id);
CREATE INDEX IF NOT EXISTS idx_task_modification_history_modified_at ON task_modification_history(modified_at);
CREATE INDEX IF NOT EXISTS idx_home_assessments_user_id ON home_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_home_assessments_language ON home_assessments(language);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_date ON user_statistics(stat_date);

-- Step 3: Create triggers for updated_at
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
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

-- Step 4: Create gamification functions
-- =====================================================

-- Function to calculate level from experience points
CREATE OR REPLACE FUNCTION calculate_level(exp_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(exp_points / 100)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate experience needed for next level
CREATE OR REPLACE FUNCTION exp_needed_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (level * level - 1) * 100;
END;
$$ LANGUAGE plpgsql;

-- Function to award experience and update user profile
CREATE OR REPLACE FUNCTION award_experience(
  p_user_id UUID,
  p_exp_amount INTEGER,
  p_task_completed BOOLEAN DEFAULT FALSE,
  p_subtask_completed BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
  current_profile user_profiles%ROWTYPE;
  new_level INTEGER;
  old_level INTEGER;
  exp_needed INTEGER;
  result JSONB;
BEGIN
  -- Get current profile
  SELECT * INTO current_profile 
  FROM user_profiles 
  WHERE user_id = p_user_id;
  
  -- Create profile if it doesn't exist
  IF current_profile IS NULL THEN
    INSERT INTO user_profiles (user_id, level, experience_points)
    VALUES (p_user_id, 1, p_exp_amount)
    RETURNING * INTO current_profile;
  ELSE
    -- Update existing profile
    UPDATE user_profiles 
    SET experience_points = experience_points + p_exp_amount,
        total_tasks_completed = total_tasks_completed + CASE WHEN p_task_completed THEN 1 ELSE 0 END,
        total_subtasks_completed = total_subtasks_completed + CASE WHEN p_subtask_completed THEN 1 ELSE 0 END
    WHERE user_id = p_user_id
    RETURNING * INTO current_profile;
  END IF;
  
  -- Calculate new level
  old_level := current_profile.level;
  new_level := calculate_level(current_profile.experience_points);
  exp_needed := exp_needed_for_level(new_level);
  
  -- Update level if increased
  IF new_level > old_level THEN
    UPDATE user_profiles 
    SET level = new_level,
        coins = coins + (new_level - old_level) * 50,
        gems = gems + (new_level - old_level) * 5
    WHERE user_id = p_user_id;
  END IF;
  
  -- Return result
  result := jsonb_build_object(
    'user_id', p_user_id,
    'old_level', old_level,
    'new_level', new_level,
    'current_exp', current_profile.experience_points,
    'exp_needed', exp_needed,
    'leveled_up', new_level > old_level,
    'coins_earned', CASE WHEN new_level > old_level THEN (new_level - old_level) * 50 ELSE 0 END,
    'gems_earned', CASE WHEN new_level > old_level THEN (new_level - old_level) * 5 ELSE 0 END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Grant all necessary permissions
-- =====================================================

-- Grant permissions to all tables
GRANT ALL PRIVILEGES ON user_profiles TO anon;
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;

GRANT ALL PRIVILEGES ON user_tools TO anon;
GRANT ALL PRIVILEGES ON user_tools TO authenticated;

GRANT ALL PRIVILEGES ON home_areas TO anon;
GRANT ALL PRIVILEGES ON home_areas TO authenticated;

GRANT ALL PRIVILEGES ON task_templates TO anon;
GRANT ALL PRIVILEGES ON task_templates TO authenticated;

GRANT ALL PRIVILEGES ON task_subtasks TO anon;
GRANT ALL PRIVILEGES ON task_subtasks TO authenticated;

GRANT ALL PRIVILEGES ON user_tasks TO anon;
GRANT ALL PRIVILEGES ON user_tasks TO authenticated;

GRANT ALL PRIVILEGES ON task_instances TO anon;
GRANT ALL PRIVILEGES ON task_instances TO authenticated;

GRANT ALL PRIVILEGES ON task_instance_subtasks TO anon;
GRANT ALL PRIVILEGES ON task_instance_subtasks TO authenticated;

GRANT ALL PRIVILEGES ON task_instance_overrides TO anon;
GRANT ALL PRIVILEGES ON task_instance_overrides TO authenticated;

GRANT ALL PRIVILEGES ON task_modification_history TO anon;
GRANT ALL PRIVILEGES ON task_modification_history TO authenticated;

GRANT ALL PRIVILEGES ON home_assessments TO anon;
GRANT ALL PRIVILEGES ON home_assessments TO authenticated;

GRANT ALL PRIVILEGES ON user_achievements TO anon;
GRANT ALL PRIVILEGES ON user_achievements TO authenticated;

GRANT ALL PRIVILEGES ON user_statistics TO anon;
GRANT ALL PRIVILEGES ON user_statistics TO authenticated;

-- Grant sequence permissions (if sequences exist)
DO $$
BEGIN
    -- user_profiles sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'user_profiles_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE user_profiles_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE user_profiles_id_seq TO authenticated;
    END IF;
    
    -- user_tools sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'user_tools_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE user_tools_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE user_tools_id_seq TO authenticated;
    END IF;
    
    -- home_areas sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'home_areas_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE home_areas_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE home_areas_id_seq TO authenticated;
    END IF;
    
    -- task_templates sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'task_templates_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE task_templates_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE task_templates_id_seq TO authenticated;
    END IF;
    
    -- task_subtasks sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'task_subtasks_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE task_subtasks_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE task_subtasks_id_seq TO authenticated;
    END IF;
    
    -- user_tasks sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'user_tasks_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE user_tasks_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE user_tasks_id_seq TO authenticated;
    END IF;
    
    -- task_instances sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'task_instances_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE task_instances_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE task_instances_id_seq TO authenticated;
    END IF;
    
    -- task_instance_subtasks sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'task_instance_subtasks_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE task_instance_subtasks_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE task_instance_subtasks_id_seq TO authenticated;
    END IF;
    
    -- task_instance_overrides sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'task_instance_overrides_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE task_instance_overrides_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE task_instance_overrides_id_seq TO authenticated;
    END IF;
    
    -- task_modification_history sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'task_modification_history_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE task_modification_history_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE task_modification_history_id_seq TO authenticated;
    END IF;
    
    -- home_assessments sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'home_assessments_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE home_assessments_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE home_assessments_id_seq TO authenticated;
    END IF;
    
    -- user_achievements sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'user_achievements_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE user_achievements_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE user_achievements_id_seq TO authenticated;
    END IF;
    
    -- user_statistics sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'user_statistics_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE user_statistics_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE user_statistics_id_seq TO authenticated;
    END IF;
END $$;

-- Step 6: Create RLS policies
-- =====================================================

-- Enable RLS on all tables
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

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User tools policies
CREATE POLICY "Users can view own tools" ON user_tools
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tools" ON user_tools
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tools" ON user_tools
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Home areas policies
CREATE POLICY "Users can view own areas" ON home_areas
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own areas" ON home_areas
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own areas" ON home_areas
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Task templates policies (allow AI-generated content)
CREATE POLICY "Authenticated users can view task templates" ON task_templates
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create AI task templates" ON task_templates
  FOR INSERT TO authenticated
  WITH CHECK (is_ai_generated = true);

-- Task subtasks policies
CREATE POLICY "Authenticated users can view task subtasks" ON task_subtasks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create AI task subtasks" ON task_subtasks
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- User tasks policies
CREATE POLICY "Users can view own user tasks" ON user_tasks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user tasks" ON user_tasks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user tasks" ON user_tasks
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own user tasks" ON user_tasks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Task instances policies
CREATE POLICY "Users can view own task instances" ON task_instances
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instances.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task instances" ON task_instances
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instances.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own task instances" ON task_instances
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instances.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instances.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

-- Task instance subtasks policies
CREATE POLICY "Users can view own task instance subtasks" ON task_instance_subtasks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_instances 
      JOIN user_tasks ON user_tasks.id = task_instances.user_task_id
      WHERE task_instances.id = task_instance_subtasks.task_instance_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task instance subtasks" ON task_instance_subtasks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_instances 
      JOIN user_tasks ON user_tasks.id = task_instances.user_task_id
      WHERE task_instances.id = task_instance_subtasks.task_instance_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own task instance subtasks" ON task_instance_subtasks
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_instances 
      JOIN user_tasks ON user_tasks.id = task_instances.user_task_id
      WHERE task_instances.id = task_instance_subtasks.task_instance_id 
      AND user_tasks.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_instances 
      JOIN user_tasks ON user_tasks.id = task_instances.user_task_id
      WHERE task_instances.id = task_instance_subtasks.task_instance_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

-- Task instance overrides policies
CREATE POLICY "Users can view own task instance overrides" ON task_instance_overrides
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instance_overrides.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task instance overrides" ON task_instance_overrides
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_instance_overrides.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

-- Task modification history policies
CREATE POLICY "Users can view own task modification history" ON task_modification_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_modification_history.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task modification history" ON task_modification_history
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tasks 
      WHERE user_tasks.id = task_modification_history.user_task_id 
      AND user_tasks.user_id = auth.uid()
    )
  );

-- Home assessments policies
CREATE POLICY "Users can view own home assessments" ON home_assessments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own home assessments" ON home_assessments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own home assessments" ON home_assessments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own home assessments" ON home_assessments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User statistics policies
CREATE POLICY "Users can view own statistics" ON user_statistics
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own statistics" ON user_statistics
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statistics" ON user_statistics
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 7: Refresh schema cache
-- =====================================================

SELECT pg_notify('schema_refresh', 'user_profiles');
SELECT pg_notify('schema_refresh', 'user_tools');
SELECT pg_notify('schema_refresh', 'home_areas');
SELECT pg_notify('schema_refresh', 'task_templates');
SELECT pg_notify('schema_refresh', 'task_subtasks');
SELECT pg_notify('schema_refresh', 'user_tasks');
SELECT pg_notify('schema_refresh', 'task_instances');
SELECT pg_notify('schema_refresh', 'task_instance_subtasks');
SELECT pg_notify('schema_refresh', 'task_instance_overrides');
SELECT pg_notify('schema_refresh', 'task_modification_history');
SELECT pg_notify('schema_refresh', 'home_assessments');
SELECT pg_notify('schema_refresh', 'user_achievements');
SELECT pg_notify('schema_refresh', 'user_statistics');

-- Step 8: Verification
-- =====================================================

-- Verify all tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
    'user_profiles', 'user_tools', 'home_areas', 'task_templates', 
    'task_subtasks', 'user_tasks', 'task_instances', 'task_instance_subtasks',
    'task_instance_overrides', 'task_modification_history', 'home_assessments',
    'user_achievements', 'user_statistics'
)
ORDER BY table_name;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'user_profiles', 'user_tools', 'home_areas', 'task_templates', 
    'task_subtasks', 'user_tasks', 'task_instances', 'task_instance_subtasks',
    'task_instance_overrides', 'task_modification_history', 'home_assessments',
    'user_achievements', 'user_statistics'
)
ORDER BY tablename;

-- Verify permissions
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public'
AND table_name IN (
    'user_profiles', 'user_tools', 'home_areas', 'task_templates', 
    'task_subtasks', 'user_tasks', 'task_instances', 'task_instance_subtasks',
    'task_instance_overrides', 'task_modification_history', 'home_assessments',
    'user_achievements', 'user_statistics'
)
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- =====================================================
-- SETUP COMPLETE! 
-- Your database is now ready for the Cleaner Planner application.
-- ===================================================== 