import type { AuditEvent, Invite, Setting, Prisma } from '@prisma/client'
import { container, UserError } from '@sapphire/framework'
import { Except, RequireAtLeastOne } from 'type-fest'

export class Database {
    #settings: Map<bigint, Setting> = new Map()

    public async createAuditEntry(event: AuditEvent, metadata: Prisma.JsonObject) {
        await container.prisma.audit.create({ data: { event, metadata } })
    }

    public async createAuditEntries(data: { event: AuditEvent, metadata: Prisma.JsonObject }[]) {
        await container.prisma.audit.createMany({ data, skipDuplicates: true })
    }
    
    public async createInvites(guildId: bigint, codes: string[]) {
        const data = codes.map(code => ({ guildId, code }))

        await container.prisma.invite.createMany({ data, skipDuplicates: true })
    }

    public async createSetting(guildId: bigint) {
        const setting = await container.prisma.setting.create({ data: { guildId } })
        this.#settings.set(guildId, setting)
        await this.createAuditEntry('GUILD_CREATE', { guildId: guildId.toString(), total: container.client.guilds.cache.size })
    }

    public async deleteSetting(guildId: bigint) {
        await container.prisma.setting.delete({ where: { guildId } })
        this.#settings.delete(guildId)
        await this.createAuditEntry('GUILD_DELETE', { guildId: guildId.toString(), total: container.client.guilds.cache.size })
    }

    public async readAuditEntries(startTime: Date, endTime: Date) {
        const records = await container.prisma.audit.findMany({
            where: {
                timestamp: {
                    gte: startTime,
                    lte: endTime
                }
            }
        })

        return records        
    }

    public async init() {
		await container.prisma.setting.updateMany({ data: { inCheck: false } })

		const settings = await container.prisma.setting.findMany()

		for (const setting of settings)
			this.#settings.set(setting.guildId, setting)
    }

    public async readCheckedCodes(amount: number): Promise<{ guildId: bigint; code: string }[]> {
        const codes = await container.prisma.invite.findMany({
            orderBy: { updatedAt: 'asc' },
            select: { guildId: true, code: true },
            take: amount,
            where: { isChecked: true, isValid: true }			
        })

        return codes
    }

    public async readGuildCodes(guildId: bigint): Promise<Map<string, Invite>> {
        const data = await container.prisma.invite.findMany({ where: { guildId } })
        const invites = new Map<string, Invite>()

        for (const datum of data)
            invites.set(datum.code, datum)

        return invites
    }

	public readSetting(guildId: bigint): Setting
	public readSetting<K extends keyof Setting>(guildId: bigint, field: K): Setting[K]
	public readSetting<K extends keyof Setting>(guildId: bigint, field?: K) {
        const setting = this.#settings.get(guildId)

        if (!setting)
            throw new UserError({ identifier: null, message: 'Please kick and reinvite Sakura.' })

		return field
			? setting?.[field]
			: setting
	}

    public async readUncheckedCodes(amount: number): Promise<{ guildId: bigint; code: string }[]> {
        const codes = await container.prisma.invite.findMany({
            orderBy: { createdAt: 'asc' },
            select: { guildId: true, code: true },
            take: amount,
            where: { isChecked: false }			
        })

        return codes
    }

	public async updateSetting(guildId: bigint, data: RequireAtLeastOne<Except<Setting, 'guildId'>>) {
        const setting = await container.prisma.setting.update({ data, where: { guildId } })
        this.#settings.set(guildId, setting)
	}

    public async upsertCode(guildId: bigint, code: string, expiresAt: Date, isPermanent: boolean, isValid: boolean) {
        await container.prisma.invite.upsert({
            create: { guildId, code, expiresAt, isPermanent, isValid, isChecked: true },
            update: { expiresAt, isPermanent, isValid, isChecked: true },
            where: { guildId_code: { guildId, code } }
        })
    }
}