import { ApplyOptions } from '@sapphire/decorators'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { Constants } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Constants.Events.CLIENT_READY, once: true })
export class SakuraListener extends Listener {
	public async run() {	
		await this.container.client.application.commands.set([])
		console.log(`${ this.container.client.user.tag } is online!`)
	}
}