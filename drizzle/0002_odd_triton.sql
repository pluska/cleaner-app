CREATE TABLE `badges` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`requirementType` text NOT NULL,
	`requirementValue` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `buildings` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`slotIndex` integer DEFAULT 0 NOT NULL,
	`corruptionLevel` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `homeAssessments` (
	`userId` text PRIMARY KEY NOT NULL,
	`homeType` text,
	`lifestyle` text,
	`cleaningPreferences` integer,
	`pets` text,
	`children` text,
	`allergies` text,
	`rooms` text,
	`updatedAt` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `kingdomBuildings` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`kind` text NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`restoredAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `kingdomRoomLinks` (
	`roomId` text PRIMARY KEY NOT NULL,
	`buildingId` text NOT NULL,
	FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`buildingId`) REFERENCES `kingdomBuildings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `kingdomState` (
	`userId` text PRIMARY KEY NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rewardEvents` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`templateId` text,
	`dueDate` text,
	`activityDate` text NOT NULL,
	`xp` integer NOT NULL,
	`coins` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`templateId`) REFERENCES `taskTemplates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rewardsStore` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`cost` integer NOT NULL,
	`icon` text,
	`color` text,
	`bg` text,
	`isPurchasable` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `userBadges` (
	`userId` text NOT NULL,
	`badgeId` text NOT NULL,
	`unlockedAt` integer NOT NULL,
	PRIMARY KEY(`userId`, `badgeId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`badgeId`) REFERENCES `badges`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userPlacements` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`itemId` text NOT NULL,
	`roomId` text,
	`positionX` integer NOT NULL,
	`positionY` integer NOT NULL,
	`placedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `userRewards` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`rewardId` text NOT NULL,
	`purchasedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rewardId`) REFERENCES `rewardsStore`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `weeklyActivity` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`dayOfWeek` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `items` ADD `rarity` text DEFAULT 'common' NOT NULL;--> statement-breakpoint
ALTER TABLE `items` ADD `isPurchasable` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `items` ADD `unlockLevel` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `userProfiles` ADD `timezone` text DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE `userProfiles` ADD `resting` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `userProfiles` ADD `restStartedAt` integer;