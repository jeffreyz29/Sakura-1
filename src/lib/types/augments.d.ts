import { Events } from '#constants'
import type { Settings } from '#structures'
import Prisma from '@prisma/client'
import { Awaitable, UserError } from '@sapphire/framework'
import type { ApplicationCommandData, ApplicationCommandOption, ApplicationCommandOptionData, ApplicationCommandTypes, CommandInteraction, CommandInteractionOptionResolver } from 'discord.js'
import type PQueue from 'p-queue'

declare module 'discord.js' {
	interface ClientEvents {
		[Events.INTERACTION_DENIED]: [error: UserError, interaction: CommandInteraction]
		[Events.INTERACTION_ERROR]: [error: Error, { interaction: CommandInteraction, options: CommandInteractionOptionResolver }]
		[Events.INTERACTION_FINISH]: [interaction: CommandInteraction, options: CommandInteractionOptionResolver]
		[Events.INTERACTION_RUN]: [interaction: CommandInteraction, options: CommandInteractionOptionResolver]
		[Events.INTERACTION_SUCCESS]: [{ interaction: CommandInteraction, options: CommandInteractionOptionResolver, result: Awaitable<unknown> }]
		[Events.UNKNOWN_INTERACTION]: [interaction: CommandInteraction]
	}
}

declare module '@sapphire/framework' {
	interface Command {
		defaultPermission?: boolean
		parameters?: ApplicationCommandOptionData[]
		type: ApplicationCommandTypes
		interact(interaction: CommandInteraction, options: CommandInteractionOptionResolver) :Awaitable<unknown>
		getCommandData(): ApplicationCommandData
	}

	interface CommandOptions {
		parameters?: ApplicationCommandOption[]
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		prisma: Prisma.PrismaClient
		queue: PQueue
		settings: Settings
	}
}