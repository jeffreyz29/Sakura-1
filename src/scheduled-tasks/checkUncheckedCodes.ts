import { ScheduledTask, ScheduledTaskOptions } from '@sapphire/plugin-scheduled-tasks'
import { fetchInvite } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'

@ApplyOptions<ScheduledTaskOptions>({ cron: '0-59/20 * * * *' })
export class CheckUncheckedCodesTask extends ScheduledTask {
	public async run() {
		const { invites, queue, settings } = this.container
		const codes = await invites.readUncheckedCodes(250)

		for (const { guildId, code } of codes) {
			if (!settings.read(guildId, 'inCheck'))
				await settings.update(guildId, { inCheck: true })

			const invite = await queue.add(fetchInvite(code), { priority: 0 })
			const expiresAt = invite?.expiresAt ?? null
			const isValid = Boolean(invite)
			const isPermanent = isValid && !Boolean(expiresAt) && !Boolean(invite?.maxAge) && !Boolean(invite?.maxUses)

			await invites.upsert(guildId, code, expiresAt, isPermanent, isValid)
		}
	}
}