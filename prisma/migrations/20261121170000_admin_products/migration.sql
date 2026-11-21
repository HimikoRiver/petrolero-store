ALTER TABLE "user" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'CUSTOMER';

CREATE TABLE "product" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "packaging" TEXT NOT NULL,
  "image" TEXT,
  "galleryImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "priceKopecks" INTEGER,
  "stockQuantity" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT FALSE,
  "archivedAt" TIMESTAMP(3),
  "viscosity" TEXT,
  "volumeLiters" DOUBLE PRECISION,
  "acea" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "api" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "approvals" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "ilsac" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");
CREATE UNIQUE INDEX "product_sku_key" ON "product"("sku");
CREATE INDEX "product_published_archivedAt_createdAt_idx"
  ON "product"("published", "archivedAt", "createdAt");
