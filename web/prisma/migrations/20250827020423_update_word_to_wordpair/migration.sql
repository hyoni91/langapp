/*
  Warnings:

  - You are about to drop the column `lang` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `meaning` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `surface` on the `Word` table. All the data in the column will be lost.
  - Added the required column `jaSurface` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `koSurface` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Word_lang_surface_idx";

-- AlterTable
ALTER TABLE "public"."Word" DROP COLUMN "lang",
DROP COLUMN "meaning",
DROP COLUMN "surface",
ADD COLUMN     "jaSurface" TEXT NOT NULL,
ADD COLUMN     "koSurface" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Word_jaSurface_idx" ON "public"."Word"("jaSurface");

-- CreateIndex
CREATE INDEX "Word_koSurface_idx" ON "public"."Word"("koSurface");
