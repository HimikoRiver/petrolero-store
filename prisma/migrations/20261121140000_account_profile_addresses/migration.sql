-- Account profile: phone and shipping addresses belong to the authenticated user.
ALTER TABLE "user" ADD COLUMN "phone" TEXT;

CREATE TABLE "delivery_address" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "street" TEXT NOT NULL,
  "apartment" TEXT,
  "postalCode" TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "delivery_address_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "delivery_address_userId_createdAt_idx" ON "delivery_address"("userId", "createdAt");
CREATE UNIQUE INDEX "delivery_address_one_default_per_user_idx"
  ON "delivery_address" ("userId") WHERE "isDefault" = TRUE;
ALTER TABLE "delivery_address"
  ADD CONSTRAINT "delivery_address_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
