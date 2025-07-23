-- Create the tasks table with enhanced scheduling support
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  category TEXT NOT NULL CHECK (category IN ('kitchen', 'bathroom', 'bedroom', 'living_room', 'laundry', 'exterior', 'general')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- New fields for enhanced scheduling
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_start_date DATE,
  recurrence_end_date DATE,
  last_generated_date DATE,
  original_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  -- New fields for day-of-week scheduling
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0-6 (Sunday-Saturday)
  preferred_time TIME -- HH:MM format
);

-- Create task_instances table for recurring task instances
CREATE TABLE IF NOT EXISTS task_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, due_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON tasks(is_recurring);
CREATE INDEX IF NOT EXISTS idx_tasks_day_of_week ON tasks(day_of_week);
CREATE INDEX IF NOT EXISTS idx_task_instances_user_date ON task_instances(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_task_instances_task_date ON task_instances(task_id, due_date);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_instances ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks table
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for task_instances table
CREATE POLICY "Users can view own task instances" ON task_instances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task instances" ON task_instances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task instances" ON task_instances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own task instances" ON task_instances
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate next occurrence date based on frequency and day_of_week
CREATE OR REPLACE FUNCTION calculate_next_occurrence(
  start_date DATE,
  frequency TEXT,
  day_of_week INTEGER DEFAULT NULL
)
RETURNS DATE AS $$
DECLARE
  next_date DATE;
  current_day_of_week INTEGER;
BEGIN
  next_date := start_date;
  
  CASE frequency
    WHEN 'daily' THEN
      next_date := start_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      IF day_of_week IS NOT NULL THEN
        -- Find the next occurrence of the specified day of week
        current_day_of_week := EXTRACT(DOW FROM start_date);
        IF current_day_of_week = day_of_week THEN
          next_date := start_date + INTERVAL '1 week';
        ELSE
          -- Calculate days until next occurrence
          IF day_of_week > current_day_of_week THEN
            next_date := start_date + INTERVAL '1 day' * (day_of_week - current_day_of_week);
          ELSE
            next_date := start_date + INTERVAL '1 day' * (7 - current_day_of_week + day_of_week);
          END IF;
        END IF;
      ELSE
        next_date := start_date + INTERVAL '1 week';
      END IF;
    WHEN 'monthly' THEN
      next_date := start_date + INTERVAL '1 month';
    WHEN 'yearly' THEN
      next_date := start_date + INTERVAL '1 year';
  END CASE;
  
  RETURN next_date;
END;
$$ language 'plpgsql';

-- Create a separate table to track generation state (this won't trigger recursion)
CREATE TABLE IF NOT EXISTS task_generation_state (
  task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
  last_generated_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to generate recurring task instances (FINAL FIXED VERSION)
CREATE OR REPLACE FUNCTION generate_recurring_instances()
RETURNS TRIGGER AS $$
DECLARE
  current_date_val DATE;
  end_date DATE;
  instance_date DATE;
  max_instances INTEGER := 50; -- Prevent infinite loops
  instance_count INTEGER := 0;
  generation_state RECORD;
BEGIN
  -- Only process if this is a recurring task
  IF NEW.is_recurring = TRUE THEN
    -- Get or create generation state
    SELECT * INTO generation_state 
    FROM task_generation_state 
    WHERE task_id = NEW.id;
    
    IF generation_state IS NULL THEN
      -- Create initial generation state
      INSERT INTO task_generation_state (task_id, last_generated_date)
      VALUES (NEW.id, COALESCE(NEW.recurrence_start_date, NEW.due_date));
      
      current_date_val := COALESCE(NEW.recurrence_start_date, NEW.due_date);
    ELSE
      current_date_val := generation_state.last_generated_date;
    END IF;
    
    end_date := COALESCE(NEW.recurrence_end_date, current_date_val + INTERVAL '6 months');
    
    -- Generate instances for the next 6 months (with safety limit)
    WHILE current_date_val <= LEAST(end_date, current_date_val + INTERVAL '6 months') 
          AND instance_count < max_instances LOOP
      
      -- Calculate next occurrence based on frequency and day_of_week
      instance_date := calculate_next_occurrence(current_date_val, NEW.frequency, NEW.day_of_week);
      
      -- Insert task instance if it doesn't exist and is within the valid range
      IF instance_date <= end_date THEN
        INSERT INTO task_instances (task_id, due_date, user_id)
        VALUES (NEW.id, instance_date, NEW.user_id)
        ON CONFLICT (task_id, due_date) DO NOTHING;
      END IF;
      
      current_date_val := instance_date;
      instance_count := instance_count + 1;
    END LOOP;
    
    -- Update generation state (this won't trigger recursion)
    INSERT INTO task_generation_state (task_id, last_generated_date)
    VALUES (NEW.id, current_date_val)
    ON CONFLICT (task_id) 
    DO UPDATE SET 
      last_generated_date = EXCLUDED.last_generated_date,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to get last generated date for a task
CREATE OR REPLACE FUNCTION get_task_last_generated_date(task_id UUID)
RETURNS DATE AS $$
DECLARE
  last_date DATE;
BEGIN
  SELECT last_generated_date INTO last_date
  FROM task_generation_state
  WHERE task_id = $1;
  
  RETURN last_date;
END;
$$ language 'plpgsql';

-- Create trigger to generate recurring instances
CREATE TRIGGER generate_recurring_task_instances
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION generate_recurring_instances();

-- Create function to generate missing instances for existing recurring tasks
CREATE OR REPLACE FUNCTION generate_missing_instances()
RETURNS void AS $$
DECLARE
  task_record RECORD;
BEGIN
  FOR task_record IN 
    SELECT * FROM tasks 
    WHERE is_recurring = TRUE 
    AND (last_generated_date IS NULL OR last_generated_date < CURRENT_DATE + INTERVAL '1 month')
  LOOP
    -- Update the task to trigger instance generation
    UPDATE tasks 
    SET last_generated_date = COALESCE(task_record.last_generated_date, task_record.recurrence_start_date)
    WHERE id = task_record.id;
  END LOOP;
END;
$$ language 'plpgsql'; 