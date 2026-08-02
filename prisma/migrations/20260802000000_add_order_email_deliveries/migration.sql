-- CreateEnum
CREATE TYPE "OrderEmailType" AS ENUM ('CONFIRMATION', 'PAYMENT_FAILED');

-- CreateEnum
CREATE TYPE "OrderEmailDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "OrderEmailDelivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "OrderEmailType" NOT NULL,
    "email" TEXT NOT NULL,
    "status" "OrderEmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "resendEmailId" TEXT,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderEmailDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderEmailDelivery_orderId_type_key" ON "OrderEmailDelivery"("orderId", "type");

-- CreateIndex
CREATE INDEX "OrderEmailDelivery_status_createdAt_idx" ON "OrderEmailDelivery"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "OrderEmailDelivery" ADD CONSTRAINT "OrderEmailDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
