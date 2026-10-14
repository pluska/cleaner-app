-- Remap duplicate subtasks before enforcing one occurrence per task/day.
UPDATE subtaskInstances SET instanceId=(SELECT MIN(t.id) FROM taskInstances t JOIN taskInstances old ON old.templateId=t.templateId AND old.dueDate=t.dueDate WHERE old.id=subtaskInstances.instanceId);
UPDATE taskInstances SET status='completed' WHERE EXISTS (SELECT 1 FROM taskInstances t WHERE t.templateId=taskInstances.templateId AND t.dueDate=taskInstances.dueDate AND t.status='completed');
DELETE FROM taskInstances WHERE id NOT IN (SELECT MIN(id) FROM taskInstances GROUP BY templateId,dueDate);
CREATE UNIQUE INDEX task_occurrence_unique ON taskInstances(templateId,dueDate);
CREATE UNIQUE INDEX kingdom_kind_unique ON kingdomBuildings(userId,kind);
CREATE INDEX reward_events_user_day ON rewardEvents(userId,activityDate);

CREATE TRIGGER building_upgrade AFTER UPDATE OF level ON kingdomBuildings WHEN NEW.level>OLD.level
BEGIN
 SELECT CASE WHEN NEW.level!=OLD.level+1 OR NEW.level>3 OR NOT EXISTS(SELECT 1 FROM userProfiles WHERE userId=NEW.userId AND coins>=OLD.level*4) THEN RAISE(ABORT,'Invalid upgrade') END;
 UPDATE userProfiles SET coins=coins-OLD.level*4 WHERE userId=NEW.userId;
 INSERT INTO activityLog(id,userId,type,amount,description,createdAt) VALUES(NEW.id||':level:'||NEW.level,NEW.userId,'building_upgrade',-OLD.level*4,'Building upgrade',unixepoch()*1000);
END;

CREATE TRIGGER reward_completion AFTER INSERT ON rewardEvents WHEN NEW.templateId IS NOT NULL
BEGIN
  INSERT INTO taskInstances(id,templateId,dueDate,status,completedAt)
  VALUES(NEW.id,NEW.templateId,NEW.dueDate,'completed',NEW.createdAt)
  ON CONFLICT(templateId,dueDate) DO UPDATE SET status='completed',completedAt=NEW.createdAt;
  UPDATE userProfiles SET xp=xp+NEW.xp,level=1+(xp+NEW.xp)/100,coins=coins+NEW.coins,
    currentStreak=CASE WHEN lastActivityDate=NEW.activityDate THEN currentStreak WHEN lastActivityDate=date(NEW.activityDate,'-1 day') OR resting=1 THEN currentStreak+1 ELSE 1 END,
    maxStreak=MAX(maxStreak,CASE WHEN lastActivityDate=NEW.activityDate THEN currentStreak WHEN lastActivityDate=date(NEW.activityDate,'-1 day') OR resting=1 THEN currentStreak+1 ELSE 1 END),lastActivityDate=NEW.activityDate
    WHERE userId=NEW.userId;
  UPDATE kingdomBuildings SET restoredAt=NEW.createdAt WHERE userId=NEW.userId AND id IN
    (SELECT buildingId FROM kingdomRoomLinks WHERE roomId=(SELECT roomId FROM taskTemplates WHERE id=NEW.templateId));
  INSERT INTO activityLog(id,userId,type,amount,description,createdAt) VALUES(NEW.id,NEW.userId,'task_completion',NEW.xp,'Task completed',NEW.createdAt);
  INSERT INTO activityLog(id,userId,type,amount,description,createdAt) VALUES(NEW.id||':coins',NEW.userId,'coin_gain',NEW.coins,'Cleaning reward',NEW.createdAt);
END;

CREATE TRIGGER reward_purchase AFTER INSERT ON userRewards
BEGIN
  SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM userProfiles p JOIN rewardsStore r ON r.id=NEW.rewardId WHERE p.userId=NEW.userId AND r.isPurchasable=1 AND r.cost>=0 AND p.coins>=r.cost) THEN RAISE(ABORT,'Insufficient balance') END;
  UPDATE userProfiles SET coins=coins-(SELECT cost FROM rewardsStore WHERE id=NEW.rewardId) WHERE userId=NEW.userId;
  INSERT INTO activityLog(id,userId,type,amount,description,createdAt) SELECT NEW.id,NEW.userId,'item_purchase',-cost,'Reward purchase',NEW.purchasedAt FROM rewardsStore WHERE id=NEW.rewardId;
END;
