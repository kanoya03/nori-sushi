/*
  Warnings:

  - You are about to drop the `TelegramVerificationCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropTable
DROP TABLE "TelegramVerificationCode";

-- CreateTable
CREATE TABLE "TelegramAuthSession" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "telegramId" TEXT,
    "code" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramAuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramAuthSession_token_key" ON "TelegramAuthSession"("token");
