// The following file has been modified from:

// Apache License 2.0 | Copyright 2019 Skyra Project
// https://github.com/skyra-project/skyra/blob/main/src/lib/database/settings/structures/Task.ts

import type { TASK_RESULT } from '#constants'
import { Piece } from '@sapphire/framework'
import type { Awaitable } from '@sapphire/utilities'

export abstract class Task extends Piece {
	public abstract run(data: Record<string, unknown>): Awaitable<TASK_RESULT>
}