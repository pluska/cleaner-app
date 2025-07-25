-- =====================================================
-- CLEANER PLANNER - DATABASE MIGRATION V2 (CLEAN & DESTRUCTIVE)
-- Complete fresh start with optimized schema for AI-powered task management
-- =====================================================

-- ⚠️ WARNING: This migration will DROP ALL EXISTING DATA
-- Make sure you have backups if needed

-- Step 1: Drop all existing tables, functions, triggers, and policies
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Step 2: Create the optimized schema from scratch

-- Task templates (AI-generated or predefined)
CREATE TABLE task_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('kitchen', 'bathroom', 'bedroom', 'living_room', 'laundry', 'exterior', 'general')),
  base_frequency_days INTEGER NOT NULL CHECK (base_frequency_days > 0),
  importance_level INTEGER NOT NULL CHECK (importance_level >= 1 AND importance_level <= 5),
  health_impact TEXT,
  scientific_source TEXT,
  source_url TEXT,
  ai_explanation TEXT,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task subtasks (detailed steps for each task)
CREATE TABLE task_subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES task_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_minutes INTEGER DEFAULT 5 CHECK (estimated_minutes > 0),
  order_index INTEGER NOT NULL CHECK (order_index > 0),
  is_required BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, order_index)
);

-- User's selected tasks (personalized from templates)
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

-- Task instances (created on-demand when user completes a task)
CREATE TABLE task_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_task_id UUID REFERENCES user_tasks(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_task_id, due_date)
);

-- Task instance subtasks (tracking completion of individual subtasks)
CREATE TABLE task_instance_subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_instance_id UUID REFERENCES task_instances(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES task_subtasks(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_instance_id, subtask_id)
);

-- Task instance overrides (for single instance modifications)
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

-- Task modification history (audit trail)
CREATE TABLE task_modification_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_task_id UUID REFERENCES user_tasks(id) ON DELETE CASCADE,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('single_override', 'future_pattern', 'complete_reset')),
  old_frequency_days INTEGER,
  new_frequency_days INTEGER,
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_by UUID REFERENCES auth.users(id)
);

-- Home assessment data (for AI personalization)
CREATE TABLE home_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  home_type TEXT NOT NULL CHECK (home_type IN ('apartment', 'house', 'studio')),
  rooms JSONB NOT NULL, -- Array of room objects
  pets BOOLEAN DEFAULT FALSE,
  children BOOLEAN DEFAULT FALSE,
  allergies BOOLEAN DEFAULT FALSE,
  lifestyle TEXT NOT NULL CHECK (lifestyle IN ('busy', 'moderate', 'relaxed')),
  cleaning_preferences TEXT NOT NULL CHECK (cleaning_preferences IN ('minimal', 'standard', 'thorough')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_task_templates_category ON task_templates(category);
CREATE INDEX idx_task_templates_ai_generated ON task_templates(is_ai_generated);
CREATE INDEX idx_task_subtasks_template_id ON task_subtasks(template_id);
CREATE INDEX idx_task_subtasks_order ON task_subtasks(template_id, order_index);
CREATE INDEX idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX idx_user_tasks_template_id ON user_tasks(template_id);
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

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_instance_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_instance_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_modification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_assessments ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies

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

-- Step 6: Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Step 7: Create function to generate next task instance when one is completed
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

-- Step 8: Create trigger for automatic next instance generation
CREATE TRIGGER generate_next_task_instance_trigger
  AFTER UPDATE ON task_instances
  FOR EACH ROW
  EXECUTE FUNCTION generate_next_task_instance();

-- Step 9: Create function to initialize user tasks from templates
CREATE OR REPLACE FUNCTION initialize_user_tasks_from_templates(
  p_user_id UUID,
  p_template_ids UUID[]
)
RETURNS void AS $$
DECLARE
  template_id UUID;
BEGIN
  -- Insert user tasks for each template
  FOREACH template_id IN ARRAY p_template_ids
  LOOP
    INSERT INTO user_tasks (user_id, template_id)
    VALUES (p_user_id, template_id)
    ON CONFLICT (user_id, template_id) DO NOTHING;
  END LOOP;
END;
$$ language 'plpgsql';

-- Step 10: Create function to generate initial task instances for a user
CREATE OR REPLACE FUNCTION generate_initial_task_instances(p_user_id UUID)
RETURNS void AS $$
DECLARE
  user_task_record RECORD;
  initial_due_date DATE;
BEGIN
  -- Get all active user tasks for the user
  FOR user_task_record IN 
    SELECT ut.*, tt.base_frequency_days
    FROM user_tasks ut
    JOIN task_templates tt ON ut.template_id = tt.id
    WHERE ut.user_id = p_user_id AND ut.is_active = TRUE
  LOOP
    -- Set initial due date to today
    initial_due_date := CURRENT_DATE;
    
    -- Insert initial instance
    INSERT INTO task_instances (user_task_id, due_date)
    VALUES (user_task_record.id, initial_due_date)
    ON CONFLICT (user_task_id, due_date) DO NOTHING;
  END LOOP;
END;
$$ language 'plpgsql';

-- Step 10.5: Create functions for task modifications

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
  frequency_days INTEGER
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
       WHERE ts2.template_id = tt.id) as estimated_minutes
    FROM date_series ds
    CROSS JOIN user_tasks ut
    JOIN task_templates tt ON ut.template_id = tt.id
    LEFT JOIN task_subtasks ts ON tt.id = ts.template_id
    WHERE ut.user_id = p_user_id 
    AND ut.is_active = TRUE
    AND ds.date % COALESCE(ut.custom_frequency_days, tt.base_frequency_days) = 0
    GROUP BY ds.date, tt.name, ut.custom_name, tt.category, tt.importance_level, ut.custom_frequency_days, tt.base_frequency_days, tt.id
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
       WHERE ts2.template_id = tt.id) as estimated_minutes
    FROM task_instance_overrides tio
    JOIN user_tasks ut ON tio.user_task_id = ut.id
    JOIN task_templates tt ON ut.template_id = tt.id
    LEFT JOIN task_subtasks ts ON tt.id = ts.template_id
    WHERE ut.user_id = p_user_id
    AND tio.new_due_date BETWEEN p_start_date AND p_end_date
    GROUP BY tio.new_due_date, tt.name, ut.custom_name, tt.category, tt.importance_level, ut.custom_frequency_days, tt.base_frequency_days, tio.reason, tt.id
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

-- Step 11: Insert basic task templates with subtasks
INSERT INTO task_templates (name, description, category, base_frequency_days, importance_level, health_impact, scientific_source, source_url, ai_explanation, is_ai_generated) VALUES
-- Kitchen tasks
('Clean Kitchen Counters', 'Wipe down all kitchen surfaces to remove food particles and bacteria', 'kitchen', 1, 4, 'Prevents cross-contamination and foodborne illnesses', 'CDC Food Safety Guidelines', 'https://www.cdc.gov/foodsafety/index.html', 'Daily counter cleaning prevents the spread of harmful bacteria like E. coli and Salmonella that can cause food poisoning. The CDC recommends cleaning food contact surfaces after each use.', FALSE),

('Deep Clean Kitchen', 'Complete kitchen deep cleaning routine', 'kitchen', 14, 4, 'Prevents mold growth and maintains food safety', 'FDA Food Safety Guidelines', 'https://www.fda.gov/food', 'Bi-weekly deep cleaning prevents mold growth and cross-contamination. The FDA recommends regular deep cleaning to maintain food safety standards.', FALSE),

-- Bathroom tasks
('Clean Toilet', 'Scrub toilet bowl, seat, and surrounding areas', 'bathroom', 3, 5, 'Prevents spread of harmful bacteria and viruses', 'WHO Hygiene Guidelines', 'https://www.who.int/health-topics/hygiene', 'Regular toilet cleaning prevents the spread of harmful bacteria and viruses. The WHO emphasizes proper bathroom hygiene for disease prevention.', FALSE),

('Clean Shower/Bathtub', 'Remove soap scum and prevent mold growth', 'bathroom', 7, 4, 'Prevents mold and mildew that can cause respiratory issues', 'EPA Indoor Air Quality Guidelines', 'https://www.epa.gov/indoor-air-quality-iaq', 'Weekly shower cleaning prevents mold and mildew growth that can cause respiratory issues. The EPA recommends regular cleaning to maintain indoor air quality.', FALSE),

-- General tasks
('Vacuum Floors', 'Remove dust, allergens, and debris from all floor surfaces', 'general', 4, 4, 'Reduces allergens and improves indoor air quality', 'American Academy of Allergy, Asthma & Immunology', 'https://www.aaaai.org/', 'Regular vacuuming reduces allergens like dust mites and pet dander that can trigger asthma and allergies. The AAAAI recommends frequent cleaning for allergy sufferers.', FALSE),

('Change Bed Sheets', 'Wash and replace bed linens', 'bedroom', 7, 3, 'Prevents dust mite buildup and improves sleep quality', 'National Sleep Foundation', 'https://www.sleepfoundation.org/', 'Weekly sheet changes prevent dust mite buildup and improve sleep quality. The National Sleep Foundation recommends clean bedding for better sleep hygiene.', FALSE)

ON CONFLICT DO NOTHING;

-- Step 12: Insert subtasks for the templates
-- Get the template IDs first
DO $$
DECLARE
  kitchen_counters_id UUID;
  deep_clean_kitchen_id UUID;
  clean_toilet_id UUID;
  clean_shower_id UUID;
  vacuum_floors_id UUID;
  change_sheets_id UUID;
BEGIN
  -- Get template IDs
  SELECT id INTO kitchen_counters_id FROM task_templates WHERE name = 'Clean Kitchen Counters';
  SELECT id INTO deep_clean_kitchen_id FROM task_templates WHERE name = 'Deep Clean Kitchen';
  SELECT id INTO clean_toilet_id FROM task_templates WHERE name = 'Clean Toilet';
  SELECT id INTO clean_shower_id FROM task_templates WHERE name = 'Clean Shower/Bathtub';
  SELECT id INTO vacuum_floors_id FROM task_templates WHERE name = 'Vacuum Floors';
  SELECT id INTO change_sheets_id FROM task_templates WHERE name = 'Change Bed Sheets';

  -- Insert subtasks for Clean Kitchen Counters
  INSERT INTO task_subtasks (template_id, title, description, estimated_minutes, order_index, is_required, metadata) VALUES
  (kitchen_counters_id, 'Clear all surfaces', 'Remove all items from counters and tables', 2, 1, true, '{"tools_needed": ["dish towel"], "difficulty": "easy"}'),
  (kitchen_counters_id, 'Wipe down counters', 'Use disinfectant cleaner on all counter surfaces', 5, 2, true, '{"tools_needed": ["disinfectant", "sponge"], "difficulty": "easy"}'),
  (kitchen_counters_id, 'Clean sink and faucet', 'Remove soap scum and water spots', 3, 3, true, '{"tools_needed": ["baking soda", "vinegar"], "difficulty": "medium"}'),
  (kitchen_counters_id, 'Organize items', 'Put away items that don''t belong on counters', 2, 4, false, '{"tools_needed": [], "difficulty": "easy"}');

  -- Insert subtasks for Deep Clean Kitchen
  INSERT INTO task_subtasks (template_id, title, description, estimated_minutes, order_index, is_required, metadata) VALUES
  (deep_clean_kitchen_id, 'Clear all surfaces', 'Remove all items from counters, tables, and appliances', 5, 1, true, '{"tools_needed": ["dish towel"], "difficulty": "easy"}'),
  (deep_clean_kitchen_id, 'Clean refrigerator', 'Remove expired items and wipe down shelves', 10, 2, true, '{"tools_needed": ["disinfectant", "sponge"], "difficulty": "medium"}'),
  (deep_clean_kitchen_id, 'Scrub sink and faucet', 'Use baking soda and vinegar for deep cleaning', 8, 3, true, '{"tools_needed": ["baking soda", "vinegar", "brush"], "difficulty": "medium"}'),
  (deep_clean_kitchen_id, 'Clean oven and stovetop', 'Remove grease and food residue', 15, 4, true, '{"tools_needed": ["oven cleaner", "sponge"], "difficulty": "hard"}'),
  (deep_clean_kitchen_id, 'Organize pantry', 'Check expiration dates and reorganize items', 15, 5, false, '{"tools_needed": [], "difficulty": "medium"}');

  -- Insert subtasks for Clean Toilet
  INSERT INTO task_subtasks (template_id, title, description, estimated_minutes, order_index, is_required, metadata) VALUES
  (clean_toilet_id, 'Apply toilet cleaner', 'Apply cleaner to bowl and let sit', 1, 1, true, '{"tools_needed": ["toilet cleaner"], "difficulty": "easy"}'),
  (clean_toilet_id, 'Scrub toilet bowl', 'Use toilet brush to clean inside of bowl', 3, 2, true, '{"tools_needed": ["toilet brush"], "difficulty": "easy"}'),
  (clean_toilet_id, 'Clean toilet seat and lid', 'Wipe down with disinfectant', 2, 3, true, '{"tools_needed": ["disinfectant", "paper towel"], "difficulty": "easy"}'),
  (clean_toilet_id, 'Clean around toilet base', 'Wipe down floor and base area', 2, 4, true, '{"tools_needed": ["disinfectant", "sponge"], "difficulty": "easy"}');

  -- Insert subtasks for Clean Shower/Bathtub
  INSERT INTO task_subtasks (template_id, title, description, estimated_minutes, order_index, is_required, metadata) VALUES
  (clean_shower_id, 'Remove shower items', 'Take out all bottles and items from shower', 2, 1, true, '{"tools_needed": [], "difficulty": "easy"}'),
  (clean_shower_id, 'Apply cleaner', 'Spray cleaner on walls and floor', 2, 2, true, '{"tools_needed": ["shower cleaner"], "difficulty": "easy"}'),
  (clean_shower_id, 'Scrub walls and floor', 'Remove soap scum and mildew', 8, 3, true, '{"tools_needed": ["scrub brush", "sponge"], "difficulty": "medium"}'),
  (clean_shower_id, 'Clean shower head', 'Remove mineral deposits', 3, 4, false, '{"tools_needed": ["vinegar", "bag"], "difficulty": "medium"}'),
  (clean_shower_id, 'Rinse thoroughly', 'Rinse all surfaces with water', 2, 5, true, '{"tools_needed": [], "difficulty": "easy"}');

  -- Insert subtasks for Vacuum Floors
  INSERT INTO task_subtasks (template_id, title, description, estimated_minutes, order_index, is_required, metadata) VALUES
  (vacuum_floors_id, 'Clear floor obstacles', 'Pick up items from floor', 3, 1, true, '{"tools_needed": [], "difficulty": "easy"}'),
  (vacuum_floors_id, 'Vacuum main areas', 'Vacuum living room, dining room, and hallways', 8, 2, true, '{"tools_needed": ["vacuum cleaner"], "difficulty": "easy"}'),
  (vacuum_floors_id, 'Vacuum under furniture', 'Move furniture and vacuum underneath', 5, 3, false, '{"tools_needed": ["vacuum cleaner"], "difficulty": "medium"}'),
  (vacuum_floors_id, 'Empty vacuum bag', 'Dispose of collected dirt and debris', 2, 4, true, '{"tools_needed": [], "difficulty": "easy"}');

  -- Insert subtasks for Change Bed Sheets
  INSERT INTO task_subtasks (template_id, title, description, estimated_minutes, order_index, is_required, metadata) VALUES
  (change_sheets_id, 'Remove old sheets', 'Strip bed of old sheets and pillowcases', 3, 1, true, '{"tools_needed": [], "difficulty": "easy"}'),
  (change_sheets_id, 'Wash old sheets', 'Put old sheets in washing machine', 2, 2, true, '{"tools_needed": ["laundry detergent"], "difficulty": "easy"}'),
  (change_sheets_id, 'Put on new sheets', 'Put fresh sheets on bed', 5, 3, true, '{"tools_needed": ["clean sheets"], "difficulty": "medium"}'),
  (change_sheets_id, 'Fluff pillows', 'Fluff and arrange pillows', 1, 4, false, '{"tools_needed": [], "difficulty": "easy"}');

END $$;

-- Step 13: Create views for easy querying
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
  ts.metadata,
  tt.name as template_name,
  tt.category
FROM task_subtasks ts
JOIN task_templates tt ON ts.template_id = tt.id
ORDER BY ts.template_id, ts.order_index;

-- =====================================================
-- MIGRATION COMPLETE - CLEAN & OPTIMIZED SCHEMA
-- ===================================================== 