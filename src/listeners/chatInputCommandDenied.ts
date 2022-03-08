import { ApplyOptions } from '@sapphire/decorators'
import { type ChatInputCommandDeniedPayload, Events, Listener, type ListenerOptions, type UserError } from '@sapphire/framework';
import type { MessageEmbed } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Events.ChatInputCommandDenied })
export class SakuraListener extends Listener {
    public async run({ message }: UserError, { interaction }: ChatInputCommandDeniedPayload) {
        const embed: Partial<MessageEmbed> = { color: 0xF8F8FF, description: message }

        await interaction.reply({ embeds: [embed], ephemeral: true })
    }
}