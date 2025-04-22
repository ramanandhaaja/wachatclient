/*
  Warnings:

  - You are about to drop the column `name` on the `NameCard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NameCard" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;
