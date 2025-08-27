-- =====================================================
-- CLEANER PLANNER - DATA CLEANUP SCRIPT
-- Safely removes data while preserving database structure
-- =====================================================

-- ⚠️ WARNING: This script will DELETE ALL DATA from application tables
-- It will NOT delete your database schema, functions, or structure
-- Run this in your Supabase SQL Editor

-- Step 1: Disable triggers temporarily to avoid cascade issues
SET session_replication_role = replica;

-- Step 2: Clean up user-generated data (preserve templates and structure)
-- Start with dependent tables first (child tables)

-- Clean task instance data
DELETE FROM task_instance_subtasks;
DELETE FROM task_instance_overrides;
DELETE FROM task_modification_history;
DELETE FROM task_instances;

-- Clean user-specific data
DELETE FROM user_tasks;
DELETE FROM user_achievements;
DELETE FROM user_statistics;
DELETE FROM user_tools;
DELETE FROM home_areas;
DELETE FROM home_assessments;

-- Clean user profiles (but keep auth.users intact)
DELETE FROM user_profiles;

-- Step 3: Re-enable triggers
SET session_replication_role = DEFAULT;

-- Step 4: Reset auto-increment sequences (if any exist)
-- Note: Most tables use UUIDs, but reset any integer sequences if they exist
DO $$
DECLARE
    seq_name text;
BEGIN
    -- Find and reset any sequences
    FOR seq_name IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RESTART WITH 1';
    END LOOP;
END $$;

-- Step 5: Verify cleanup
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as remaining_records
FROM user_profiles
UNION ALL
SELECT 
    'user_tasks' as table_name,
    COUNT(*) as remaining_records
FROM user_tasks
UNION ALL
SELECT 
    'task_instances' as table_name,
    COUNT(*) as remaining_records
FROM task_instances
UNION ALL
SELECT 
    'user_tools' as table_name,
    COUNT(*) as remaining_records
FROM user_tools
UNION ALL
SELECT 
    'home_areas' as table_name,
    COUNT(*) as remaining_records
FROM home_areas
UNION ALL
SELECT 
    'user_achievements' as table_name,
    COUNT(*) as remaining_records
FROM user_achievements
UNION ALL
SELECT 
    'user_statistics' as table_name,
    COUNT(*) as remaining_records
FROM user_statistics;

-- Step 6: Verify structure is intact
SELECT 
    'task_templates' as table_name,
    COUNT(*) as template_count
FROM task_templates
UNION ALL
SELECT 
    'task_subtasks' as table_name,
    COUNT(*) as subtask_count
FROM task_subtasks;

-- Step 7: Show what was preserved
SELECT 
    '✅ PRESERVED: Database schema and structure' as status
UNION ALL
SELECT 
    '✅ PRESERVED: Task templates and subtasks' as status
UNION ALL
SELECT 
    '✅ PRESERVED: Functions, triggers, and policies' as status
UNION ALL
SELECT 
    '✅ PRESERVED: User authentication (auth.users)' as status
UNION ALL
SELECT 
    '✅ PRESERVED: All RLS policies and security' as status
UNION ALL
SELECT 
    '✅ PRESERVED: Database indexes and performance' as status;

-- Step 8: Show what was cleaned
SELECT 
    '🧹 CLEANED: All user profiles and progress' as status
UNION ALL
SELECT 
    '🧹 CLEANED: All user tasks and instances' as status
UNION ALL
SELECT 
    '🧹 CLEANED: All user tools and inventory' as status
UNION ALL
SELECT 
    '🧹 CLEANED: All home areas and assessments' as status
UNION ALL
SELECT 
    '🧹 CLEANED: All achievements and statistics' as status;

-- =====================================================
-- SUMMARY
-- =====================================================
-- This script has safely cleaned all user data while preserving:
-- 1. Database schema and structure
-- 2. Task templates and subtasks (your core business logic)
-- 3. All functions, triggers, and RLS policies
-- 4. User authentication system
-- 5. Performance indexes and optimizations
--
-- Your database is now clean and ready for fresh data!
-- =====================================================
