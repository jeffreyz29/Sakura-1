import type { Setting } from '@prisma/client'
import { container } from '@sapphire/framework'
import { Collection, Guild } from 'discord.js'
import { Except, RequireAtLeastOne } from 'type-fest'

export class Settings {
	#settings: Collection<bigint, Setting> = new Collection()

	public async create(guildId: bigint) {
		const guild = this.read(guildId)

		if (!guild) {
			const setting = await container.prisma.setting.create({ data: { guildId } })
			this.#settings.set(guildId, setting)
			await container.audits.create('GUILD_CREATE', { guildId: guildId.toString(), total: container.client.guilds.cache.size })
		}
		if (!guild.active) {
			await this.update(guildId, { active: true })
			await container.audits.create('GUILD_CREATE', { guildId: guildId.toString(), total: container.client.guilds.cache.size })
		}
	}

	public async delete(guildId: bigint) {
		const guild = this.read(guildId)

		if (!guild) {
			const setting = await container.prisma.setting.create({ data: { guildId, active: false } })
			this.#settings.set(guildId, setting)
			await container.audits.create('GUILD_DELETE', { guildId: guildId.toString(), total: container.client.guilds.cache.size })
		}
		if (guild.active) {
			await this.update(guildId, { active: false })
			await container.audits.create('GUILD_DELETE', { guildId: guildId.toString(), total: container.client.guilds.cache.size })
		}
	}

	public async init() {
		await container.prisma.setting.updateMany({ data: { inCheck: false } })
		const settings = await container.prisma.setting.findMany()

		for (const setting of settings)
			this.#settings.set(setting.guildId, setting)
	}

	public read(guildId: bigint): Setting
	public read<K extends keyof Setting>(guildId: bigint, field: K): Setting[K]
	public read<K extends keyof Setting>(guildId: bigint, field?: K) {
		return field
			? this.#settings.get(guildId)?.[field]
			: this.#settings.get(guildId)
	}

	public async update(guildId: bigint, data: RequireAtLeastOne<Except<Setting, 'guildId'>>) {
        if (!this.#settings.has(guildId))
            return  

        const newValue = await container.prisma.setting.update({ data, where: { guildId } })
        this.#settings.set(guildId, newValue)
	}
}