import type { Database } from '#structures'
import type PQueue from 'p-queue'

declare module '@sapphire/framework' {
	interface Preconditions {
		AdministratorOnly: never
		SakuraPermissions: never
		SettingCheck: never
	}

	interface ScheduledTasks {
		checkUncheckedCodes: never
		deleteCodes: never
		updateCheckedCodes: never
	}
}
declare module '@sapphire/pieces' {
	interface Container {
		database: Database
		queue: PQueue
	}
}