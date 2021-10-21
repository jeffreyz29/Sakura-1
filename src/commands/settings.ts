import { SakuraCommand } from '#structures'
import type { SakuraCommandOptions } from '#types'
import { ApplyOptions } from '@sapphire/decorators'
import { CommandInteraction, Guild, MessageEmbed } from 'discord.js'

@ApplyOptions<SakuraCommandOptions>({
    description: 'Displays a guild\'s settings.',
    type: 'CHAT_INPUT'    
})
export class SettingsCommand extends SakuraCommand {
    public async interact(interaction: CommandInteraction) {
        await interaction.deferReply({ fetchReply: true })
        
        const { guild } = interaction
        const settings = this.container.settings.read(BigInt(guild.id))
        const embed: Partial<MessageEmbed> = {
            author: {
                iconURL: guild.iconURL({ dynamic: true, size: 1024 }),
                name: `${ guild.name }${ guild.name.endsWith('s') ? '\'' : '\'s' } settings`
            },
            color: 0xF8F8FF,
            fields: [
                { inline: false, name: 'Check channel', value: `${ guild.channels.cache.get(settings.checkChannelId.toString()) ?? 'No channel set.' }` },
                { inline: false, name: 'Additional role', value: `${ guild.roles.cache.get(settings.additionalRoleId.toString()) ?? 'No role set.' }` },
                { inline: false, name: 'Categories', value: this.formatChannelList(guild, settings.categoryChannelIds) ?? 'No categories added.' },
                { inline: false, name: 'Ignored channels', value: this.formatChannelList(guild, settings.ignoreChannelIds) ?? 'No categories added.' },
                { inline: false, name: 'Check embed color', value: `#${ settings.checkEmbedColor.toString(16).toUpperCase().padStart(6, '0') }` }
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