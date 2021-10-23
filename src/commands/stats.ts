import { SakuraCommand } from '#structures'
import type { SakuraCommandOptions } from '#types'
import { addCommas } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'
import type { CommandInteraction, MessageEmbed } from 'discord.js'
import prettyMilliseconds from 'pretty-ms'

@ApplyOptions<SakuraCommandOptions>({
    description: 'Checks Discord API latency.',
    type: 'CHAT_INPUT'
})
export class PingCommand extends SakuraCommand {
    public async interact(interaction: CommandInteraction) {
		await interaction.deferReply()

		const { client } = this.container
		const { heapTotal, heapUsed } = process.memoryUsage()
		const embed: Partial<MessageEmbed> = {
			color: 0xF8F8FF,
			description: [
				`**Channels:** ${ addCommas(client.channels.cache.size) }`,
				`**Guilds:** ${ addCommas(client.guilds.cache.size) }`,
				`**RAM Usage:** ${ this.formatMemory(heapUsed) } MB (**Total:** ${ this.formatMemory(heapTotal) } MB)`,
				`**Uptime:** ${ prettyMilliseconds(client.uptime ?? 0, { secondsDecimalDigits: 0 }) }`,
			].join('\n'),
			title: `${ client.user.username }`
		}

		await interaction.editReply({ embeds: [embed] })
    }

	private formatMemory(num: number) {
		const [decimal, fraction] = (num / 1048576).toFixed(2).split('.')
	
		return `${ addCommas(Number(decimal)) }.${ fraction }`
	}
}