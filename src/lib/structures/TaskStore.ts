// The following file has been modified from:

// Apache License 2.0 | Copyright 2019 Skyra Project
// https://github.com/skyra-project/skyra/blob/main/src/lib/database/settings/structures/TaskStore.ts

import { Task } from '#structures'
import { Store } from '@sapphire/framework'

export class TaskStore extends Store<Task> {
	public constructor() {
		super(Task as any, { name: 'tasks' })
		this.container.stores.register(this)
	}
}