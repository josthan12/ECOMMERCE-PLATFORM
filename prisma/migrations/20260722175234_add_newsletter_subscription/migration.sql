-- AlterTable
ALTER TABLE "User" ADD COLUMN     "newsletterSubscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "newsletterSubscribedAt" TIMESTAMP(3),
ADD COLUMN     "newsletterUnsubscribedAt" TIMESTAMP(3);
