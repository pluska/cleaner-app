# Database Scripts

This folder contains all SQL scripts for the Cleaner Planner database.

## 📁 Files Overview

### **Core Migration Scripts**

#### `database_migration_v2.sql` ⭐ **MAIN MIGRATION**

- **Purpose**: Complete database schema with subtasks and calendar system
- **Type**: Destructive migration (drops everything and recreates)
- **Features**:
  - Task templates with AI integration
  - Subtasks system with metadata
  - Calendar system with task modifications
  - Row Level Security (RLS) policies
  - Performance indexes
  - Audit trail for modifications

#### `database_schema.sql` 📋 **LEGACY**

- **Purpose**: Original database schema (deprecated)
- **Status**: Replaced by `database_migration_v2.sql`
- **Keep for**: Reference only

### **Migration Support Scripts**

#### `migrate_existing_data.sql` 🔄

- **Purpose**: Migrate data from old schema to new schema
- **Usage**: Only needed if migrating from old system
- **Status**: Not needed for fresh installations

#### `verify_migration.sql` ✅

- **Purpose**: Verify that migration was successful
- **Usage**: Run after applying `database_migration_v2.sql`
- **Output**: Shows ✅ for successful migration, ❌ for issues

### **Utility Scripts**

#### `view_task_data.sql` 👀

- **Purpose**: Sample queries to view task data
- **Usage**: For debugging and data inspection
- **Status**: Reference queries

## 🚀 **Quick Start**

### **Fresh Installation:**

1. Run `database_migration_v2.sql` in Supabase SQL Editor
2. Run `verify_migration.sql` to confirm success

### **Migration from Old System:**

1. Run `database_migration_v2.sql` in Supabase SQL Editor
2. Run `migrate_existing_data.sql` to transfer data
3. Run `verify_migration.sql` to confirm success

## 📊 **Schema Overview**

### **Core Tables:**

- `task_templates` - AI-generated or predefined task templates
- `task_subtasks` - Detailed steps for each task with metadata
- `user_tasks` - User's personalized tasks from templates
- `task_instances` - On-demand task instances
- `task_instance_subtasks` - Tracking of subtask completion
- `task_instance_overrides` - Single instance modifications
- `task_modification_history` - Audit trail of changes
- `home_assessments` - Data for AI personalization

### **Views:**

- `user_task_view` - Combined user tasks with template data
- `task_instance_view` - Task instances with full details
- `task_subtask_view` - Subtasks with template information

### **Functions:**

- `generate_next_task_instance()` - Auto-generate next instance on completion
- `create_task_override()` - Create single instance modifications
- `modify_future_pattern()` - Change future task patterns
- `get_calendar_tasks_with_overrides()` - Calendar data with modifications

## 🔧 **Features**

### **Task Management:**

- ✅ Template-based system
- ✅ On-demand instance creation
- ✅ Automatic repetition
- ✅ Subtasks with metadata
- ✅ Time estimation

### **Calendar System:**

- ✅ Dynamic task calculation
- ✅ Single instance overrides
- ✅ Pattern modifications
- ✅ Audit trail
- ✅ Performance optimized

### **Security:**

- ✅ Row Level Security (RLS)
- ✅ User isolation
- ✅ Admin-only template management

## 📝 **Notes**

- All scripts are designed for Supabase PostgreSQL
- The migration is destructive - backup if needed
- RLS policies ensure data security
- Indexes optimize query performance
- Functions handle complex business logic

## 🔄 **Version History**

- **v1**: Original schema (`database_schema.sql`)
- **v2**: Complete rewrite with subtasks and calendar system (`database_migration_v2.sql`)
