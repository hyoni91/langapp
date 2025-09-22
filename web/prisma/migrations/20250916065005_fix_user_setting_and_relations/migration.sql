/*
  Warnings:

  - You are about to drop the `ReminderSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ReminderSetting" DROP CONSTRAINT "ReminderSetting_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Word" DROP CONSTRAINT "Word_userId_fkey";

-- DropTable
DROP TABLE "public"."ReminderSetting";

-- CreateTable
CREATE TABLE "public"."TimeLimitSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minutesPerSession" INTEGER NOT NULL DEFAULT 20,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeLimitSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimeLimitSetting_userId_key" ON "public"."TimeLimitSetting"("userId");

-- CreateIndex
CREATE INDEX "TimeLimitSetting_userId_idx" ON "public"."TimeLimitSetting"("userId");

-- AddForeignKey
ALTER TABLE "public"."Word" ADD CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimeLimitSetting" ADD CONSTRAINT "TimeLimitSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
