/*
  Warnings:

  - You are about to drop the column `hours` on the `BusinessInfo` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `BusinessInfo` table. All the data in the column will be lost.
  - You are about to drop the column `promos` on the `BusinessInfo` table. All the data in the column will be lost.
  - You are about to drop the column `services` on the `BusinessInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BusinessInfo" DROP COLUMN "hours",
DROP COLUMN "location",
DROP COLUMN "promos",
DROP COLUMN "services",
ADD COLUMN     "data" JSONB;
