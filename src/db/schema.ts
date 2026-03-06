import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 1. Core Users and Profiles (Auth.js & Gamification)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  hashedPassword: text("hashedPassword"),
});

export const userProfiles = sqliteTable("userProfiles", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  coins: integer("coins").notNull().default(0),
});

// 2. Dictionaries (Rooms and Tools)
export const rooms = sqliteTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"), // e.g., 'Sofa', 'Bath' (Lucide icon names or emojis)
});

export const tools = sqliteTable("tools", {
  id: text("id").primaryKey(),
  nameEn: text("nameEn").notNull(),
  nameEs: text("nameEs").notNull(),
  category: text("category").notNull(),
  rarity: text("rarity").notNull().default("common"),
  durabilityMax: integer("durabilityMax").notNull().default(100),
  durabilityLossPerUse: integer("durabilityLossPerUse").notNull().default(1),
  stats: text("stats", { mode: "json" }), // e.g., { cleaning_power: 3, versatility: 4 }
});

// 3. The Blueprint: Task Templates & Gamification rules
export const taskTemplates = sqliteTable("taskTemplates", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roomId: text("roomId")
    .notNull()
    .references(() => rooms.id),
  title: text("title").notNull(),
  description: text("description"),
  
  // Gamification Base
  importanceLevel: integer("importanceLevel").notNull().default(3),
  expReward: integer("expReward").notNull().default(10),
  healthImpact: text("healthImpact"),
  scientificSource: text("scientificSource"),
  aiExplanation: text("aiExplanation"),
  
  // Recurrence (The DNA)
  rrule: text("rrule").notNull(), // e.g., FREQ=DAILY;INTERVAL=1
  startDate: integer("startDate", { mode: "timestamp_ms" }).notNull(),
  endDate: integer("endDate", { mode: "timestamp_ms" }),
});

// 4. Subtasks Blueprint
export const taskSubtemplates = sqliteTable("taskSubtemplates", {
  id: text("id").primaryKey(),
  templateId: text("templateId")
    .notNull()
    .references(() => taskTemplates.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  estimatedMinutes: integer("estimatedMinutes").notNull().default(5),
  orderIndex: integer("orderIndex").notNull().default(0),
  isRequired: integer("isRequired", { mode: "boolean" }).notNull().default(true),
  expReward: integer("expReward").notNull().default(5),
  difficulty: text("difficulty").notNull().default("easy"), // easy, medium, hard
});

// 5. M2M Junction for Required Tools
export const taskTemplateTools = sqliteTable("taskTemplateTools", {
  templateId: text("templateId")
    .notNull()
    .references(() => taskTemplates.id, { onDelete: "cascade" }),
  toolId: text("toolId")
    .notNull()
    .references(() => tools.id, { onDelete: "cascade" }),
  durabilityLossOverride: integer("durabilityLossOverride"), 
});

// 6. The Execution: Instances mapped to Specific Days
export const taskInstances = sqliteTable("taskInstances", {
  id: text("id").primaryKey(),
  templateId: text("templateId")
    .notNull()
    .references(() => taskTemplates.id, { onDelete: "cascade" }),
  dueDate: text("dueDate").notNull(), // Exact target bucket, format YYYY-MM-DD
  status: text("status", { enum: ["completed", "skipped"] }).notNull(),
  completedAt: integer("completedAt", { mode: "timestamp_ms" }).notNull(),
});

// 7. Subtask Instances (Checking off the steps on a given day)
export const subtaskInstances = sqliteTable("subtaskInstances", {
  id: text("id").primaryKey(),
  instanceId: text("instanceId")
    .notNull()
    .references(() => taskInstances.id, { onDelete: "cascade" }),
  subtemplateId: text("subtemplateId")
    .notNull()
    .references(() => taskSubtemplates.id, { onDelete: "cascade" }),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
});
