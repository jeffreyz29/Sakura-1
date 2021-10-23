import { ENVIRONMENT, GUILD_ID } from '#config'
import { DiscordInviteRegex } from '#constants'
import { ChannelTypes } from '@sapphire/discord.js-utilities'
import { container } from '@sapphire/framework'
import type { Collection, DiscordAPIError, Invite, Message, NewsChannel, TextChannel } from 'discord.js'
import { type APIInteractionDataResolvedChannel, ChannelType } from 'discord-api-types/v9'

export const addCommas = (num: number) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

export const extractCodes = (data: Message | Collection<string, Message>) => {
	const messages = ('size' in data)
		? [...data.values()]
		: [data]
	const foundCodes: string[] = []

	for (const { content } of messages ) {
		const codes = [...content.matchAll(DiscordInviteRegex)].map(match => match[1])
		foundCodes.push(...codes)
	}

	const uniqueCodes = [...new Set(foundCodes)]
	return uniqueCodes
}

export const fetchInvite = (code: string) => (): Promise<Invite> => {
	return container.client
		.fetchInvite(code)
		.catch(() => null)
}

export const syncCommands = async () => {
	const { client, stores } = container
	const isDev = (ENVIRONMENT === 'development')
	const commands = [...stores.get('commands').values()].map(interaction => interaction.getCommandData())
	
	if (isDev) {
		try {
			const guild = await client.guilds.fetch(GUILD_ID.toString())
			await guild.commands.set(commands)
			console.log(`Set ${ commands.length } command(s) to guild "${ guild.name }"!`)
		} catch (error) {
			console.log(`This bot is not in the guild with ID "${ GUILD_ID }"`)
		}
	} else {
		for (const guild of client.guilds.cache.values())
			await guild.commands.set([])
			
		await client.application.fetch()
		await client.application.commands.set(commands)
		console.log(`Set ${ commands.length } command(s) globally!`)
	}
}