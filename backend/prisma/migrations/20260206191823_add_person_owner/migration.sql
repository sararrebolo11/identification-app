/*
  Warnings:

  - Added the required column `ownerId` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- 1. adicionar a coluna como opcional
ALTER TABLE "Person" ADD COLUMN "ownerId" TEXT;

-- 2. atribuir todas as pessoas existentes ao admin
UPDATE "Person"
SET "ownerId" = 'a02364f5-a6cf-4b8a-85ea-9ea17c2f6298';

-- 3. tornar a coluna obrigatória
ALTER TABLE "Person"
ALTER COLUMN "ownerId" SET NOT NULL;

-- 4. criar a foreign key
ALTER TABLE "Person"
ADD CONSTRAINT "Person_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"(id)
ON DELETE CASCADE ON UPDATE CASCADE;
