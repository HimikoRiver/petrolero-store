-- Per-user product favorites; product identifiers reference the current catalog.
CREATE TABLE "favorite" (
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "favorite_pkey" PRIMARY KEY ("userId", "productId")
);
CREATE INDEX "favorite_userId_createdAt_idx" ON "favorite"("userId", "createdAt");
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
