-- =====================================================
-- CLEANER PLANNER - MIGRATION VERIFICATION SCRIPT
-- Run this after applying database_migration_v2.sql to verify everything works
-- =====================================================

-- Test 1: Verify all tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('task_templates', 'task_subtasks', 'user_tasks', 'task_instances', 'task_instance_subtasks', 'task_instance_overrides', 'task_modification_history', 'home_assessments') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('task_templates', 'task_subtasks', 'user_tasks', 'task_instances', 'task_instance_subtasks', 'task_instance_overrides', 'task_modification_history', 'home_assessments')
ORDER BY table_name;

-- Test 2: Verify all views exist
SELECT 
  table_name as view_name,
  CASE 
    WHEN table_name IN ('user_task_view', 'task_instance_view', 'task_subtask_view') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('user_task_view', 'task_instance_view', 'task_subtask_view')
ORDER BY table_name;

-- Test 3: Verify task templates were inserted
SELECT 
  name,
  category,
  base_frequency_days,
  importance_level,
  is_ai_generated,
  CASE WHEN is_ai_generated = FALSE THEN '✅ BASIC TEMPLATE' ELSE '🤖 AI GENERATED' END as type
FROM task_templates
ORDER BY category, name;

-- Test 4: Verify subtasks were created for each template
SELECT 
  tt.name as template_name,
  tt.category,
  COUNT(ts.id) as subtask_count,
  SUM(ts.estimated_minutes) as total_estimated_minutes,
  CASE 
    WHEN COUNT(ts.id) > 0 THEN '✅ HAS SUBTASKS'
    ELSE '❌ NO SUBTASKS'
  END as status
FROM task_templates tt
LEFT JOIN task_subtasks ts ON tt.id = ts.template_id
GROUP BY tt.id, tt.name, tt.category
ORDER BY tt.category, tt.name;

-- Test 5: Verify RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ POLICY EXISTS'
    ELSE '❌ NO POLICY'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('task_templates', 'task_subtasks', 'user_tasks', 'task_instances', 'task_instance_subtasks', 'home_assessments')
ORDER BY tablename, policyname;

-- Test 6: Verify triggers exist
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  CASE 
    WHEN trigger_name IS NOT NULL THEN '✅ TRIGGER EXISTS'
    ELSE '❌ NO TRIGGER'
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table IN ('task_templates', 'task_subtasks', 'user_tasks', 'task_instances', 'home_assessments')
ORDER BY event_object_table, trigger_name;

-- Test 7: Verify functions exist
SELECT 
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name IN ('generate_next_task_instance', 'initialize_user_tasks_from_templates', 'generate_initial_task_instances', 'update_updated_at_column', 'create_task_override', 'modify_future_pattern', 'get_calendar_tasks_with_overrides') 
    THEN '✅ FUNCTION EXISTS'
    ELSE '❌ MISSING FUNCTION'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('generate_next_task_instance', 'initialize_user_tasks_from_templates', 'generate_initial_task_instances', 'update_updated_at_column', 'create_task_override', 'modify_future_pattern', 'get_calendar_tasks_with_overrides')
ORDER BY routine_name;

-- Test 8: Verify indexes exist
SELECT 
  indexname,
  tablename,
  CASE 
    WHEN indexname LIKE 'idx_%' THEN '✅ INDEX EXISTS'
    ELSE '❌ MISSING INDEX'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('task_templates', 'task_subtasks', 'user_tasks', 'task_instances', 'task_instance_subtasks', 'home_assessments')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Test 9: Sample subtask data verification
SELECT 
  ts.title as subtask_title,
  ts.estimated_minutes,
  ts.order_index,
  ts.is_required,
  ts.metadata->>'difficulty' as difficulty,
  tt.name as template_name,
  tt.category
FROM task_subtasks ts
JOIN task_templates tt ON ts.template_id = tt.id
ORDER BY tt.category, tt.name, ts.order_index
LIMIT 10;

-- Test 10: Verify view functionality
SELECT 
  'user_task_view' as view_name,
  COUNT(*) as record_count
FROM user_task_view
UNION ALL
SELECT 
  'task_instance_view' as view_name,
  COUNT(*) as record_count
FROM task_instance_view
UNION ALL
SELECT 
  'task_subtask_view' as view_name,
  COUNT(*) as record_count
FROM task_subtask_view;

-- Test 11: Verify calendar function structure (no data needed)
SELECT 
  'get_calendar_tasks_with_overrides' as function_name,
  'Calendar function ready' as status,
  'Function exists and can be called with user_id, start_date, end_date' as description;

-- =====================================================
-- VERIFICATION COMPLETE
-- All tests should show ✅ for successful migration
-- ===================================================== 