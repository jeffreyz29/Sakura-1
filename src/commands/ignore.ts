import { EVENTS } from '#constants'
import { SakuraCommand } from '#structures'
import type { SakuraCommandOptions } from '#types'
import { ApplyOptions } from '@sapphire/decorators'
import type { CommandInteraction, CommandInteractionOptionResolver, MessageEmbed } from 'discord.js'

@ApplyOptions<SakuraCommandOptions>({
    description: 'Add to or remove channels from the "ignored channels" list.',
    parameters: [
        {
            description: 'Add a channel to the "ignored channels" list.',
            name: 'add',
            options: [
                {
                    channelTypes: ['GUILD_NEWS', 'GUILD_TEXT'],
                    description: 'The channel to add.',
					name: 'channel',
					type: 'CHANNEL',
					required: true
                }
            ],
            type: 'SUB_COMMAND'
        },
        {
            description: 'Remove a channel from the "ignored channels" list.',
            name: 'remove',
            options: [
                {
                    channelTypes: ['GUILD_NEWS', 'GUILD_TEXT'],
                    description: 'The channel to remove.',
					name: 'channel',
					type: 'CHANNEL',
					required: true
                }
            ],
            type: 'SUB_COMMAND'
        }
    ],
    type: 'CHAT_INPUT'
})
export class IgnoreCommand extends SakuraCommand {
    public async interact(interaction: CommandInteraction, options: CommandInteractionOptionResolver) {
		await interaction.deferReply()
        
        const { client, settings } = this.container
        const subcommand = options.getSubcommand(true)
        const channel = options.getChannel('channel')

        if (!channel) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error('No channel found.'), { interaction, options })
            return
        }

        const channelId = BigInt(channel.id)
        const guildId = BigInt(interaction.guildId)
        const list = settings.read(guildId, 'ignoreChannelIds')
        const inList = list.includes(channelId)

        if ((subcommand === 'add') && inList) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error('This channel is already ignored.'), { interaction, options })
            return
        }
        if ((subcommand === 'remove') && !inList) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error('This channel is not in the "ignored channels" list.'), { interaction, options })
            return
        }

        const updatedList = (subcommand === 'add')
            ? [...list, channelId]
            : list.filter(id => id !== channelId)
        await settings.update(guildId, { ignoreChannelIds: updatedList })

        const embed: Partial<MessageEmbed> = { color: 0xF8F8FF, description: `${ channel } will ${ (subcommand === 'add') ? 'now' : 'no longer' } be ignored during invite checks.` }
        await interaction.editReply({ embeds: [embed] })
    }
}