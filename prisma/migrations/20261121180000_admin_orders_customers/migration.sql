-- Internal-only notes and review state: demo orders are NEVER paid or fulfilled.
ALTER TABLE "user" ADD COLUMN "adminNote" TEXT;
ALTER TABLE "demo_order" ADD COLUMN "reviewStatus" TEXT NOT NULL DEFAULT 'NEW';
ALTER TABLE "demo_order" ADD COLUMN "staffNote" TEXT;
ALTER TABLE "demo_order" ADD COLUMN "reviewedAt" TIMESTAMP(3);
ALTER TABLE "demo_order" ADD COLUMN "reviewedById" TEXT;
CREATE INDEX "demo_order_reviewStatus_createdAt_idx" ON "demo_order" ("reviewStatus", "createdAt");
