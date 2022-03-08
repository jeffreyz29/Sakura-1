import { ENVIRONMENT } from '#config'
import { SakuraCommand } from '#structures'
import { extractCodes, isNewsOrTextChannel } from '#utils'
import { type ApplicationCommandRegistry, UserError, RegisterBehavior } from '@sapphire/framework'
import { type CategoryChannel, type CommandInteraction, type Message, type MessageEmbed, Permissions, Collection } from 'discord.js'

export class CategoryCommand extends SakuraCommand {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            description: 'Add to or remove channels from the category list.',
            name: this.name,
            options: [
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
            ]
        }, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
			guildIds: ENVIRONMENT === 'development' ? ['903369282518396988'] : [],
			idHints: ['950894111618134017']
		})
    }

    public async chatInputRun(interaction: CommandInteraction) {
        const { options } = interaction
        const subcommand = options.getSubcommand(true)
        const category = options.getChannel('category') as CategoryChannel

        if (!category)
            throw new UserError({ identifier: null, message: 'No category found.' })

        const channelId = BigInt(category.id)
        const guildId = BigInt(interaction.guildId)
        const { database } = this.container
        const list = database.readSetting(guildId, 'categoryChannelIds')
        const inList = list.includes(channelId)

        await interaction.deferReply()

        if (subcommand === 'add') {
            if (inList)
                throw new UserError({ identifier: null, message: 'This category has already been added.' })

            const { me } = interaction.guild
            const channels = [...category.children.values()]
            const issues = channels.filter(channel => channel.isText() && !channel.permissionsFor(me).has(this.minimumPermissions))

            if (issues.length)
                // @ts-expect-error
                throw new UserError({ identifier: null, message: `I am unable to read ${ new Intl.ListFormat().format(issues.map(issue => `<#${ issue.id }>`)) }.` })
            else 
                await this.processCategory(category)
        }
        if ((subcommand === 'remove') && !inList)
            throw new UserError({ identifier: null, message: 'This category is not in the list.' })

        const updatedList = (subcommand === 'add')
            ? [...list, channelId]
            : list.filter(id => id !== channelId)
        await database.updateSetting(guildId, { categoryChannelIds: updatedList })

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
        const codes = extractCodes(categoryMessages, true)

        if (!codes.length)
            return

        await this.container.database.createInvites(guildId, codes)
    }

    private readonly minimumPermissions = new Permissions(['READ_MESSAGE_HISTORY', 'VIEW_CHANNEL']).freeze()
}