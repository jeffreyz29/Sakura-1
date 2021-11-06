import { SakuraCommand } from '#structures'
import type { SakuraCommandOptions } from '#types'
import { ApplyOptions } from '@sapphire/decorators'
import { type ColorResolvable, type CommandInteraction, type CommandInteractionOptionResolver, type MessageEmbed, Util } from 'discord.js'

@ApplyOptions<SakuraCommandOptions>({
    description: 'Modifies various server settings',
	parameters: [
		{
			description: 'Sets the additional role for the guild.',
			name: 'additional-role',
			options: [
				{
					description: 'The role.',
					name: 'role',
					type: 'ROLE',
					required: false
				}
			],
			type: 'SUB_COMMAND'
		},
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
	],
    type: 'CHAT_INPUT'
})
export class SetCommand extends SakuraCommand {
    public async interact(interaction: CommandInteraction<'cached'>, options: Omit<CommandInteractionOptionResolver<'cached'>, 'getMessage' | 'getFocused'>) {
		await interaction.deferReply()
        
        const { settings } = this.container
        const subcommand = options.getSubcommand(true)
        const guildId = BigInt(interaction.guildId)
        const embed: Partial<MessageEmbed> = { color: 0xF8F8FF }

        if (subcommand === 'additional-role') {
            const role = options.getRole('role')
            await settings.update(guildId, { additionalRoleId: role ? BigInt(role.id) : null })
            
            embed.description = role
                ? `Users with the ${ role } role may run commands now.`
                : 'Only administrators may run commands now.'

            await interaction.editReply({ embeds: [embed] })
        } else if (subcommand === 'check-channel') {
            const channel = options.getChannel('channel')
            await settings.update(guildId, { checkChannelId: channel ? BigInt(channel.id) : null })

            embed.description = channel
                ? `Invite check results will now be sent in ${ channel }.`
                : 'This server no longer has a check channel.'

            await interaction.editReply({ embeds: [embed] })
        } else {
            try {
                const color = interaction.options.getString('color', true)
                const resolvedColor = Util.resolveColor(color as ColorResolvable)
                await this.container.settings.update(guildId, { checkEmbedColor: resolvedColor })

                embed.description = `The check embed color is now #${ resolvedColor.toString(16).toUpperCase().padStart(6, '0') }.`
                await interaction.editReply({ embeds: [embed] })
            } catch (error) {
                embed.description = 'No valid color provided.'
                await interaction.editReply({ embeds: [embed] })
            }
        }
    }
}