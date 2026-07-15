-- CreateEnum
CREATE TYPE "FulfillmentMethod" AS ENUM ('DELIVERY', 'SELF_COLLECTION');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "fulfillmentMethod" "FulfillmentMethod" NOT NULL DEFAULT 'DELIVERY',
ADD COLUMN     "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "trackingNumber" TEXT;
