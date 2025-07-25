# Database Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key
3. Create a `.env.local` file in your project root with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## 2. Create Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create the tasks table
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
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
```

## 3. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/login`
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/auth/error`

## 4. Default Tasks

The application includes 40+ pre-defined cleaning tasks in both English and Spanish:

### Categories:

- **Kitchen**: Daily and weekly kitchen cleaning tasks
- **Bathroom**: Bathroom maintenance and cleaning
- **Bedroom**: Bedroom organization and cleaning
- **Living Room**: Living area maintenance
- **Laundry**: Laundry room tasks
- **Exterior**: Outdoor maintenance
- **General**: House-wide tasks

### Frequencies:

- **Daily**: Tasks that should be done every day
- **Weekly**: Tasks that should be done weekly
- **Monthly**: Monthly maintenance tasks
- **Yearly**: Annual deep cleaning tasks

### Priorities:

- **High**: Essential tasks for health and safety
- **Medium**: Important maintenance tasks
- **Low**: Optional organization tasks

## 5. Populating Default Tasks

The application automatically populates default tasks for new users. You can also manually populate tasks using the utility function:

```typescript
import { populateDefaultTasks } from "@/libs/populate-tasks";

// For English tasks
await populateDefaultTasks(userId, "en");

// For Spanish tasks
await populateDefaultTasks(userId, "es");
```

## 6. Task Management

Users can:

- Add custom tasks
- Edit existing tasks
- Mark tasks as completed
- Delete tasks
- Filter tasks by category, frequency, and priority
- View tasks in daily, weekly, monthly, and yearly views

## 7. Security

- Row Level Security (RLS) ensures users can only access their own tasks
- All database operations are authenticated
- User sessions are managed securely through Supabase Auth
