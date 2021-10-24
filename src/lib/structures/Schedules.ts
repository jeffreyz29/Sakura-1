// The following file has been modified from:

// Apache License 2.0 | Copyright 2019 Skyra Project
// https://github.com/skyra-project/skyra/blob/main/src/lib/structures/managers/ScheduleManager.ts

import { TASK_RESULT } from '#constants'
import { ScheduledTask } from '#types'
import { Awaitable, container } from '@sapphire/framework'
import { Cron } from '@sapphire/time-utilities'

export class Schedules {
	#tasks: ScheduledTask[] = []
	#timer: NodeJS.Timer = null

	public add(name: string, schedule: string | Date, data: Record<string, unknown>) {
		const cron = (typeof schedule === 'string') ? new Cron(schedule) : null
		const time = (typeof schedule === 'string') ? cron.next() : schedule
		const task: ScheduledTask = { cron, data, name, paused: false, running: false, time }

		this.insert(task)
		this.startTimer()
	}

	private async check() {
		if (!this.#tasks.length)
			this.startTimer()
		else {
			const now = Date.now()
			const run: Awaitable<TASK_RESULT>[] = []
			const indices: number[] = []

			for (const [i, t] of this.#tasks.entries()) {
				if (t.time.getTime() > now)
					break

				if (t.paused || t.running)
					continue

				const task = container.stores.get('tasks').get(t.name)

				if (!task.enabled)
					continue

				this.#tasks[i].running = true
				indices.push(i)
				run.push(task.run(t.data))
			}

			if (!run.length)
				return

			const results = await Promise.all(run)
			
			for (const i of indices)
				this.#tasks[i].running = false

			const schedules = indices.map(i => this.#tasks[i])
			const resultsFormatted = results.map((result, i) => ({ result, schedule: schedules[i] }))

			await this.process(resultsFormatted)
			this.startTimer()
		}
	}

	private insert(task: ScheduledTask) {
		const index = this.#tasks.findIndex(t => t.time.getTime() > task.time.getTime())

		if (index === -1)
			this.#tasks.push(task)
		else
			this.#tasks.splice(index, 0, task)
	}

	private process(results: { result: TASK_RESULT, schedule: ScheduledTask }[]) {
		for (const { result, schedule } of results) {
			schedule.paused = true

			if (result === TASK_RESULT.ONE_AND_DONE)
				this.remove(schedule)
			else {
				this.remove(schedule)
				schedule.time = schedule.cron.next()
				schedule.paused = false
				this.insert(schedule)
			}
		}
	}

	private remove(task: ScheduledTask) {
		const index = this.#tasks.findIndex(t => t === task)

		if (index !== -1)
			this.#tasks.splice(index, 1)
	}

	private startTimer() {
		if (!this.#tasks.length)
			this.stopTimer()
		if (!this.#timer)
			this.#timer = setInterval(this.check.bind(this), 5000)
	}

	private stopTimer() {
		if (!this.#timer)
			return

		clearInterval(this.#timer)
		this.#timer = null
	}
}