import { ENVIRONMENT } from '#config'
import { SakuraCommand } from '#structures'
import { ApplicationCommandRegistry, RegisterBehavior } from '@sapphire/framework'
import { CommandInteraction, Guild, MessageEmbed } from 'discord.js'

export class SettingsCommand extends SakuraCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand({
			description: 'Displays a guild\'s settings',
			name: this.name
		}, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
			guildIds: ENVIRONMENT === 'development' ? ['903369282518396988'] : []
		})
	}

    public async chatInputRun(interaction: CommandInteraction<'cached'>) {       
        const { guild } = interaction
        const { categoryChannelIds, embedColor, ignoredChannelIds, resultsChannelId } = this.container.database.readSetting(BigInt(interaction.guildId))

        await interaction.deferReply()
        
        const embed: Partial<MessageEmbed> = {
            author: {
                iconURL: guild.iconURL({ dynamic: true, size: 1024 }),
                name: `${ guild.name }${ guild.name.endsWith('s') ? '\'' : '\'s' } settings`
            },
            color: 0xF8F8FF,
            fields: [
                { inline: false, name: 'Categories', value: this.formatChannelList(guild, categoryChannelIds) ?? 'No categories added.' },
                { inline: false, name: 'Embed color', value: `#${ embedColor.toString(16).toUpperCase().padStart(6, '0') }` },
                { inline: false, name: 'Ignored channels', value: this.formatChannelList(guild, ignoredChannelIds) ?? 'No channels ignored.' },
                { inline: false, name: 'Results channel', value: `${ guild.channels.cache.get(resultsChannelId?.toString()) ?? 'No channel set.' }` }                
            ]           
        }

        await interaction.editReply({ embeds: [embed] })
    }

    private formatChannelList({ channels: { cache } }: Guild, channels: bigint[]) {
        if (!channels?.length)
            return
        return channels
            .map(channelId => `- ${ cache.get(channelId.toString()) ?? `${ channelId } **(no longer exists)**` }`)
            .join('\n')
    }
}