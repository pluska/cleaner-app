ALTER TABLE users ADD COLUMN sessionVersion INTEGER NOT NULL DEFAULT 0;
CREATE TABLE passwordResetTokens (
 tokenHash TEXT PRIMARY KEY NOT NULL,
 userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires INTEGER NOT NULL
);
CREATE INDEX password_reset_user ON passwordResetTokens(userId);
CREATE TRIGGER password_reset_invalidate AFTER UPDATE OF hashedPassword ON users
WHEN NEW.hashedPassword IS NOT OLD.hashedPassword
BEGIN
 UPDATE users SET sessionVersion=sessionVersion+1 WHERE id=NEW.id;
 DELETE FROM passwordResetTokens WHERE userId=NEW.id;
 DELETE FROM verificationTokens WHERE identifier=NEW.email;
 DELETE FROM sessions WHERE userId=NEW.id;
END;
CREATE TABLE usageCounters (
 key TEXT PRIMARY KEY NOT NULL,
 count INTEGER NOT NULL,
 ceiling INTEGER NOT NULL,
 expires INTEGER NOT NULL,
 CONSTRAINT usage_limit CHECK(count <= ceiling)
);
CREATE INDEX usage_expiry ON usageCounters(expires);
-- Old reset links were stored and logged in plaintext. Invalidate them at rollout.
DELETE FROM verificationTokens;
