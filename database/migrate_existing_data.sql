-- =====================================================
-- DATA MIGRATION SCRIPT
-- Transfer existing data to new optimized schema
-- =====================================================

-- Step 1: Create task templates from existing unique tasks
INSERT INTO task_templates (name, description, category, base_frequency_days, importance_level, is_ai_generated)
SELECT DISTINCT
  title as name,
  description,
  category,
  CASE 
    WHEN frequency = 'daily' THEN 1
    WHEN frequency = 'weekly' THEN 7
    WHEN frequency = 'monthly' THEN 30
    WHEN frequency = 'yearly' THEN 365
    ELSE 7 -- Default to weekly
  END as base_frequency_days,
  CASE 
    WHEN priority = 'low' THEN 1
    WHEN priority = 'medium' THEN 3
    WHEN priority = 'high' THEN 5
    ELSE 3 -- Default to medium
  END as importance_level,
  FALSE as is_ai_generated
FROM tasks
WHERE title IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 2: Create user_tasks from existing tasks
INSERT INTO user_tasks (user_id, template_id, custom_frequency_days, custom_name, custom_description)
SELECT DISTINCT
  t.user_id,
  tt.id as template_id,
  CASE 
    WHEN t.frequency = 'daily' THEN 1
    WHEN t.frequency = 'weekly' THEN 7
    WHEN t.frequency = 'monthly' THEN 30
    WHEN t.frequency = 'yearly' THEN 365
    ELSE 7
  END as custom_frequency_days,
  t.title as custom_name,
  t.description as custom_description
FROM tasks t
JOIN task_templates tt ON t.title = tt.name
WHERE t.user_id IS NOT NULL
ON CONFLICT (user_id, template_id) DO NOTHING;

-- Step 3: Create task instances from existing task_instances
INSERT INTO task_instances_v2 (user_task_id, due_date, completed, completed_at)
SELECT 
  ut.id as user_task_id,
  ti.due_date,
  ti.completed,
  CASE 
    WHEN ti.completed = TRUE THEN ti.created_at
    ELSE NULL
  END as completed_at
FROM task_instances ti
JOIN tasks t ON ti.task_id = t.id
JOIN task_templates tt ON t.title = tt.name
JOIN user_tasks ut ON ut.template_id = tt.id AND ut.user_id = t.user_id
WHERE ti.due_date IS NOT NULL
ON CONFLICT (user_task_id, due_date) DO NOTHING;

-- Step 4: Create task instances for tasks without instances (due today)
INSERT INTO task_instances_v2 (user_task_id, due_date, completed)
SELECT 
  ut.id as user_task_id,
  CURRENT_DATE as due_date,
  FALSE as completed
FROM user_tasks ut
WHERE NOT EXISTS (
  SELECT 1 FROM task_instances_v2 ti 
  WHERE ti.user_task_id = ut.id 
  AND ti.due_date = CURRENT_DATE
)
ON CONFLICT (user_task_id, due_date) DO NOTHING;

-- Step 5: Verify migration results
-- Check how many templates were created
SELECT 'Task Templates Created' as metric, COUNT(*) as count FROM task_templates
UNION ALL
SELECT 'User Tasks Created', COUNT(*) FROM user_tasks
UNION ALL
SELECT 'Task Instances Migrated', COUNT(*) FROM task_instances_v2;

-- Step 6: Show sample of migrated data
SELECT 
  'Sample Migrated Data' as info,
  tt.name as template_name,
  tt.category,
  tt.base_frequency_days,
  tt.importance_level,
  COUNT(ut.id) as user_count,
  COUNT(ti.id) as instance_count
FROM task_templates tt
LEFT JOIN user_tasks ut ON tt.id = ut.template_id
LEFT JOIN task_instances_v2 ti ON ut.id = ti.user_task_id
GROUP BY tt.id, tt.name, tt.category, tt.base_frequency_days, tt.importance_level
ORDER BY tt.category, tt.name
LIMIT 10; 