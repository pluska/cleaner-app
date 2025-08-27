-- =====================================================
-- CLEANER PLANNER - SELECTIVE DATA CLEANUP
-- Remove specific data types while preserving others
-- =====================================================

-- Choose which cleanup operations you want to perform
-- Uncomment the sections you need

-- =====================================================
-- OPTION 1: Clean only test/development data
-- =====================================================
-- Remove data older than a certain date (useful for dev environments)
/*
DELETE FROM task_instances 
WHERE created_at < NOW() - INTERVAL '7 days';

DELETE FROM user_tasks 
WHERE created_at < NOW() - INTERVAL '7 days';

DELETE FROM user_profiles 
WHERE created_at < NOW() - INTERVAL '7 days';
*/

-- =====================================================
-- OPTION 2: Clean specific user data only
-- =====================================================
-- Replace 'user_email@example.com' with the actual email
/*
DELETE FROM task_instance_subtasks 
WHERE task_instance_id IN (
    SELECT ti.id FROM task_instances ti
    JOIN user_tasks ut ON ti.user_task_id = ut.id
    JOIN user_profiles up ON ut.user_id = up.user_id
    WHERE up.username = 'user_email@example.com'
);

DELETE FROM task_instances 
WHERE user_task_id IN (
    SELECT ut.id FROM user_tasks ut
    JOIN user_profiles up ON ut.user_id = up.user_id
    WHERE up.username = 'user_email@example.com'
);

DELETE FROM user_tasks 
WHERE user_id IN (
    SELECT up.user_id FROM user_profiles up
    WHERE up.username = 'user_email@example.com'
);

DELETE FROM user_profiles 
WHERE username = 'user_email@example.com';
*/

-- =====================================================
-- OPTION 3: Clean corrupted or invalid data
-- =====================================================
-- Remove tasks without proper templates
/*
DELETE FROM user_tasks 
WHERE template_id NOT IN (SELECT id FROM task_templates);

DELETE FROM task_instances 
WHERE user_task_id NOT IN (SELECT id FROM user_tasks);
*/

-- Remove orphaned subtasks
/*
DELETE FROM task_instance_subtasks 
WHERE task_instance_id NOT IN (SELECT id FROM task_instances);
*/

-- =====================================================
-- OPTION 4: Clean performance-impacting data
-- =====================================================
-- Remove old task modification history (keep last 30 days)
/*
DELETE FROM task_modification_history 
WHERE modified_at < NOW() - INTERVAL '30 days';
*/

-- Remove old statistics (keep last 90 days)
/*
DELETE FROM user_statistics 
WHERE date < CURRENT_DATE - INTERVAL '90 days';
*/

-- =====================================================
-- OPTION 5: Clean specific categories
-- =====================================================
-- Remove tasks from specific categories
/*
DELETE FROM user_tasks 
WHERE id IN (
    SELECT ut.id FROM user_tasks ut
    JOIN task_templates tt ON ut.template_id = tt.id
    WHERE tt.category = 'kitchen'  -- Change category as needed
);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Check what data remains after cleanup
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as record_count
FROM user_profiles
UNION ALL
SELECT 
    'user_tasks' as table_name,
    COUNT(*) as record_count
FROM user_tasks
UNION ALL
SELECT 
    'task_instances' as table_name,
    COUNT(*) as record_count
FROM task_instances
UNION ALL
SELECT 
    'task_instance_subtasks' as table_name,
    COUNT(*) as record_count
FROM task_instance_subtasks;

-- Check for orphaned records
SELECT 
    'Orphaned task instances' as issue,
    COUNT(*) as count
FROM task_instances ti
LEFT JOIN user_tasks ut ON ti.user_task_id = ut.id
WHERE ut.id IS NULL
UNION ALL
SELECT 
    'Orphaned subtasks' as issue,
    COUNT(*) as count
FROM task_instance_subtasks tis
LEFT JOIN task_instances ti ON tis.task_instance_id = ti.id
WHERE ti.id IS NULL;

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================
-- 1. Review the options above
-- 2. Uncomment the sections you want to run
-- 3. Modify any parameters (dates, emails, categories)
-- 4. Run in Supabase SQL Editor
-- 5. Use verification queries to confirm results
-- =====================================================
