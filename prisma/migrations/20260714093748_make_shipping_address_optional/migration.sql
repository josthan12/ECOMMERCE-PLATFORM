-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "shippingBlock" DROP NOT NULL,
ALTER COLUMN "shippingStreet" DROP NOT NULL,
ALTER COLUMN "shippingPostalCode" DROP NOT NULL;
