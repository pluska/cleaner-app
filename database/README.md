# Database Scripts

This folder contains the essential SQL scripts for the Cleaner Planner database.

## 📁 **Essential Files for Deployment**

### **`database_migration_v3_gamification.sql`** ⭐ **MAIN MIGRATION**

- **Purpose**: Complete database schema with gamification, tools, and area health system
- **Type**: Destructive migration (drops everything and recreates)
- **Features**:
  - Gamification system (levels, XP, coins, gems)
  - Cleaning tools inventory with durability
  - Home areas with health tracking
  - Task templates with AI integration
  - Subtasks system with metadata
  - Calendar system with task modifications
  - Row Level Security (RLS) policies
  - Performance indexes
  - Audit trail for modifications

### **`verify_migration.sql`** ✅ **VERIFICATION**

- **Purpose**: Verify that migration was successful
- **Usage**: Run after applying `database_migration_v3_gamification.sql`
- **Output**: Shows ✅ for successful migration, ❌ for issues

### **`DATABASE_SETUP.md`** 📋 **SETUP GUIDE**

- **Purpose**: Step-by-step setup instructions for new installations
- **Usage**: Follow for fresh Supabase project setup

## 🚀 **Quick Deployment**

### **Fresh Installation:**

1. Create a new Supabase project
2. Run `database_migration_v3_gamification.sql` in Supabase SQL Editor
3. Run `verify_migration.sql` to confirm success
4. Follow `DATABASE_SETUP.md` for additional configuration

### **Production Deployment:**

1. **Backup existing data** (if any)
2. Run `database_migration_v3_gamification.sql` in Supabase SQL Editor
3. Run `verify_migration.sql` to confirm success
4. Update application environment variables

## 📊 **Schema Overview**

### **Core Tables:**

- `user_profiles` - User gamification data (level, XP, coins, gems)
- `user_tools` - Cleaning tools inventory with durability
- `home_areas` - Home areas with health tracking
- `task_templates` - AI-generated or predefined task templates
- `task_subtasks` - Detailed steps for each task with metadata
- `user_tasks` - User's personalized tasks from templates
- `task_instances` - On-demand task instances
- `task_instance_subtasks` - Tracking of subtask completion
- `task_instance_overrides` - Single instance modifications
- `task_modification_history` - Audit trail of changes
- `home_assessments` - Data for AI personalization
- `user_achievements` - Achievement tracking
- `user_statistics` - Daily statistics tracking

### **Views:**

- `user_task_view` - Combined user tasks with template data
- `task_instance_view` - Task instances with full details
- `task_subtask_view` - Subtasks with template information

### **Functions:**

- `award_experience()` - Award XP and level up users
- `generate_next_task_instance()` - Auto-generate next instance on completion
- `create_task_override()` - Create single instance modifications
- `modify_future_pattern()` - Change future task patterns
- `get_calendar_tasks_with_overrides()` - Calendar data with modifications

## 🔧 **Features**

### **Gamification:**

- ✅ Level system with XP progression
- ✅ Coins and gems economy
- ✅ Achievement system
- ✅ Streak tracking
- ✅ Statistics tracking

### **Tools System:**

- ✅ Cleaning tools inventory
- ✅ Durability tracking
- ✅ Usage statistics
- ✅ Maintenance scheduling

### **Area Health:**

- ✅ Home area tracking
- ✅ Health degradation
- ✅ Size and surface type tracking
- ✅ Special features support

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

- **v1**: Original schema (deleted)
- **v2**: Complete rewrite with subtasks and calendar system (deleted)
- **v3**: **CURRENT** - Gamification, tools, and area health system

## ⚠️ **Important**

- This is the **ONLY** migration script needed for deployment
- All previous versions have been removed to avoid confusion
- The migration includes all features: gamification, tools, area health, and task management
