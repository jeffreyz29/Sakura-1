import { syncCommands } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { Constants } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Constants.Events.CLIENT_READY, once: true })
export class SakuraListener extends Listener {
	public async run() {
		const { client, schedules, settings } = this.container

		await settings.init()

		for (const guild of client.guilds.cache.values())
			await settings.create(BigInt(guild.id))

		await schedules.add('invite', '*/15 * * * *', {})
		await syncCommands()
		console.log(`${client.user.tag} is online!`)
	}
}