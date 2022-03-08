import { ENVIRONMENT } from '#config'
import { SakuraCommand } from '#structures'
import { ApplicationCommandRegistry, RegisterBehavior } from '@sapphire/framework'
import { type ColorResolvable, type CommandInteraction, type CommandInteractionOptionResolver, type MessageEmbed, Util } from 'discord.js'

export class SetCommand extends SakuraCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand({
			description: 'Modifies various server settings',
			name: this.name,
			options: [
				{
					description: 'Sets the channel to send invite check results to.',
					name: 'check-channel',
					options: [
						{
							channelTypes: ['GUILD_NEWS', 'GUILD_TEXT'],
							description: 'The check channel.',
							name: 'channel',
							type: 'CHANNEL',
							required: false
						}
					],
					type: 'SUB_COMMAND'
				},
				{
					description: 'Sets the embed color for invite check embeds.',
					name: 'check-embed-color',
					options: [
						{
							description: 'Check embed (hex) color code.',
							name: 'color',
							type: 'STRING',
							required: true
						}
					],
					type: 'SUB_COMMAND'
				}
			]
		}, {
			behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
			guildIds: ENVIRONMENT === 'development' ? ['903369282518396988'] : []
		})
	}

    public async chatInputRun(interaction: CommandInteraction) {
		await interaction.deferReply()
        
        const { database } = this.container
		const { options } = interaction
        const subcommand = options.getSubcommand(true)
        const guildId = BigInt(interaction.guildId)
        const embed: Partial<MessageEmbed> = { color: 0xF8F8FF }

        if (subcommand === 'check-channel') {
            const channel = options.getChannel('channel')
			await database.updateSetting(guildId, { checkChannelId: channel ? BigInt(channel.id) : null })

            embed.description = channel
                ? `Invite check results will now be sent in ${ channel }.`
                : 'This server no longer has a check channel.'
        } else {
            try {
                const color = interaction.options.getString('color', true)
                const resolvedColor = Util.resolveColor(color as ColorResolvable)
                await database.updateSetting(guildId, { checkEmbedColor: resolvedColor })

                embed.description = `The check embed color is now #${ resolvedColor.toString(16).toUpperCase().padStart(6, '0') }.`
            } catch (error) {
                embed.description = 'No valid color provided.'
            }
        }

		await interaction.editReply({ embeds: [embed] })
    }
}