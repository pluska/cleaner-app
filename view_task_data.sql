-- View Task Data Script
-- This script helps you understand what's happening with your tasks

-- 1. View all base tasks
SELECT 
  id,
  title,
  frequency,
  is_recurring,
  due_date,
  recurrence_start_date,
  recurrence_end_date,
  day_of_week,
  completed,
  created_at
FROM tasks 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 2. View all task instances
SELECT 
  ti.id as instance_id,
  ti.task_id,
  ti.due_date,
  ti.completed,
  ti.created_at,
  t.title,
  t.frequency,
  t.is_recurring
FROM task_instances ti
JOIN tasks t ON ti.task_id = t.id
WHERE ti.user_id = auth.uid()
ORDER BY ti.due_date ASC;

-- 3. View generation state for recurring tasks
SELECT 
  tgs.task_id,
  t.title,
  tgs.last_generated_date,
  tgs.created_at,
  tgs.updated_at
FROM task_generation_state tgs
JOIN tasks t ON tgs.task_id = t.id
WHERE t.user_id = auth.uid()
ORDER BY tgs.updated_at DESC;

-- 4. Count summary
SELECT 
  'Base Tasks' as type,
  COUNT(*) as count
FROM tasks 
WHERE user_id = auth.uid()
UNION ALL
SELECT 
  'Recurring Tasks' as type,
  COUNT(*) as count
FROM tasks 
WHERE user_id = auth.uid() AND is_recurring = true
UNION ALL
SELECT 
  'Task Instances' as type,
  COUNT(*) as count
FROM task_instances 
WHERE user_id = auth.uid()
UNION ALL
SELECT 
  'Completed Instances' as type,
  COUNT(*) as count
FROM task_instances 
WHERE user_id = auth.uid() AND completed = true;

-- 5. View instances by task
SELECT 
  t.title,
  t.frequency,
  COUNT(ti.id) as instance_count,
  COUNT(CASE WHEN ti.completed = true THEN 1 END) as completed_count,
  MIN(ti.due_date) as earliest_due,
  MAX(ti.due_date) as latest_due
FROM tasks t
LEFT JOIN task_instances ti ON t.id = ti.task_id
WHERE t.user_id = auth.uid() AND t.is_recurring = true
GROUP BY t.id, t.title, t.frequency
ORDER BY instance_count DESC; 