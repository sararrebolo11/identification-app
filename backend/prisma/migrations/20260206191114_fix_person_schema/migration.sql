/*
  Warnings:

  - The values [AGENT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `expiresAt` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `issuingAuthority` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "expiresAt",
DROP COLUMN "issuingAuthority",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ALTER COLUMN "role" SET DEFAULT 'USER';
