import { ENVIRONMENT, GUILD_ID } from '#config'
import { container } from '@sapphire/framework'

export const addCommas = (num: number) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

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