import { ENVIRONMENT } from '#config'
import { SakuraCommand } from '#structures'
import { addCommas } from '#utils'
import { ApplicationCommandRegistry, RegisterBehavior } from '@sapphire/framework'
import type { CommandInteraction, MessageEmbed } from 'discord.js'

export class PingCommand extends SakuraCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand({
			description: 'Checks Discord API latency',
			name: this.name
		}, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: ENVIRONMENT === 'development' ? ['903369282518396988'] : []
		})
	}

    public async chatInputRun(interaction: CommandInteraction) {
        const reply = await interaction.deferReply({ fetchReply: true })
        const ping = this.getMillisecondsFromSnowflake(reply.id) - interaction.createdTimestamp
        const embed: Partial<MessageEmbed> = {
            color: 0xF8F8FF,
            description: [
                `🔂 **RTT**: ${ addCommas(ping) } ms`,
                `💟 **Heartbeat**: ${ addCommas(Math.round(this.container.client.ws.ping)) } ms`
            ].join('\n')
        }

        await interaction.editReply({ embeds: [embed] })
    }

    private getMillisecondsFromSnowflake(snowflake: string) {
        return Number((BigInt(snowflake) >> 22n) + 1420070400000n)
    }
}