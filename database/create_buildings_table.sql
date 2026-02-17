-- Safely ensure columns exist
DO $$
BEGIN
    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'updated_at') THEN
        ALTER TABLE buildings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add slot_index if missing (just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'slot_index') THEN
        ALTER TABLE buildings ADD COLUMN slot_index INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add corruption_level if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'corruption_level') THEN
        ALTER TABLE buildings ADD COLUMN corruption_level INTEGER DEFAULT 0;
    END IF;
END $$;

-- Drop trigger first to avoid conflicts
DROP TRIGGER IF EXISTS update_buildings_updated_at ON buildings;

-- Re-create Updated_at Trigger
CREATE TRIGGER update_buildings_updated_at
  BEFORE UPDATE ON buildings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure Permissions (Idempotent)
GRANT ALL ON TABLE buildings TO authenticated;
GRANT ALL ON TABLE buildings TO service_role;
