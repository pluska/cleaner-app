-- Add missing columns to existing tables
-- This script adds columns that are needed by the AI task generation system

-- Add room_specific column to task_templates table
ALTER TABLE task_templates 
ADD COLUMN IF NOT EXISTS room_specific TEXT DEFAULT 'general';

-- Update existing records to have a default value
UPDATE task_templates SET room_specific = 'general' WHERE room_specific IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE task_templates ALTER COLUMN room_specific SET NOT NULL;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_task_templates_room_specific ON task_templates(room_specific);

-- Add language column to home_assessments if it doesn't exist
ALTER TABLE home_assessments 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es'));

-- Update existing records to have a default value
UPDATE home_assessments SET language = 'en' WHERE language IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE home_assessments ALTER COLUMN language SET NOT NULL;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_home_assessments_language ON home_assessments(language);

-- Verify the changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('task_templates', 'home_assessments')
AND column_name IN ('room_specific', 'language')
ORDER BY table_name, column_name;

-- Refresh the schema cache
SELECT pg_notify('schema_refresh', 'task_templates');
SELECT pg_notify('schema_refresh', 'home_assessments'); 