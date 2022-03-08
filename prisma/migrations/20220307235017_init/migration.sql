-- CreateEnum
CREATE TYPE "AuditEvent" AS ENUM ('INVITE_CHECK_START', 'INVITE_CHECK_FINISH', 'GUILD_CREATE', 'GUILD_DELETE');

-- CreateTable
CREATE TABLE "audit" (
    "id" SERIAL NOT NULL,
    "event" "AuditEvent" NOT NULL,
    "metadata" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite" (
    "guildId" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isPermanent" BOOLEAN,
    "isValid" BOOLEAN,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "setting" (
    "guildId" BIGINT NOT NULL,
    "checkChannelId" BIGINT,
    "categoryChannelIds" BIGINT[],
    "ignoreChannelIds" BIGINT[],
    "checkEmbedColor" INTEGER NOT NULL DEFAULT 16316671,
    "lastInviteCheckAt" TIMESTAMP(3),
    "inCheck" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setting_pkey" PRIMARY KEY ("guildId")
);

-- CreateIndex
CREATE UNIQUE INDEX "audit_id_key" ON "audit"("id");

-- CreateIndex
CREATE UNIQUE INDEX "invite_guildId_code_key" ON "invite"("guildId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "setting_guildId_key" ON "setting"("guildId");
