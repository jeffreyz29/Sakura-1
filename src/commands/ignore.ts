import { ENVIRONMENT } from '#config'
import { SakuraCommand } from '#structures'
import { type ApplicationCommandRegistry, UserError, RegisterBehavior } from '@sapphire/framework'
import type { CommandInteraction, MessageEmbed } from 'discord.js'

export class IgnoreCommand extends SakuraCommand {
	// public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
	// 	registry.registerChatInputCommand({
    //         description: 'Add to or remove channels from the "ignored channels" list.',
    //         name: this.name,
    //         options: [
    //             {
    //                 description: 'Add a channel to the "ignored channels" list.',
    //                 name: 'add',
    //                 options: [
    //                     {
    //                         channelTypes: ['GUILD_NEWS', 'GUILD_TEXT'],
    //                         description: 'The channel to add.',
    //                         name: 'channel',
    //                         type: 'CHANNEL',
    //                         required: true
    //                     }
    //                 ],
    //                 type: 'SUB_COMMAND'
    //             },
    //             {
    //                 description: 'Remove a channel from the "ignored channels" list.',
    //                 name: 'remove',
    //                 options: [
    //                     {
    //                         channelTypes: ['GUILD_NEWS', 'GUILD_TEXT'],
    //                         description: 'The channel to remove.',
    //                         name: 'channel',
    //                         type: 'CHANNEL',
    //                         required: true
    //                     }
    //                 ],
    //                 type: 'SUB_COMMAND'
    //             }
    //         ]
	// 	}, {
    //         behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
	// 		guildIds: ENVIRONMENT === 'development' ? ['903369282518396988'] : [],
	// 		idHints: ['950620374117253140']
	// 	})
	// }

    public async chatInputRun(interaction: CommandInteraction<'cached'>) {
		await interaction.deferReply()
        
        const { database } = this.container
        const { options } = interaction
        const subcommand = options.getSubcommand(true)
        const channel = options.getChannel('channel')

        if (!channel)
            throw new UserError({ identifier: null, message: 'No channel found.' })
    
        const channelId = BigInt(channel.id)
        const guildId = BigInt(interaction.guildId)
        const list = database.readSetting(guildId, 'ignoreChannelIds')
        const inList = list.includes(channelId)

        if ((subcommand === 'add') && inList)
            throw new UserError({ identifier: null, message: 'This channel is already ignored.' })
        if ((subcommand === 'remove') && !inList)
            throw new UserError({ identifier: null, message: 'This channel is not in the "ignored channels" list.' })


        const updatedList = (subcommand === 'add')
            ? [...list, channelId]
            : list.filter(id => id !== channelId)
        await database.updateSetting(guildId, { ignoreChannelIds: updatedList })

        const embed: Partial<MessageEmbed> = { color: 0xF8F8FF, description: `${ channel } will ${ (subcommand === 'add') ? 'now' : 'no longer' } be ignored during invite checks.` }
        await interaction.editReply({ embeds: [embed] })
    }
}