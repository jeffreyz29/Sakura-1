/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `invite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "invite_guildId_code_key";

-- AlterTable
ALTER TABLE "invite" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "invite_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "invite_id_key" ON "invite"("id");
