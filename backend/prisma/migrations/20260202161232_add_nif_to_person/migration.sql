/*
  Warnings:

  - You are about to drop the column `parents` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "parents",
ADD COLUMN     "nif" TEXT;
