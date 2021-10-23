import { EVENTS } from '#constants'
import { ApplyOptions } from '@sapphire/decorators'
import { Listener, type ListenerOptions, type UserError } from '@sapphire/framework'
import type { CommandInteraction, MessageEmbed } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: EVENTS.INTERACTION_DENIED })
export class SakuraListener extends Listener {
    public async run({ message }: UserError, interaction: CommandInteraction) {
        const embed: Partial<MessageEmbed> = { color: 0xF8F8FF, description: message }

        if (interaction.deferred)
            await interaction.editReply({ embeds: [embed] })    
        else
            await interaction.reply({ embeds: [embed], ephemeral: true })
    }
}