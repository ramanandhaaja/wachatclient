/*
  Warnings:

  - You are about to drop the column `location` on the `NameCard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NameCard" DROP COLUMN "location",
ADD COLUMN     "address1" TEXT,
ADD COLUMN     "address2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "postcode" TEXT;
