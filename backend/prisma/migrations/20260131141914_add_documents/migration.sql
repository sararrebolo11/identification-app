/*
  Warnings:

  - The values [CC] on the enum `DocumentType` will be removed. If these variants are still used in the database, this will fail.
  - The values [VIEWER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `drivingLicenseNumber` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `issueDate` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `issuingCountry` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `nif` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `ocrConfidence` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `rawOcrJson` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `residenceTitleNumber` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[type,documentNumber]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `country` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issuedAt` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Made the column `documentNumber` on table `Document` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocumentType_new" AS ENUM ('CARTAO_CIDADAO', 'CARTA_CONDUCAO', 'TITULO_RESIDENCIA', 'PASSAPORTE');
ALTER TABLE "Document" ALTER COLUMN "type" TYPE "DocumentType_new" USING ("type"::text::"DocumentType_new");
ALTER TYPE "DocumentType" RENAME TO "DocumentType_old";
ALTER TYPE "DocumentType_new" RENAME TO "DocumentType";
DROP TYPE "public"."DocumentType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'AGENT');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'AGENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropIndex
DROP INDEX "Document_drivingLicenseNumber_idx";

-- DropIndex
DROP INDEX "Document_nif_idx";

-- DropIndex
DROP INDEX "Document_residenceTitleNumber_idx";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "drivingLicenseNumber",
DROP COLUMN "expiryDate",
DROP COLUMN "issueDate",
DROP COLUMN "issuingCountry",
DROP COLUMN "nif",
DROP COLUMN "ocrConfidence",
DROP COLUMN "rawOcrJson",
DROP COLUMN "residenceTitleNumber",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "issuedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "documentNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "AuditLog";

-- CreateIndex
CREATE UNIQUE INDEX "Document_type_documentNumber_key" ON "Document"("type", "documentNumber");
