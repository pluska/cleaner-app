# 🗄️ Database Migration Guide - Phase 1

## 📋 **Overview**

This guide explains how to migrate from the current database schema to the new optimized schema that supports AI-powered task management.

## 🎯 **Migration Goals**

1. **Optimize Storage**: Only create task instances when needed
2. **Enable AI Integration**: Prepare for AI-generated task templates
3. **Improve Performance**: Better indexing and query optimization
4. **Enhance User Experience**: Personalized task management

## 📊 **Schema Changes**

### **Before (Current Schema)**

```sql
tasks (many tasks per user)
├── task_instances (many instances per task)
└── Complex recurring logic
```

### **After (New Schema)**

```sql
task_templates (shared templates)
├── user_tasks (user's selected templates)
└── task_instances_v2 (created on-demand)
```

## 🚀 **Migration Steps**

### **Step 1: Backup Current Data**

```sql
-- Create backup of current data
CREATE TABLE tasks_backup AS SELECT * FROM tasks;
CREATE TABLE task_instances_backup AS SELECT * FROM task_instances;
```

### **Step 2: Apply New Schema**

```bash
# Run the new schema migration
psql -d your_database -f database_migration_v2.sql
```

### **Step 3: Migrate Existing Data**

```bash
# Run the data migration script
psql -d your_database -f migrate_existing_data.sql
```

### **Step 4: Verify Migration**

```sql
-- Check migration results
SELECT 'Task Templates Created' as metric, COUNT(*) as count FROM task_templates
UNION ALL
SELECT 'User Tasks Created', COUNT(*) FROM user_tasks
UNION ALL
SELECT 'Task Instances Migrated', COUNT(*) FROM task_instances_v2;
```

## 🔧 **Supabase Migration**

### **Option 1: SQL Editor**

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run `database_migration_v2.sql`
4. Run `migrate_existing_data.sql`
5. Verify results

### **Option 2: Migration Files**

1. Upload migration files to Supabase
2. Execute in order
3. Monitor for errors

## 📈 **Benefits of New Schema**

### **1. Storage Optimization**

- **Before**: 1000+ task instances per user
- **After**: Only active instances (10-50 per user)

### **2. Performance Improvement**

- **Before**: Complex recurring task logic
- **After**: Simple on-demand instance creation

### **3. AI Integration Ready**

- **Before**: Static task definitions
- **After**: Dynamic AI-generated templates

### **4. User Experience**

- **Before**: Overwhelming task lists
- **After**: Personalized, manageable tasks

## 🔍 **Verification Queries**

### **Check Task Templates**

```sql
SELECT
  name,
  category,
  base_frequency_days,
  importance_level,
  is_ai_generated
FROM task_templates
ORDER BY category, name;
```

### **Check User Tasks**

```sql
SELECT
  ut.user_id,
  tt.name as template_name,
  ut.custom_frequency_days,
  ut.is_active
FROM user_tasks ut
JOIN task_templates tt ON ut.template_id = tt.id
LIMIT 10;
```

### **Check Task Instances**

```sql
SELECT
  ti.due_date,
  ti.completed,
  tt.name as task_name,
  utv.display_name
FROM task_instances_v2 ti
JOIN user_task_view utv ON ti.user_task_id = utv.user_task_id
ORDER BY ti.due_date DESC
LIMIT 10;
```

## ⚠️ **Rollback Plan**

If migration fails, you can rollback:

```sql
-- Drop new tables
DROP TABLE IF EXISTS task_instances_v2 CASCADE;
DROP TABLE IF EXISTS user_tasks CASCADE;
DROP TABLE IF EXISTS task_templates CASCADE;
DROP TABLE IF EXISTS home_assessments CASCADE;

-- Restore from backup
INSERT INTO tasks SELECT * FROM tasks_backup;
INSERT INTO task_instances SELECT * FROM task_instances_backup;
```

## 🎯 **Next Steps After Migration**

### **1. Update Application Code**

- Update API endpoints to use new schema
- Modify components to use new types
- Test all functionality

### **2. Prepare for AI Integration**

- Set up OpenAI API integration
- Create interview flow components
- Implement AI task generation

### **3. User Onboarding**

- Create home assessment flow
- Implement task selection interface
- Add educational content

## 📞 **Support**

If you encounter issues during migration:

1. **Check Supabase Logs**: Monitor for errors
2. **Verify Data Integrity**: Run verification queries
3. **Rollback if Needed**: Use rollback plan
4. **Contact Support**: If issues persist

## ✅ **Migration Checklist**

- [ ] Backup current data
- [ ] Apply new schema (`database_migration_v2.sql`)
- [ ] Migrate existing data (`migrate_existing_data.sql`)
- [ ] Verify migration results
- [ ] Update application types
- [ ] Test functionality
- [ ] Monitor performance
- [ ] Plan AI integration

---

**Migration Status**: ✅ **Ready to Execute**

**Estimated Time**: 15-30 minutes

**Risk Level**: 🟡 **Medium** (Data migration involved)

**Backup Required**: ✅ **Yes**
