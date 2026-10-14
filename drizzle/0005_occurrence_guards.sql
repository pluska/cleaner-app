-- Reward records remain immutable; old toggle and concurrent move requests cannot undo completion.
CREATE TRIGGER occurrence_locked BEFORE UPDATE OF status,dueDate ON taskInstances
WHEN (OLD.status='completed' AND (NEW.status!=OLD.status OR NEW.dueDate!=OLD.dueDate))
 OR (OLD.status='skipped' AND NEW.status='skipped')
BEGIN
 SELECT RAISE(ABORT,'occurrence_locked');
END;

CREATE TRIGGER reward_ownership BEFORE INSERT ON rewardEvents WHEN NEW.templateId IS NOT NULL
BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM taskTemplates WHERE id=NEW.templateId AND userId=NEW.userId AND isArchived=0)
 OR EXISTS(SELECT 1 FROM taskInstances WHERE templateId=NEW.templateId AND dueDate=NEW.dueDate AND status='skipped')
 THEN RAISE(ABORT,'occurrence_locked') END;
END;
