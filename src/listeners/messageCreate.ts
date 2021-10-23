import { extractCodes, isNewsOrTextChannel } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { Constants, type Message } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Constants.Events.MESSAGE_CREATE })
export class SakuraListener extends Listener {
    public async run(message: Message) {
        if (!isNewsOrTextChannel(message.channel))
            return

        const { invites, settings } = this.container
        const guildId = BigInt(message.guildId)
        const { categoryChannelIds, checkChannelId, ignoreChannelIds, inCheck } = settings.read(guildId)
        const categoryId = BigInt(message.channel?.parentId ?? 0)
        const channelId = BigInt(message.channelId)

        if (inCheck)
            return
        if (!categoryChannelIds.includes(categoryId))
            return
        if (ignoreChannelIds.includes(channelId))
            return
        if (checkChannelId === checkChannelId)
            return

        const foundCodes = extractCodes(message)
    
        if (!foundCodes.length)
            return

        await invites.createUncheckedCodes(guildId, foundCodes)
    }
}