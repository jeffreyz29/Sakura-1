import { ApplyOptions } from '@sapphire/decorators'
import { type ChatInputCommandErrorPayload, Events, Listener, type ListenerOptions, type UserError } from '@sapphire/framework';
import type { MessageEmbed } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Events.ChatInputCommandError })
export class SakuraListener extends Listener {
    public async run({ message }: UserError, { interaction }: ChatInputCommandErrorPayload) {
        const embed: Partial<MessageEmbed> = { color: 0xF8F8FF, description: message }

        if (interaction.deferred)
            await interaction.editReply({ embeds: [embed] })
        else
            await interaction.reply({ embeds: [embed] })
    }
}