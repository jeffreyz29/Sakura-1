import { ApplyOptions } from '@sapphire/decorators'
import { ChannelTypes } from '@sapphire/discord.js-utilities'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { CategoryChannel, Constants, NewsChannel, TextChannel, type DMChannel, type GuildChannel } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Constants.Events.CHANNEL_DELETE })
export class SakuraListener extends Listener {
	public async run(channel: DMChannel | GuildChannel) {
        if (!this.isCategoryOrNewsOrText(channel))
            return

        const { database } = this.container
        const guildId = BigInt(channel.guildId)
        const channelId = BigInt(channel.id)
        const setting = database.readSetting(guildId)

        if (!setting)
            return

        let { categoryChannelIds, ignoredChannelIds, resultsChannelId } = setting        

		if (categoryChannelIds.includes(channelId))
            categoryChannelIds = categoryChannelIds.filter(id => id !== channelId)
        if (ignoredChannelIds.includes(channelId))
            ignoredChannelIds = ignoredChannelIds.filter(id => id !== channelId)
        if (resultsChannelId === channelId)
            resultsChannelId = null

        await database.updateSetting(guildId, { categoryChannelIds, ignoredChannelIds, resultsChannelId })
	}

    private isCategoryOrNewsOrText(channel: ChannelTypes): channel is CategoryChannel | NewsChannel | TextChannel {
        return ['GUILD_CATEGORY', 'GUILD_NEWS', 'GUILD_TEXT'].includes(channel.type)
    }
}