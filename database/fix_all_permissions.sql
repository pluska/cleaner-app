-- Fix all permissions for AI task creation
-- This script grants all necessary permissions to anon and authenticated roles

-- Grant permissions to task_templates table
GRANT ALL PRIVILEGES ON task_templates TO anon;
GRANT ALL PRIVILEGES ON task_templates TO authenticated;

-- Grant permissions to task_subtasks table
GRANT ALL PRIVILEGES ON task_subtasks TO anon;
GRANT ALL PRIVILEGES ON task_subtasks TO authenticated;

-- Grant permissions to user_tasks table
GRANT ALL PRIVILEGES ON user_tasks TO anon;
GRANT ALL PRIVILEGES ON user_tasks TO authenticated;

-- Grant permissions to home_assessments table
GRANT ALL PRIVILEGES ON home_assessments TO anon;
GRANT ALL PRIVILEGES ON home_assessments TO authenticated;

-- Grant permissions to task_instances table
GRANT ALL PRIVILEGES ON task_instances TO anon;
GRANT ALL PRIVILEGES ON task_instances TO authenticated;

-- Grant sequence permissions (if sequences exist)
DO $$
BEGIN
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
    
    -- home_assessments sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'home_assessments_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE home_assessments_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE home_assessments_id_seq TO authenticated;
    END IF;
    
    -- task_instances sequence
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'task_instances_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE task_instances_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE task_instances_id_seq TO authenticated;
    END IF;
END $$;

-- Refresh schema cache
SELECT pg_notify('schema_refresh', 'task_templates');
SELECT pg_notify('schema_refresh', 'task_subtasks');
SELECT pg_notify('schema_refresh', 'user_tasks');
SELECT pg_notify('schema_refresh', 'home_assessments');
SELECT pg_notify('schema_refresh', 'task_instances'); 