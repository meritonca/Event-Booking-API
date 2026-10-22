-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "expiresAt" TIMESTAMP(3);
