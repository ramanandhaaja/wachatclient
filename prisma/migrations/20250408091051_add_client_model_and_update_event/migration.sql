/*
  Warnings:

  - You are about to drop the column `clientName` on the `Event` table. All the data in the column will be lost.
  - Added the required column `clientId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "clientName",
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "providerName" TEXT,
ADD COLUMN     "serviceType" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Client_phone_idx" ON "Client"("phone");

-- CreateIndex
CREATE INDEX "Event_clientId_idx" ON "Event"("clientId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
