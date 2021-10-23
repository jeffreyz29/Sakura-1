import { ApplyOptions } from '@sapphire/decorators'
import { ChannelTypes } from '@sapphire/discord.js-utilities'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { CategoryChannel, Constants, NewsChannel, TextChannel, type DMChannel, type GuildChannel } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Constants.Events.CHANNEL_DELETE })
export class SakuraListener extends Listener {
	public async run(channel: DMChannel | GuildChannel) {
        if (!this.isCategoryOrNewsOrText(channel))
            return

        const { settings } = this.container
        const guildId = BigInt(channel.guildId)
        const { categoryChannelIds, checkChannelId, ignoreChannelIds } = settings.read(guildId)
        const channelId = BigInt(channel.id)

		if (categoryChannelIds.includes(channelId))
			await settings.update(guildId, { categoryChannelIds: categoryChannelIds.filter(id => id !== channelId) })
		if (checkChannelId === channelId)
			await settings.update(guildId, { checkChannelId: null })
		if (ignoreChannelIds.includes(channelId))
			await settings.update(guildId, { ignoreChannelIds: ignoreChannelIds.filter(id => id !== channelId) })
	}

    private isCategoryOrNewsOrText(channel: ChannelTypes): channel is CategoryChannel | NewsChannel | TextChannel {
        return ['GUILD_CATEGORY', 'GUILD_NEWS', 'GUILD_TEXT'].includes(channel.type)
    }
}