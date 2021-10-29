import { PRIORITY, TASK_RESULT } from '#constants'
import { Task } from '#structures'
import { fetchInvite } from '#utils'

export class UpdateCheckedCodesTask extends Task {
	public async run() {
		const { invites, queue, settings } = this.container
		const codes = await invites.read('checked')

		for (const { guildId, code } of codes) {
			if (!settings.read(guildId, 'inCheck'))
				await settings.update(guildId, { inCheck: true })

			const invite = await queue.add(fetchInvite(code), { priority: PRIORITY.CATEGORY })
            const expiresAt = invite?.expiresAt ?? null
            const isValid = Boolean(invite)
			const isPermanent = isValid && !Boolean(expiresAt) && !Boolean(invite?.maxAge) && !Boolean(invite?.maxUses)

            await invites.upsert(guildId, code, expiresAt, isPermanent, isValid)
        }
		
		return TASK_RESULT.REPEAT
	}
}