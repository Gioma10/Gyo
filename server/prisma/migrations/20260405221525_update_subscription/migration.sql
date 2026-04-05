/*
  Warnings:

  - You are about to drop the column `renewDate` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Recurrence" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL');

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "renewDate",
ADD COLUMN     "recurrence" "Recurrence" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
