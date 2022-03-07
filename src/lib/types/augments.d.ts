import { EVENTS } from '#constants'
import type { Audits, Invites, Settings } from '#structures'
import Prisma from '@prisma/client'
import { Awaitable, UserError } from '@sapphire/framework'
import type { ApplicationCommandData, ApplicationCommandOption, ApplicationCommandOptionData, ApplicationCommandTypes, CommandInteraction, CommandInteractionOptionResolver } from 'discord.js'
import type PQueue from 'p-queue'

declare module 'discord.js' {
	interface ClientEvents {
		[EVENTS.INTERACTION_DENIED]: [error: UserError, interaction: CommandInteraction<'cached'>]
		[EVENTS.INTERACTION_ERROR]: [error: Error, interaction: CommandInteraction<'cached'>]
		[EVENTS.INTERACTION_FINISH]: [interaction: CommandInteraction<'cached'>]
		[EVENTS.INTERACTION_RUN]: [interaction: CommandInteraction<'cached'>, options: Omit<CommandInteractionOptionResolver<'cached'>, 'getMessage' | 'getFocused'>]
		[EVENTS.INTERACTION_SUCCESS]: [interaction: CommandInteraction<'cached'>, result: Awaitable<unknown>]
		[EVENTS.UNKNOWN_INTERACTION]: [interaction: CommandInteraction<'cached'>]
	}
}

declare module '@sapphire/framework' {
	interface Command {
		defaultPermission?: boolean
		parameters?: ApplicationCommandOptionData[]
		type: ApplicationCommandTypes
		interact(interaction: CommandInteraction<'cached'>, options: Omit<CommandInteractionOptionResolver<'cached'>, 'getMessage' | 'getFocused'>): Awaitable<unknown>
		getCommandData(): ApplicationCommandData
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		audits: Audits
		invites: Invites
		prisma: Prisma.PrismaClient
		queue: PQueue
		settings: Settings
	}
}