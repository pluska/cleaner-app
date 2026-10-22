CREATE TABLE `householdInvitations` (
	`id` text PRIMARY KEY NOT NULL,
	`householdId` text NOT NULL,
	`invitedBy` text NOT NULL,
	`email` text NOT NULL,
	`tokenHash` text NOT NULL,
	`createdAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`revokedAt` integer,
	`acceptedAt` integer,
	`acceptedBy` text,
	`acceptanceId` text,
	FOREIGN KEY (`householdId`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invitedBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`acceptedBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "household_invitation_expiry" CHECK("householdInvitations"."expiresAt">"householdInvitations"."createdAt")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `householdInvitations_tokenHash_unique` ON `householdInvitations` (`tokenHash`);--> statement-breakpoint
CREATE INDEX `household_invites_household_idx` ON `householdInvitations` (`householdId`,`expiresAt`);--> statement-breakpoint
CREATE TABLE `householdMembers` (
	`householdId` text NOT NULL,
	`userId` text NOT NULL,
	`joinedAt` integer NOT NULL,
	PRIMARY KEY(`householdId`, `userId`),
	FOREIGN KEY (`householdId`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `household_members_user_idx` ON `householdMembers` (`userId`);--> statement-breakpoint
CREATE TABLE `householdPreferences` (
	`userId` text PRIMARY KEY NOT NULL,
	`householdId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`householdId`,`userId`) REFERENCES `householdMembers`(`householdId`,`userId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `households` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`ownerId` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "household_name_length" CHECK(length(trim("households"."name")) BETWEEN 1 AND 80)
);
--> statement-breakpoint
CREATE INDEX `households_owner_idx` ON `households` (`ownerId`);
--> statement-breakpoint
CREATE TRIGGER household_owner_membership AFTER INSERT ON households
BEGIN
  INSERT INTO householdMembers(householdId,userId,joinedAt) VALUES(NEW.id,NEW.ownerId,NEW.createdAt);
END;
--> statement-breakpoint
CREATE TRIGGER household_keep_owner BEFORE DELETE ON householdMembers
WHEN EXISTS(SELECT 1 FROM households WHERE id=OLD.householdId AND ownerId=OLD.userId)
BEGIN
  SELECT RAISE(ABORT,'household_owner_cannot_leave');
END;
--> statement-breakpoint
CREATE TRIGGER household_transfer_member BEFORE UPDATE OF ownerId ON households
WHEN NOT EXISTS(SELECT 1 FROM householdMembers WHERE householdId=OLD.id AND userId=NEW.ownerId)
BEGIN
  SELECT RAISE(ABORT,'household_owner_must_be_member');
END;
--> statement-breakpoint
CREATE TRIGGER household_transfer_revoke AFTER UPDATE OF ownerId ON households
WHEN OLD.ownerId!=NEW.ownerId
BEGIN
  UPDATE householdInvitations SET revokedAt=CAST(strftime('%s','now') AS INTEGER)*1000
  WHERE householdId=NEW.id AND invitedBy!=NEW.ownerId AND acceptedAt IS NULL AND revokedAt IS NULL;
END;
