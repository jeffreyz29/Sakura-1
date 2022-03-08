import { DiscordInviteRegex } from '#constants'
import { ChannelTypes } from '@sapphire/discord.js-utilities'
import { container } from '@sapphire/framework'
import type { Collection, Invite, Message, NewsChannel, TextChannel } from 'discord.js'

export const addCommas = (num: number) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

export const extractCodes = (data: Message | Collection<string, Message>, unique: boolean) => {
	const messages = ('size' in data)
		? [...data.values()]
		: [data]
	const foundCodes: string[] = []

	for (const { content } of messages ) {
		const codes = [...content.matchAll(DiscordInviteRegex)].map(match => match[1])
		foundCodes.push(...codes)
	}

	return unique ?
		[...new Set(foundCodes)]
		: foundCodes
}

export const fetchInvite = (code: string) => (): Promise<Invite> => {
	return container.client
		.fetchInvite(code)
		.catch(() => null)
}

export const isNewsOrTextChannel = (channel: ChannelTypes): channel is NewsChannel | TextChannel => {
	return ['GUILD_NEWS', 'GUILD_TEXT'].includes(channel.type)
}