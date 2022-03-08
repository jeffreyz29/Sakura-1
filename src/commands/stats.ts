import { ENVIRONMENT } from '#config'
import { SakuraCommand } from '#structures'
import { addCommas } from '#utils'
import { ApplicationCommandRegistry, RegisterBehavior } from '@sapphire/framework'
import type { CommandInteraction, MessageEmbed } from 'discord.js'
import prettyMilliseconds from 'pretty-ms'

export class PingCommand extends SakuraCommand {
	// public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
	// 	registry.registerChatInputCommand({
	// 		description: 'Displays random metrics of interest.',
	// 		name: this.name
	// 	}, {
	// 		behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
	// 		guildIds: ENVIRONMENT === 'development' ? ['903369282518396988'] : [],
	// 		idHints: ['950620459492335706']
	// 	})
	// }

    public async chatInputRun(interaction: CommandInteraction<'cached'>) {
		await interaction.deferReply()

		const { client } = this.container
		const { heapTotal, heapUsed } = process.memoryUsage()
		const embed: Partial<MessageEmbed> = {
			color: 0xF8F8FF,
			description: [
				`**Channels:** ${ addCommas(client.channels.cache.size) }`,
				`**Guild(s):** ${ addCommas(client.guilds.cache.size) }`,
				`**RAM Usage:** ${ this.formatMemory(heapUsed) } MB (**Total:** ${ this.formatMemory(heapTotal) } MB)`,
				`**Uptime:** ${ prettyMilliseconds(client.uptime ?? 0, { secondsDecimalDigits: 0 }) }`,
			].join('\n')
		}

		await interaction.editReply({ embeds: [embed] })
    }

	private formatMemory(num: number) {
		const [decimal, fraction] = (num / 1048576).toFixed(2).split('.')
	
		return `${ addCommas(Number(decimal)) }.${ fraction }`
	}
}