import { ScheduledTask, ScheduledTaskOptions } from '@sapphire/plugin-scheduled-tasks'
import { fetchInvite } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'

@ApplyOptions<ScheduledTaskOptions>({ cron: '0,30 1-23 * * *' })
export class CheckUncheckedCodesTask extends ScheduledTask {
	public async run() {
		const { database, queue } = this.container
		const codes = await database.readUncheckedCodes(150)

		if (!codes.length)
			return

		for (const { id, code } of codes) {
			const invite = await queue.add(fetchInvite(code), { priority: 0 })
			const expiresAt = invite?.expiresAt ?? null
			const isValid = Boolean(invite)
			const isPermanent = isValid && !Boolean(expiresAt) && !Boolean(invite?.maxAge) && !Boolean(invite?.maxUses)

			await database.updateInvite(id, expiresAt, isPermanent, isValid)
		}
	}
}