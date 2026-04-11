CREATE TABLE `accounts` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `activityLog` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`description` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`nameEn` text NOT NULL,
	`nameEs` text NOT NULL,
	`type` text NOT NULL,
	`effect` text,
	`price` integer DEFAULT 50 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userInventory` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`itemId` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `userTools` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`toolId` text NOT NULL,
	`currentDurability` integer NOT NULL,
	`isEquipped` integer DEFAULT false,
	`acquiredAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`toolId`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_taskInstances` (
	`id` text PRIMARY KEY NOT NULL,
	`templateId` text NOT NULL,
	`dueDate` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`completedAt` integer,
	FOREIGN KEY (`templateId`) REFERENCES `taskTemplates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_taskInstances`("id", "templateId", "dueDate", "status", "completedAt") SELECT "id", "templateId", "dueDate", "status", "completedAt" FROM `taskInstances`;--> statement-breakpoint
DROP TABLE `taskInstances`;--> statement-breakpoint
ALTER TABLE `__new_taskInstances` RENAME TO `taskInstances`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `task_instances_due_date_idx` ON `taskInstances` (`dueDate`);--> statement-breakpoint
CREATE INDEX `task_instances_status_idx` ON `taskInstances` (`status`);--> statement-breakpoint
CREATE INDEX `task_instances_template_idx` ON `taskInstances` (`templateId`);--> statement-breakpoint
ALTER TABLE `rooms` ADD `userId` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `rooms` ADD `isCustom` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `taskTemplates` ADD `nextOccurrence` integer;--> statement-breakpoint
ALTER TABLE `taskTemplates` ADD `isArchived` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `task_templates_next_occurrence_idx` ON `taskTemplates` (`nextOccurrence`);--> statement-breakpoint
CREATE INDEX `task_templates_user_archived_idx` ON `taskTemplates` (`userId`,`isArchived`);--> statement-breakpoint
ALTER TABLE `userProfiles` ADD `currentStreak` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `userProfiles` ADD `maxStreak` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `userProfiles` ADD `lastActivityDate` text;