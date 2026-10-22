import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, primaryKey, index, check, uniqueIndex, foreignKey } from "drizzle-orm/sqlite-core";

// Households manage membership separately from personal progress and tasks.
export const households = sqliteTable("households", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("ownerId").notNull().references(() => users.id, { onDelete: "restrict" }),
  createdAt: integer("createdAt").notNull(),
}, table => [index("households_owner_idx").on(table.ownerId), check("household_name_length", sql`length(trim(${table.name})) BETWEEN 1 AND 80`)]);

export const householdMembers = sqliteTable("householdMembers", {
  householdId: text("householdId").notNull().references(() => households.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: integer("joinedAt").notNull(),
}, table => [primaryKey({ columns: [table.householdId, table.userId] }), index("household_members_user_idx").on(table.userId)]);

export const householdPreferences = sqliteTable("householdPreferences", {
  userId: text("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  householdId: text("householdId").notNull(),
}, table => [foreignKey({columns:[table.householdId,table.userId],foreignColumns:[householdMembers.householdId,householdMembers.userId]}).onDelete("cascade")]);

export const householdInvitations = sqliteTable("householdInvitations", {
  id: text("id").primaryKey(),
  householdId: text("householdId").notNull().references(() => households.id, { onDelete: "cascade" }),
  invitedBy: text("invitedBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  tokenHash: text("tokenHash").notNull().unique(),
  createdAt: integer("createdAt").notNull(), expiresAt: integer("expiresAt").notNull(),
  revokedAt: integer("revokedAt"), acceptedAt: integer("acceptedAt"),
  acceptedBy: text("acceptedBy").references(() => users.id, { onDelete: "set null" }),
  acceptanceId: text("acceptanceId"),
}, table => [index("household_invites_household_idx").on(table.householdId, table.expiresAt),check("household_invitation_expiry",sql`${table.expiresAt}>${table.createdAt}`)]);

// 1. Core Users and Profiles (Auth.js & Gamification)
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  hashedPassword: text("hashedPassword"),
  sessionVersion: integer("sessionVersion").notNull().default(0),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => [
    primaryKey({ columns: [vt.identifier, vt.token] }),
  ]
);

export const userProfiles = sqliteTable("userProfiles", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  currentStreak: integer("currentStreak").notNull().default(0),
  maxStreak: integer("maxStreak").notNull().default(0),
  lastActivityDate: text("lastActivityDate"), // YYYY-MM-DD
  timezone: text("timezone").notNull().default("UTC"),
  resting: integer("resting", { mode: "boolean" }).notNull().default(false),
  restStartedAt: integer("restStartedAt"),
});

// Activity Log for XP and Coins (The Paper Trail)
export const activityLog = sqliteTable("activityLog", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'xp_gain', 'coin_gain', 'item_purchase', 'task_completion'
  amount: integer("amount").notNull(),
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

// 2. Dictionaries (Rooms and Tools)
export const rooms = sqliteTable("rooms", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => users.id, { onDelete: "cascade" }), // Null for global default rooms
  name: text("name").notNull(),
  icon: text("icon"), // e.g., 'Sofa', 'Bath'
  isCustom: integer("isCustom", { mode: "boolean" }).default(false),
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

// Consumables and items
export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  nameEn: text("nameEn").notNull(),
  nameEs: text("nameEs").notNull(),
  type: text("type").notNull(), // 'detergent', 'wax', 'scent'
  effect: text("effect", { mode: "json" }), // e.g., { bonus_xp: 0.1, durability_shield: 0.2 }
  price: integer("price").notNull().default(50),
  rarity: text("rarity", { enum: ["common", "rare", "epic", "legendary"] }).notNull().default("common"),
  isPurchasable: integer("isPurchasable", { mode: "boolean" }).notNull().default(true),
  unlockLevel: integer("unlockLevel").notNull().default(1),
});

// User Inventory: Tools (with durability)
export const userTools = sqliteTable("userTools", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  toolId: text("toolId")
    .notNull()
    .references(() => tools.id),
  currentDurability: integer("currentDurability").notNull(),
  isEquipped: integer("isEquipped", { mode: "boolean" }).default(false),
  acquiredAt: integer("acquiredAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

// User Inventory: Consumables
export const userInventory = sqliteTable("userInventory", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemId: text("itemId")
    .notNull()
    .references(() => items.id),
  quantity: integer("quantity").notNull().default(1),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
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
  nextOccurrence: integer("nextOccurrence", { mode: "timestamp_ms" }), // Cached for lightning fast queries

  // Archiving (Soft delete for history retention)
  isArchived: integer("isArchived", { mode: "boolean" }).notNull().default(false),
}, (table) => ({
  nextOccurrenceIdx: index("task_templates_next_occurrence_idx").on(table.nextOccurrence),
  userIdArchivedIdx: index("task_templates_user_archived_idx").on(table.userId, table.isArchived),
}));

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
export const taskInstances = sqliteTable(
  "taskInstances",
  {
    id: text("id").primaryKey(),
    templateId: text("templateId")
      .notNull()
      .references(() => taskTemplates.id, { onDelete: "cascade" }),
    dueDate: text("dueDate").notNull(), // Exact target bucket, format YYYY-MM-DD
    status: text("status", { enum: ["pending", "completed", "skipped"] })
      .notNull()
      .default("pending"),
    completedAt: integer("completedAt", { mode: "timestamp_ms" }),
  },
  (table) => ({
    occurrenceUnique: uniqueIndex("task_occurrence_unique").on(table.templateId,table.dueDate),
    dueDateIdx: index("task_instances_due_date_idx").on(table.dueDate),
    statusIdx: index("task_instances_status_idx").on(table.status),
    templateIdx: index("task_instances_template_idx").on(table.templateId),
  })
);

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

// 8. Kingdom System (User Placements)
export const userPlacements = sqliteTable("userPlacements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemId: text("itemId")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  roomId: text("roomId")
    .references(() => rooms.id, { onDelete: "set null" }), // Optional boundary
  positionX: integer("positionX").notNull(),
  positionY: integer("positionY").notNull(),
  placedAt: integer("placedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

// 9. Achievements System
export const badges = sqliteTable("badges", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requirementType: text("requirementType").notNull(), // e.g., 'tasks_completed', 'coins_earned'
  requirementValue: integer("requirementValue").notNull(),
});

export const userBadges = sqliteTable("userBadges", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  badgeId: text("badgeId")
    .notNull()
    .references(() => badges.id, { onDelete: "cascade" }),
  unlockedAt: integer("unlockedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  primaryKey({ columns: [table.userId, table.badgeId] })
]);

// 10. Weekly Activity
export const weeklyActivity = sqliteTable("weeklyActivity", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dayOfWeek: text("dayOfWeek").notNull(), // e.g., 'Mon', 'Tue'
  score: integer("score").notNull().default(0),
  date: text("date").notNull(), // YYYY-MM-DD
});

// 11. Rewards Store
export const rewardsStore = sqliteTable("rewardsStore", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  cost: integer("cost").notNull(),
  icon: text("icon"), // e.g., 'Gamepad2'
  color: text("color"), // e.g., 'text-blue-500'
  bg: text("bg"), // e.g., 'bg-blue-50'
  isPurchasable: integer("isPurchasable", { mode: "boolean" }).notNull().default(true),
});

export const userRewards = sqliteTable("userRewards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rewardId: text("rewardId")
    .notNull()
    .references(() => rewardsStore.id, { onDelete: "cascade" }),
  purchasedAt: integer("purchasedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

// 12. Home Assessments (Onboarding data)
export const homeAssessments = sqliteTable("homeAssessments", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  homeType: text("homeType"),
  lifestyle: text("lifestyle"),
  cleaningPreferences: integer("cleaningPreferences"),
  pets: text("pets"),
  children: text("children"),
  allergies: text("allergies"),
  rooms: text("rooms", { mode: "json" }),
  updatedAt: text("updatedAt"), // ISO String
});

export const kingdomState = sqliteTable("kingdomState", {
  userId: text("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(0),
});
export const kingdomBuildings = sqliteTable("kingdomBuildings", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  level: integer("level").notNull().default(1),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  restoredAt: integer("restoredAt").notNull(),
}, table => [uniqueIndex("kingdom_kind_unique").on(table.userId,table.kind)]);
export const kingdomRoomLinks = sqliteTable("kingdomRoomLinks", {
  roomId: text("roomId").primaryKey().references(() => rooms.id, { onDelete: "cascade" }),
  buildingId: text("buildingId").notNull().references(() => kingdomBuildings.id, { onDelete: "cascade" }),
});
export const rewardEvents = sqliteTable("rewardEvents", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: text("templateId").references(() => taskTemplates.id),
  dueDate: text("dueDate"),
  activityDate: text("activityDate").notNull(),
  xp: integer("xp").notNull(),
  coins: integer("coins").notNull(),
  createdAt: integer("createdAt").notNull(),
}, table => [index("reward_events_user_day").on(table.userId,table.activityDate)]);

// 13. Kingdom Buildings
export const buildings = sqliteTable("buildings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type", { enum: ['TAVERN', 'TOWER', 'WELL', 'ENTRANCE'] }).notNull(),
  name: text("name").notNull(),
  level: integer("level").notNull().default(1),
  slotIndex: integer("slotIndex").notNull().default(0),
  corruptionLevel: integer("corruptionLevel").notNull().default(0), // 0-100
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const passwordResetTokens = sqliteTable("passwordResetTokens", {
  tokenHash: text("tokenHash").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires").notNull(),
}, table => [index("password_reset_user").on(table.userId)]);
export const usageCounters = sqliteTable("usageCounters", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  ceiling: integer("ceiling").notNull(),
  expires: integer("expires").notNull(),
}, table => [index("usage_expiry").on(table.expires),check("usage_limit",sql`${table.count} <= ${table.ceiling}`)]);

// Shared work is separate from legacy personal templates; no implicit data migration.
export const householdWorkState = sqliteTable('householdWorkState', {
  householdId: text('householdId').primaryKey().references(()=>households.id,{onDelete:'cascade'}),
  version: integer('version').notNull().default(0),
  resources: integer('resources').notNull().default(0),
  timezone: text('timezone').notNull().default('UTC'),
  planToken: text('planToken'),
});
export const householdRooms = sqliteTable('householdRooms', {
  id: text('id').primaryKey(), householdId: text('householdId').notNull().references(()=>households.id,{onDelete:'cascade'}),
  name: text('name').notNull(), kind: text('kind').notNull().default('general'),
},t=>[uniqueIndex('household_room_scope').on(t.id,t.householdId),uniqueIndex('household_room_name').on(t.householdId,t.name)]);
export const householdTasks = sqliteTable('householdTasks', {
  id: text('id').primaryKey(),householdId:text('householdId').notNull().references(()=>households.id,{onDelete:'cascade'}),
  roomId:text('roomId').notNull(),title:text('title').notNull(),description:text('description'),
  minutes:integer('minutes').notNull(),rrule:text('rrule').notNull(),startDate:integer('startDate').notNull(),endDate:integer('endDate'),
  assigneeId:text('assigneeId').references(()=>users.id,{onDelete:'set null'}),archived:integer('archived',{mode:'boolean'}).notNull().default(false),
  createdAt:integer('createdAt').notNull(),
},t=>[uniqueIndex('household_task_scope').on(t.id,t.householdId),index('household_tasks_household').on(t.householdId,t.archived),foreignKey({columns:[t.roomId,t.householdId],foreignColumns:[householdRooms.id,householdRooms.householdId]}),check('shared_task_minutes',sql`${t.minutes} BETWEEN 1 AND 120`)]);
export const householdOccurrences=sqliteTable('householdOccurrences',{
  taskId:text('taskId').notNull(),householdId:text('householdId').notNull(),dueDate:text('dueDate').notNull(),
  assigneeId:text('assigneeId').references(()=>users.id,{onDelete:'set null'}),completedAt:integer('completedAt'),
},t=>[primaryKey({columns:[t.taskId,t.dueDate]}),foreignKey({columns:[t.taskId,t.householdId],foreignColumns:[householdTasks.id,householdTasks.householdId]}),index('household_occurrence_day').on(t.householdId,t.dueDate)]);
export const householdAvailability=sqliteTable('householdAvailability',{
  householdId:text('householdId').notNull(),userId:text('userId').notNull(),days:integer('days').notNull().default(127),
  dailyMinutes:integer('dailyMinutes').notNull().default(0),resting:integer('resting',{mode:'boolean'}).notNull().default(false),
},t=>[primaryKey({columns:[t.householdId,t.userId]}),foreignKey({columns:[t.householdId,t.userId],foreignColumns:[householdMembers.householdId,householdMembers.userId]}).onDelete('cascade'),check('availability_days',sql`${t.days} BETWEEN 0 AND 127`),check('availability_minutes',sql`${t.dailyMinutes} BETWEEN 0 AND 240`)]);
export const householdCompletions=sqliteTable('householdCompletions',{
  taskId:text('taskId').notNull(),householdId:text('householdId').notNull(),dueDate:text('dueDate').notNull(),
  userId:text('userId').references(()=>users.id,{onDelete:'set null'}),name:text('name').notNull(),title:text('title').notNull(),minutes:integer('minutes').notNull(),
  xp:integer('xp').notNull(),coins:integer('coins').notNull(),activityDate:text('activityDate').notNull(),createdAt:integer('createdAt').notNull(),
},t=>[primaryKey({columns:[t.taskId,t.dueDate]}),foreignKey({columns:[t.taskId,t.householdId],foreignColumns:[householdTasks.id,householdTasks.householdId]}),index('household_completion_day').on(t.householdId,t.activityDate)]);
export const householdTaskRequests=sqliteTable('householdTaskRequests',{
  id:text('id').primaryKey(),taskId:text('taskId').notNull(),householdId:text('householdId').notNull(),dueDate:text('dueDate').notNull(),
  fromUserId:text('fromUserId').references(()=>users.id,{onDelete:'set null'}),toUserId:text('toUserId').references(()=>users.id,{onDelete:'set null'}),
  status:text('status').notNull().default('pending'),createdAt:integer('createdAt').notNull(),expiresAt:integer('expiresAt').notNull(),
},t=>[foreignKey({columns:[t.taskId,t.householdId],foreignColumns:[householdTasks.id,householdTasks.householdId]}),index('household_request_scope').on(t.householdId,t.status),uniqueIndex('one_pending_handoff').on(t.taskId,t.dueDate).where(sql`${t.status}='pending'`)]);
