-- AlterTable
ALTER TABLE "NameCard" ADD COLUMN     "aiChatAgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiVoiceCallAgent" BOOLEAN NOT NULL DEFAULT false;
