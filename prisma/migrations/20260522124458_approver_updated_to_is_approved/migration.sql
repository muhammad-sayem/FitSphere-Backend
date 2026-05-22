/*
  Warnings:

  - You are about to drop the column `approved` on the `trainer_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "trainer_profiles" DROP COLUMN "approved",
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;
