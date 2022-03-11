/*
  Warnings:

  - A unique constraint covering the columns `[guildId,code]` on the table `invite` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `code` on the `invite` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "invite" DROP COLUMN "code",
ADD COLUMN     "code" BYTEA NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "invite_guildId_code_key" ON "invite"("guildId", "code");
