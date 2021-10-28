import { EVENTS } from '#constants'
import { SakuraCommand } from '#structures'
import type { SakuraCommandOptions } from '#types'
import { extractCodes, isNewsOrTextChannel } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'
import { type CategoryChannel, type CommandInteraction, type CommandInteractionOptionResolver, type Message, type MessageEmbed, Permissions, Collection } from 'discord.js'

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

        const { me } = interaction.guild

        if (subcommand === 'add') {
            const channels = [...category.children.values()]
            const issues = channels.filter(channel => channel.isText() && !channel.permissionsFor(me).has(this.minimumPermissions))

            if (issues.length) {
                // @ts-expect-error
                const message = `I am unable to read ${ new Intl.ListFormat().format(issues.map(issue => `<#${ issue.id }>`)) }. `
                await client.emit(EVENTS.INTERACTION_ERROR, new Error(message), { interaction, options })
                return
            } else 
                await this.processCategory(category)
        }

        const updatedList = (subcommand === 'add')
            ? [...list, channelId]
            : list.filter(id => id !== channelId)
        await settings.update(guildId, { categoryChannelIds: updatedList })

        const embed: Partial<MessageEmbed> = { color: 0xF8F8FF, description: `${ category } will ${ (subcommand === 'add') ? 'now' : 'no longer' } be checked during invite checks.` }
        await interaction.editReply({ embeds: [embed] })
    }

    private async processCategory(category: CategoryChannel) {
        const guildId = BigInt(category.guildId)
        const collections: Collection<string, Message>[] = []
        
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

            collections.push(messages)
        }

        const categoryMessages = new Collection<string, Message>().concat(...collections)
        const codes = extractCodes(categoryMessages)

        if (!codes.length)
            return

        await this.container.invites.create(guildId, codes)
    }

    private readonly minimumPermissions = new Permissions(['READ_MESSAGE_HISTORY', 'VIEW_CHANNEL']).freeze()
}