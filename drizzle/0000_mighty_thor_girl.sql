CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text
);
--> statement-breakpoint
CREATE TABLE `subtaskInstances` (
	`id` text PRIMARY KEY NOT NULL,
	`instanceId` text NOT NULL,
	`subtemplateId` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`instanceId`) REFERENCES `taskInstances`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subtemplateId`) REFERENCES `taskSubtemplates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taskInstances` (
	`id` text PRIMARY KEY NOT NULL,
	`templateId` text NOT NULL,
	`dueDate` text NOT NULL,
	`status` text NOT NULL,
	`completedAt` integer NOT NULL,
	FOREIGN KEY (`templateId`) REFERENCES `taskTemplates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taskSubtemplates` (
	`id` text PRIMARY KEY NOT NULL,
	`templateId` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`estimatedMinutes` integer DEFAULT 5 NOT NULL,
	`orderIndex` integer DEFAULT 0 NOT NULL,
	`isRequired` integer DEFAULT true NOT NULL,
	`expReward` integer DEFAULT 5 NOT NULL,
	`difficulty` text DEFAULT 'easy' NOT NULL,
	FOREIGN KEY (`templateId`) REFERENCES `taskTemplates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taskTemplateTools` (
	`templateId` text NOT NULL,
	`toolId` text NOT NULL,
	`durabilityLossOverride` integer,
	FOREIGN KEY (`templateId`) REFERENCES `taskTemplates`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`toolId`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taskTemplates` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`roomId` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`importanceLevel` integer DEFAULT 3 NOT NULL,
	`expReward` integer DEFAULT 10 NOT NULL,
	`healthImpact` text,
	`scientificSource` text,
	`aiExplanation` text,
	`rrule` text NOT NULL,
	`startDate` integer NOT NULL,
	`endDate` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tools` (
	`id` text PRIMARY KEY NOT NULL,
	`nameEn` text NOT NULL,
	`nameEs` text NOT NULL,
	`category` text NOT NULL,
	`rarity` text DEFAULT 'common' NOT NULL,
	`durabilityMax` integer DEFAULT 100 NOT NULL,
	`durabilityLossPerUse` integer DEFAULT 1 NOT NULL,
	`stats` text
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`userId` text PRIMARY KEY NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text,
	`hashedPassword` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);