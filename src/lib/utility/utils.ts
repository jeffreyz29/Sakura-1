import { DiscordInviteRegex } from '#constants'
import { ChannelTypes } from '@sapphire/discord.js-utilities'
import { container } from '@sapphire/framework'
import Cron from 'croner'
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

const handleCodes = async () => {
	const now = new Date()
	const hour = now.getHours()
	const minute = now.getMinutes()
	const { database, queue } = container

	if (hour == 0) {
		if (minute == 0)
			await database.recycleInvites(30)
	} else {
		let codes: { id: number, code: string }[]

		if ([0, 30].includes(minute))
			codes = await database.readUncheckedCodes(150)
		else if ([15, 45].includes(minute))
			codes = await database.readCheckedCodes(150)
		else
			codes = []

		if (!codes.length)
			return

		for (const { id, code } of codes) {
			const invite = await queue.add(fetchInvite(code), { priority: 0 })
			const expiresAt = invite?.expiresAt ?? null
			const isValid = Boolean(invite)
			const isPermanent = isValid && !Boolean(expiresAt) && !Boolean(invite?.maxAge) && !Boolean(invite?.maxUses)

			await database.updateInvite(id, expiresAt, isPermanent, isValid)
		}
	}
}

export const handleCodesTask = () => Cron('*/15 * * * *', handleCodes)

export const isNewsOrTextChannel = (channel: ChannelTypes): channel is NewsChannel | TextChannel => {
	return ['GUILD_NEWS', 'GUILD_TEXT'].includes(channel.type)
}