/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `Word` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,jaSurface]` on the table `Word` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,koSurface]` on the table `Word` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."WordStatus" AS ENUM ('draft', 'published');

-- DropIndex
DROP INDEX "public"."Word_jaSurface_idx";

-- DropIndex
DROP INDEX "public"."Word_koSurface_idx";

-- AlterTable
ALTER TABLE "public"."Word" ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "status" "public"."WordStatus" NOT NULL DEFAULT 'draft',
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "contentType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_storagePath_key" ON "public"."Image"("storagePath");

-- CreateIndex
CREATE INDEX "User_firebaseUid_idx" ON "public"."User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "Word_imageId_key" ON "public"."Word"("imageId");

-- CreateIndex
CREATE INDEX "Word_userId_status_createdAt_idx" ON "public"."Word"("userId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Word_userId_jaSurface_key" ON "public"."Word"("userId", "jaSurface");

-- CreateIndex
CREATE UNIQUE INDEX "Word_userId_koSurface_key" ON "public"."Word"("userId", "koSurface");

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Word" ADD CONSTRAINT "Word_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Word" ADD CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
