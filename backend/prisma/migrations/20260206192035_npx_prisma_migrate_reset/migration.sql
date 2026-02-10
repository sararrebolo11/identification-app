-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
