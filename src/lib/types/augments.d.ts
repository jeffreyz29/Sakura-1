import type { Database } from '#structures'
import Prisma from '@prisma/client'
import type PQueue from 'p-queue'

declare module '@sapphire/framework' {
	interface Preconditions {
		ClientdPermissions: never
		UserPermissions: never
	}

	interface ScheduledTasks {
		checkUncheckedCodes: never
		updateCheckedCodes: never
	}
}
declare module '@sapphire/pieces' {
	interface Container {
		database: Database
		prisma: Prisma.PrismaClient
		queue: PQueue
	}
}