/*
  Warnings:

  - You are about to drop the column `country` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `issuedAt` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "country",
DROP COLUMN "issuedAt";
