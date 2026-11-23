-- Preserve accounts, session history and demo orders while supporting
-- reversible access restrictions. Admin accounts are never affected by API.
ALTER TABLE "user"
  ADD COLUMN "isBlocked" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN "blockedAt" TIMESTAMP(3),
  ADD COLUMN "blockedById" TEXT;
