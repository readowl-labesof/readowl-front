/*
  Warnings:

  - You are about to drop the column `ipHash` on the `ChapterView` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `ChapterView` table. All the data in the column will be lost.
  - Made the column `userId` on table `ChapterView` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ChapterView" DROP CONSTRAINT "ChapterView_userId_fkey";

-- DropIndex
DROP INDEX "public"."ChapterView_chapterId_ipHash_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."ChapterView" DROP COLUMN "ipHash",
DROP COLUMN "userAgent",
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ChapterView" ADD CONSTRAINT "ChapterView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
