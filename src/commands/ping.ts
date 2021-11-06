import { SakuraCommand } from '#structures'
import type { SakuraCommandOptions } from '#types'
import { addCommas } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'
import type { CommandInteraction, MessageEmbed } from 'discord.js'

@ApplyOptions<SakuraCommandOptions>({
    description: 'Checks Discord API latency.',
    type: 'CHAT_INPUT'
})
export class PingCommand extends SakuraCommand {
    public async interact(interaction: CommandInteraction<'cached'>) {
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