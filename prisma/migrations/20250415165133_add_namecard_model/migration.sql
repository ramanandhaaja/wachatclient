-- CreateTable
CREATE TABLE "NameCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "location" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "profileImage" TEXT,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NameCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NameCard_userId_idx" ON "NameCard"("userId");

-- AddForeignKey
ALTER TABLE "NameCard" ADD CONSTRAINT "NameCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
