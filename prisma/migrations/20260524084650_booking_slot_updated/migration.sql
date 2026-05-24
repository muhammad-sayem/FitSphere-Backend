/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `booking_slots` table. All the data in the column will be lost.
  - Added the required column `feeAmount` to the `booking_slots` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booking_slots" DROP COLUMN "totalAmount",
ADD COLUMN     "feeAmount" DOUBLE PRECISION NOT NULL;
