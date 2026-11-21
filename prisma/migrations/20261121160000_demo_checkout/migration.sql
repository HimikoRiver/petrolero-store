-- Demonstration checkout: isolated from any live fulfillment or payments.
CREATE TABLE "demo_order" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "street" TEXT NOT NULL,
  "apartment" TEXT,
  "postalCode" TEXT,
  "note" TEXT,
  "subtotalKopecks" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "demo_order_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "demo_order_item" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "image" TEXT,
  "quantity" INTEGER NOT NULL,
  "unitPriceKopecks" INTEGER NOT NULL,
  "lineTotalKopecks" INTEGER NOT NULL,
  CONSTRAINT "demo_order_item_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "demo_order_reference_key" ON "demo_order"("reference");
CREATE INDEX "demo_order_userId_createdAt_idx" ON "demo_order"("userId", "createdAt");
CREATE INDEX "demo_order_item_orderId_idx" ON "demo_order_item"("orderId");
ALTER TABLE "demo_order" ADD CONSTRAINT "demo_order_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "demo_order_item" ADD CONSTRAINT "demo_order_item_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "demo_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
