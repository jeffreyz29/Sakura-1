import Prisma from '@prisma/client'
import type { AuditEvent, Invite, Setting } from '@prisma/client'
import { container, UserError } from '@sapphire/framework'
import { Except, RequireAtLeastOne } from 'type-fest'

const { PrismaClient } = Prisma

export class Database {
    #prisma = new PrismaClient()
    #settings: Map<bigint, Setting> = new Map()

    public async createAuditEntry(event: AuditEvent, metadata: Prisma.Prisma.JsonObject) {
        await this.#prisma.audit.create({ data: { event, metadata } })
    }

    public async createAuditEntries(data: { event: AuditEvent, metadata: Prisma.Prisma.JsonObject }[]) {
        await this.#prisma.audit.createMany({ data, skipDuplicates: true })
    }
    
    public async createInvites(guildId: bigint, codes: string[]) {
        const data = codes.map(code => ({ guildId, code }))

        await this.#prisma.invite.createMany({ data, skipDuplicates: true })
    }

    public async createSetting(guildId: bigint) {
        const setting = await this.#prisma.setting.create({ data: { guildId, categoryChannelIds: [], ignoredChannelIds: [] } })
        this.#settings.set(guildId, setting)
        await this.createAuditEntry('GUILD_CREATE', { guildId: guildId.toString(), total: container.client.guilds.cache.size })
    }

    public async deleteSetting(guildId: bigint) {
        await this.#prisma.setting.delete({ where: { guildId } })
        this.#settings.delete(guildId)
        await this.createAuditEntry('GUILD_DELETE', { guildId: guildId.toString(), total: container.client.guilds.cache.size })
    }

    public async deleteGuildInvites(guildId: bigint) {
        await this.#prisma.invite.deleteMany({ where: { guildId } })
    }

    public async init() {
		await this.#prisma.setting.updateMany({ data: { inCheck: false } })

		const settings = await this.#prisma.setting.findMany()

		for (const setting of settings)
			this.#settings.set(setting.guildId, setting)
    }
    
    public async readAuditEntries(startTime: Date, endTime: Date) {
        const records = await this.#prisma.audit.findMany({
            where: {
                timestamp: {
                    gte: startTime,
                    lte: endTime
                }
            }
        })

        return records        
    }

    public async readCheckedCodes(amount: number): Promise<{ guildId: bigint; code: string }[]> {
        const codes = await this.#prisma.invite.findMany({
            orderBy: { updatedAt: 'asc' },
            select: { guildId: true, code: true },
            take: amount,
            where: { isChecked: true, isValid: true }			
        })

        return codes
    }

    public async readGuildCodes(guildId: bigint): Promise<Map<string, Invite>> {
        const data = await this.#prisma.invite.findMany({ where: { guildId } })
        const invites = new Map<string, Invite>()

        for (const datum of data)
            invites.set(datum.code, datum)

        return invites
    }

	public readSetting(guildId: bigint): Setting
	public readSetting<K extends keyof Setting>(guildId: bigint, field: K): Setting[K]
	public readSetting<K extends keyof Setting>(guildId: bigint, field?: K) {
        const setting = this.#settings.get(guildId)

		return field
			? setting?.[field]
			: setting
	}

    public async readUncheckedCodes(amount: number): Promise<{ guildId: bigint; code: string }[]> {
        const codes = await this.#prisma.invite.findMany({
            orderBy: { createdAt: 'asc' },
            select: { guildId: true, code: true },
            take: amount,
            where: { isChecked: false }			
        })

        return codes
    }

    public async recycleInvites(xDays: number) {
        const now = new Date()
        const xDaysAgo = new Date(now.setDate(now.getDate() - xDays))
        const xDaysAgoInvites = await this.#prisma.invite.findMany({
            select: { guildId: true, code: true },
            where: { createdAt: { lte: xDaysAgo }, isValid: true }
        })

        await this.#prisma.invite.deleteMany({
            where: {
                createdAt: {
                    lte: xDaysAgo
                }
            }
        })
        await this.#prisma.invite.createMany({ data: xDaysAgoInvites, skipDuplicates: true })
    }

	public async updateSetting(guildId: bigint, data: RequireAtLeastOne<Except<Setting, 'guildId'>>) {
        const setting = await this.#prisma.setting.update({ data, where: { guildId } })
        this.#settings.set(guildId, setting)
	}

    public async upsertCode(guildId: bigint, code: string, expiresAt: Date, isPermanent: boolean, isValid: boolean) {
        await this.#prisma.invite.upsert({
            create: { guildId, code, expiresAt, isPermanent, isValid, isChecked: true },
            update: { expiresAt, isPermanent, isValid, isChecked: true },
            where: { guildId_code: { guildId, code } }
        })
    }
}