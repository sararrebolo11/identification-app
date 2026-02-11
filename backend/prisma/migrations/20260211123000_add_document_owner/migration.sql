/*
  Add ownerId to Document and align unique index with schema.
*/

-- 1) add column as nullable
ALTER TABLE "Document" ADD COLUMN "ownerId" TEXT;

-- 2) backfill from Person.ownerId
UPDATE "Document" d
SET "ownerId" = p."ownerId"
FROM "Person" p
WHERE d."personId" = p."id";

-- 3) make required
ALTER TABLE "Document" ALTER COLUMN "ownerId" SET NOT NULL;

-- 4) foreign key
ALTER TABLE "Document"
ADD CONSTRAINT "Document_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"(id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5) replace unique index (type, documentNumber) -> (ownerId, type, documentNumber)
DROP INDEX IF EXISTS "Document_type_documentNumber_key";
CREATE UNIQUE INDEX "Document_ownerId_type_documentNumber_key"
ON "Document"("ownerId", "type", "documentNumber");

-- 6) index on ownerId
CREATE INDEX "Document_ownerId_idx" ON "Document"("ownerId");
