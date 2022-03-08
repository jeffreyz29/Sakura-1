import { extractCodes, isNewsOrTextChannel } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { Constants, type Message } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Constants.Events.MESSAGE_CREATE })
export class SakuraListener extends Listener {
    public async run(message: Message) {
        if (!isNewsOrTextChannel(message.channel))
            return

        const { database } = this.container
        const guildId = BigInt(message.guildId)
        const { categoryChannelIds, checkChannelId, ignoreChannelIds } = database.readSetting(guildId)
        const categoryId = BigInt(message.channel?.parentId ?? 0)
        const channelId = BigInt(message.channelId)

        if (!categoryChannelIds.includes(categoryId) || ignoreChannelIds.includes(channelId) || (checkChannelId === channelId))
            return

        const foundCodes = extractCodes(message, true)
    
        if (!foundCodes.length)
            return

        await database.createInvites(guildId, foundCodes)
    }
}