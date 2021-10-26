import { Events } from '#constants'
import type { Audits, Invites, Schedules, Settings, TaskStore } from '#structures'
import Prisma from '@prisma/client'
import { Awaitable, UserError } from '@sapphire/framework'
import type { ApplicationCommandData, ApplicationCommandOption, ApplicationCommandOptionData, ApplicationCommandTypes, CommandInteraction, CommandInteractionOptionResolver } from 'discord.js'
import type PQueue from 'p-queue'

declare module 'discord.js' {
	interface ClientEvents {
		[Events.INTERACTION_DENIED]: [error: UserError, interaction: CommandInteraction]
		[Events.INTERACTION_ERROR]: [error: Error, interaction: CommandInteraction]
		[Events.INTERACTION_FINISH]: [interaction: CommandInteraction]
		[Events.INTERACTION_RUN]: [interaction: CommandInteraction, options: CommandInteractionOptionResolver]
		[Events.INTERACTION_SUCCESS]: [interaction: CommandInteraction, result: Awaitable<unknown>]
		[Events.UNKNOWN_INTERACTION]: [interaction: CommandInteraction]
	}
}

declare module '@sapphire/framework' {
	interface Command {
		defaultPermission?: boolean
		parameters?: ApplicationCommandOptionData[]
		type: ApplicationCommandTypes
		interact(interaction: CommandInteraction, options: CommandInteractionOptionResolver): Awaitable<unknown>
		getCommandData(): ApplicationCommandData
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		audits: Audits
		invites: Invites
		prisma: Prisma.PrismaClient
		queue: PQueue
		schedules: Schedules
		settings: Settings
	}

	interface StoreRegistryEntries {
		tasks: TaskStore
	}
}