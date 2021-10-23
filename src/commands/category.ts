import { EVENTS } from '#constants'
import { SakuraCommand } from '#structures'
import type { SakuraCommandOptions } from '#types'
import { extractCodes, isNewsOrTextChannel } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'
import type { CategoryChannel, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed } from 'discord.js'

@ApplyOptions<SakuraCommandOptions>({
    description: 'Add to or remove channels from the category list.',
    parameters: [
        {
            description: 'Add a category to the list.',
            name: 'add',
            options: [
                {
                    channelTypes: ['GUILD_CATEGORY'],
                    description: 'The category to add.',
					name: 'category',
					type: 'CHANNEL',
					required: true
                }
            ],
            type: 'SUB_COMMAND'
        },
        {
            description: 'Remove a category from the list.',
            name: 'remove',
            options: [
                {
                    channelTypes: ['GUILD_CATEGORY'],
                    description: 'The category to remove.',
					name: 'category',
					type: 'CHANNEL',
					required: true
                }
            ],
            type: 'SUB_COMMAND'
        }
    ],
    type: 'CHAT_INPUT'
})
export class CategoryCommand extends SakuraCommand {
    public async interact(interaction: CommandInteraction, options: CommandInteractionOptionResolver) {
		await interaction.deferReply()
        
        const { client, settings } = this.container
        const subcommand = options.getSubcommand(true)
        const category = options.getChannel('category') as CategoryChannel

        if (!category) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error('No category found.'), { interaction, options })
            return
        }

        const channelId = BigInt(category.id)
        const guildId = BigInt(interaction.guildId)
        const list = settings.read(guildId, 'categoryChannelIds')
        const inList = list.includes(channelId)

        if ((subcommand === 'add') && inList) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error('This category has already been added.'), { interaction, options })
            return
        }
        if ((subcommand === 'remove') && !inList) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error('This category is not in the list.'), { interaction, options })
            return
        }

        if (subcommand === 'add')
            await this.processCategory(category)

        const updatedList = (subcommand === 'add')
            ? [...list, channelId]
            : list.filter(id => id !== channelId)
        await settings.update(guildId, { categoryChannelIds: updatedList })

        const embed: Partial<MessageEmbed> = { color: 0xF8F8FF, description: `${ category } will ${ (subcommand === 'add') ? 'now' : 'no longer' } be checked during invite checks.` }
        await interaction.editReply({ embeds: [embed] })
    }

    private async processCategory(category: CategoryChannel) {
        const { invites } = this.container
        const guildId = BigInt(category.guildId)
        const knownCodes = await invites.read(guildId, true)
        const codes: string[] = []
        
        for (const channel of category.children.values()) {
            if (!channel)
                continue
            if (!isNewsOrTextChannel(channel))
                continue
            if (!channel?.lastMessageId)
				continue
            const messages = await channel.messages.fetch({ limit: 10 })

            if (!messages.size)
                continue

            const foundCodes = extractCodes(messages)
            const unknownCodes = foundCodes.filter(code => !knownCodes.includes(code))
            
            codes.push(...unknownCodes)
        }

        await this.container.invites.createUncheckedCodes(guildId, codes)
    }
}