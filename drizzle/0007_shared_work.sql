CREATE TABLE `householdAvailability` (
	`householdId` text NOT NULL,
	`userId` text NOT NULL,
	`days` integer DEFAULT 127 NOT NULL,
	`dailyMinutes` integer DEFAULT 0 NOT NULL,
	`resting` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`householdId`, `userId`),
	FOREIGN KEY (`householdId`,`userId`) REFERENCES `householdMembers`(`householdId`,`userId`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "availability_days" CHECK("householdAvailability"."days" BETWEEN 0 AND 127),
	CONSTRAINT "availability_minutes" CHECK("householdAvailability"."dailyMinutes" BETWEEN 0 AND 240)
);
--> statement-breakpoint
CREATE TABLE `householdCompletions` (
	`taskId` text NOT NULL,
	`householdId` text NOT NULL,
	`dueDate` text NOT NULL,
	`userId` text,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`minutes` integer NOT NULL,
	`xp` integer NOT NULL,
	`coins` integer NOT NULL,
	`activityDate` text NOT NULL,
	`createdAt` integer NOT NULL,
	PRIMARY KEY(`taskId`, `dueDate`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`taskId`,`householdId`) REFERENCES `householdTasks`(`id`,`householdId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `household_completion_day` ON `householdCompletions` (`householdId`,`activityDate`);--> statement-breakpoint
CREATE TABLE `householdOccurrences` (
	`taskId` text NOT NULL,
	`householdId` text NOT NULL,
	`dueDate` text NOT NULL,
	`assigneeId` text,
	`completedAt` integer,
	PRIMARY KEY(`taskId`, `dueDate`),
	FOREIGN KEY (`assigneeId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`taskId`,`householdId`) REFERENCES `householdTasks`(`id`,`householdId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `household_occurrence_day` ON `householdOccurrences` (`householdId`,`dueDate`);--> statement-breakpoint
CREATE TABLE `householdRooms` (
	`id` text PRIMARY KEY NOT NULL,
	`householdId` text NOT NULL,
	`name` text NOT NULL,
	`kind` text DEFAULT 'general' NOT NULL,
	FOREIGN KEY (`householdId`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `household_room_scope` ON `householdRooms` (`id`,`householdId`);--> statement-breakpoint
CREATE UNIQUE INDEX `household_room_name` ON `householdRooms` (`householdId`,`name`);--> statement-breakpoint
CREATE TABLE `householdTaskRequests` (
	`id` text PRIMARY KEY NOT NULL,
	`taskId` text NOT NULL,
	`householdId` text NOT NULL,
	`dueDate` text NOT NULL,
	`fromUserId` text,
	`toUserId` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	FOREIGN KEY (`fromUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`toUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`taskId`,`householdId`) REFERENCES `householdTasks`(`id`,`householdId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `household_request_scope` ON `householdTaskRequests` (`householdId`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `one_pending_handoff` ON `householdTaskRequests` (`taskId`,`dueDate`) WHERE "householdTaskRequests"."status"='pending';--> statement-breakpoint
CREATE TABLE `householdTasks` (
	`id` text PRIMARY KEY NOT NULL,
	`householdId` text NOT NULL,
	`roomId` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`minutes` integer NOT NULL,
	`rrule` text NOT NULL,
	`startDate` integer NOT NULL,
	`endDate` integer,
	`assigneeId` text,
	`archived` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`householdId`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigneeId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`roomId`,`householdId`) REFERENCES `householdRooms`(`id`,`householdId`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "shared_task_minutes" CHECK("householdTasks"."minutes" BETWEEN 1 AND 120)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `household_task_scope` ON `householdTasks` (`id`,`householdId`);--> statement-breakpoint
CREATE INDEX `household_tasks_household` ON `householdTasks` (`householdId`,`archived`);--> statement-breakpoint
CREATE TABLE `householdWorkState` (
	`householdId` text PRIMARY KEY NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`resources` integer DEFAULT 0 NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`planToken` text,
	FOREIGN KEY (`householdId`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint
INSERT INTO householdWorkState(householdId) SELECT id FROM households;
CREATE TRIGGER shared_work_init AFTER INSERT ON households BEGIN
 INSERT INTO householdWorkState(householdId) VALUES(NEW.id);
END;
CREATE TRIGGER shared_member_leave BEFORE DELETE ON householdMembers BEGIN
 UPDATE householdTasks SET assigneeId=NULL WHERE householdId=OLD.householdId AND assigneeId=OLD.userId;
 UPDATE householdOccurrences SET assigneeId=NULL WHERE householdId=OLD.householdId AND assigneeId=OLD.userId AND completedAt IS NULL;
 UPDATE householdTaskRequests SET status='cancelled' WHERE householdId=OLD.householdId AND status='pending' AND (fromUserId=OLD.userId OR toUserId=OLD.userId);
END;
CREATE TRIGGER shared_task_member_insert BEFORE INSERT ON householdTasks WHEN NEW.assigneeId IS NOT NULL BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM householdMembers WHERE householdId=NEW.householdId AND userId=NEW.assigneeId) THEN RAISE(ABORT,'invalid_assignee') END;
END;
CREATE TRIGGER shared_task_member_update BEFORE UPDATE OF assigneeId ON householdTasks WHEN NEW.assigneeId IS NOT NULL BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM householdMembers WHERE householdId=NEW.householdId AND userId=NEW.assigneeId) THEN RAISE(ABORT,'invalid_assignee') END;
END;
CREATE TRIGGER shared_occurrence_member_insert BEFORE INSERT ON householdOccurrences WHEN NEW.assigneeId IS NOT NULL BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM householdMembers WHERE householdId=NEW.householdId AND userId=NEW.assigneeId) THEN RAISE(ABORT,'invalid_assignee') END;
END;
CREATE TRIGGER shared_occurrence_member_update BEFORE UPDATE OF assigneeId ON householdOccurrences WHEN NEW.assigneeId IS NOT NULL AND NEW.completedAt IS NULL BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM householdMembers WHERE householdId=NEW.householdId AND userId=NEW.assigneeId) THEN RAISE(ABORT,'invalid_assignee') END;
END;
CREATE TRIGGER shared_occurrence_locked BEFORE UPDATE ON householdOccurrences WHEN OLD.completedAt IS NOT NULL AND (NEW.completedAt IS NOT OLD.completedAt OR NEW.dueDate!=OLD.dueDate OR NEW.taskId!=OLD.taskId) BEGIN
 SELECT RAISE(ABORT,'shared_occurrence_locked');
END;
CREATE TRIGGER shared_occurrence_requests AFTER UPDATE OF assigneeId,completedAt ON householdOccurrences BEGIN
 UPDATE householdTaskRequests SET status='cancelled' WHERE taskId=NEW.taskId AND dueDate=NEW.dueDate AND status='pending';
END;
CREATE TRIGGER shared_completion_validate BEFORE INSERT ON householdCompletions BEGIN
 SELECT CASE WHEN NEW.userId IS NULL OR NOT EXISTS(SELECT 1 FROM householdMembers WHERE householdId=NEW.householdId AND userId=NEW.userId)
 OR NOT EXISTS(SELECT 1 FROM householdTasks t LEFT JOIN householdOccurrences o ON o.taskId=t.id AND o.dueDate=NEW.dueDate
 WHERE t.id=NEW.taskId AND t.householdId=NEW.householdId AND t.archived=0 AND o.completedAt IS NULL
 AND (CASE WHEN o.taskId IS NOT NULL THEN o.assigneeId ELSE t.assigneeId END IS NULL OR CASE WHEN o.taskId IS NOT NULL THEN o.assigneeId ELSE t.assigneeId END=NEW.userId))
 THEN RAISE(ABORT,'shared_completion_not_allowed') END;
END;
CREATE TRIGGER shared_completion_reward AFTER INSERT ON householdCompletions BEGIN
 INSERT OR IGNORE INTO userProfiles(userId) VALUES(NEW.userId);
 INSERT INTO rewardEvents(id,userId,activityDate,xp,coins,createdAt) VALUES('household:'||NEW.taskId||':'||NEW.dueDate,NEW.userId,NEW.activityDate,NEW.xp,NEW.coins,NEW.createdAt);
 UPDATE userProfiles SET xp=xp+NEW.xp,level=1+(xp+NEW.xp)/100,coins=coins+NEW.coins,
 currentStreak=CASE WHEN lastActivityDate=NEW.activityDate THEN currentStreak WHEN lastActivityDate=date(NEW.activityDate,'-1 day') OR resting=1 THEN currentStreak+1 ELSE 1 END,
 maxStreak=MAX(maxStreak,CASE WHEN lastActivityDate=NEW.activityDate THEN currentStreak WHEN lastActivityDate=date(NEW.activityDate,'-1 day') OR resting=1 THEN currentStreak+1 ELSE 1 END),lastActivityDate=NEW.activityDate WHERE userId=NEW.userId;
 INSERT INTO activityLog(id,userId,type,amount,description,createdAt) VALUES('household:'||NEW.taskId||':'||NEW.dueDate,NEW.userId,'task_completion',NEW.xp,NEW.title,NEW.createdAt);
 INSERT INTO activityLog(id,userId,type,amount,description,createdAt) VALUES('household:'||NEW.taskId||':'||NEW.dueDate||':coins',NEW.userId,'coin_gain',NEW.coins,'Shared cleaning reward',NEW.createdAt);
 INSERT INTO householdOccurrences(taskId,householdId,dueDate,assigneeId,completedAt) VALUES(NEW.taskId,NEW.householdId,NEW.dueDate,NEW.userId,NEW.createdAt)
 ON CONFLICT(taskId,dueDate) DO UPDATE SET completedAt=NEW.createdAt,assigneeId=NEW.userId;
 UPDATE householdWorkState SET resources=resources+1,version=version+1 WHERE householdId=NEW.householdId;
END;
CREATE TRIGGER shared_handoff_validate BEFORE UPDATE OF status ON householdTaskRequests WHEN NEW.status='accepted' BEGIN
 SELECT CASE WHEN OLD.status!='pending' OR OLD.expiresAt<=CAST(strftime('%s','now') AS INTEGER)*1000
 OR NOT EXISTS(SELECT 1 FROM householdMembers WHERE householdId=NEW.householdId AND userId=NEW.toUserId)
 OR NOT EXISTS(SELECT 1 FROM householdMembers WHERE householdId=NEW.householdId AND userId=NEW.fromUserId)
 OR NOT EXISTS(SELECT 1 FROM householdTasks t LEFT JOIN householdOccurrences o ON o.taskId=t.id AND o.dueDate=NEW.dueDate
 WHERE t.id=NEW.taskId AND t.archived=0 AND o.completedAt IS NULL AND CASE WHEN o.taskId IS NOT NULL THEN o.assigneeId ELSE t.assigneeId END=NEW.fromUserId)
 THEN RAISE(ABORT,'stale_handoff') END;
END;
CREATE TRIGGER shared_handoff_accept AFTER UPDATE OF status ON householdTaskRequests WHEN NEW.status='accepted' BEGIN
 INSERT INTO householdOccurrences(taskId,householdId,dueDate,assigneeId) VALUES(NEW.taskId,NEW.householdId,NEW.dueDate,NEW.toUserId)
 ON CONFLICT(taskId,dueDate) DO UPDATE SET assigneeId=NEW.toUserId WHERE completedAt IS NULL;
END;

CREATE TRIGGER revision_householdRooms_insert AFTER INSERT ON householdRooms BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=NEW.householdId; END;

CREATE TRIGGER revision_householdRooms_update AFTER UPDATE ON householdRooms BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=NEW.householdId; END;

CREATE TRIGGER revision_householdTasks_insert AFTER INSERT ON householdTasks BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=NEW.householdId; END;

CREATE TRIGGER revision_householdTasks_update AFTER UPDATE ON householdTasks BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=NEW.householdId; END;

CREATE TRIGGER revision_householdAvailability_insert AFTER INSERT ON householdAvailability BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=NEW.householdId; END;

CREATE TRIGGER revision_householdAvailability_update AFTER UPDATE ON householdAvailability BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=NEW.householdId; END;

CREATE TRIGGER revision_householdAvailability_delete AFTER DELETE ON householdAvailability BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=OLD.householdId; END;

CREATE TRIGGER revision_householdOccurrences_insert AFTER INSERT ON householdOccurrences BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=NEW.householdId; END;

CREATE TRIGGER revision_householdOccurrences_update AFTER UPDATE ON householdOccurrences BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=NEW.householdId; END;

CREATE TRIGGER revision_householdMembers_insert AFTER INSERT ON householdMembers BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=NEW.householdId; END;

CREATE TRIGGER revision_householdMembers_delete AFTER DELETE ON householdMembers BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=OLD.householdId; END;

CREATE TRIGGER revision_householdTaskRequests_insert AFTER INSERT ON householdTaskRequests BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=NEW.householdId; END;

CREATE TRIGGER revision_householdTaskRequests_update AFTER UPDATE ON householdTaskRequests BEGIN UPDATE householdWorkState SET version=version+1 WHERE householdId=NEW.householdId; END;
--> statement-breakpoint
CREATE TRIGGER shared_archive_requests AFTER UPDATE OF archived ON householdTasks
WHEN NEW.archived=1 AND OLD.archived=0 BEGIN
  UPDATE householdTaskRequests SET status='cancelled' WHERE taskId=NEW.id AND status='pending';
END;
