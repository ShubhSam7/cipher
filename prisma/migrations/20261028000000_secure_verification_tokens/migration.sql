-- Invalidate existing plaintext OTPs and previously verified signup grants.
DELETE FROM "verification_tokens";

ALTER TABLE "verification_tokens"
  ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastSentAt" TIMESTAMP(3) NOT NULL;
