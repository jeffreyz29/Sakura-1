import type { Setting } from '@prisma/client'
import { container } from '@sapphire/framework'
import { Collection } from 'discord.js'
import { Except, RequireAtLeastOne } from 'type-fest'

export class Settings {
	#settings: Collection<bigint, Setting> = new Collection()

	public async create(guildId: bigint) {
        if (this.#settings.has(guildId))
            return

        const setting = await container.prisma.setting.create({ data: { guildId } })
        this.#settings.set(guildId, setting) 
	}

	public async delete(guildId: bigint) {
        if (!this.#settings.has(guildId))
            return

        await container.prisma.setting.delete({ where: { guildId } })
        this.#settings.delete(guildId) 
	}

	public async init() {
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

        const setting = await container.prisma.setting.update({ data, where: { guildId } })
        this.#settings.set(guildId, setting)
	}
}