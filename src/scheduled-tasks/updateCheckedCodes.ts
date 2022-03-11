import { ScheduledTask, ScheduledTaskOptions } from '@sapphire/plugin-scheduled-tasks'
import { fetchInvite } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'

@ApplyOptions<ScheduledTaskOptions>({ cron: '15,45 1-23 * * *' })
export class UpdateCheckedCodesTask extends ScheduledTask {
    public async run() {
        const { database, queue } = this.container
        const codes = await database.readCheckedCodes(150)

		if (!codes.length)
			return

        for (const { guildId, code } of codes) {
            const invite = await queue.add(fetchInvite(code), { priority: 0 })
            const expiresAt = invite?.expiresAt ?? null
            const isValid = Boolean(invite)
            const isPermanent = isValid && !Boolean(expiresAt) && !Boolean(invite?.maxAge) && !Boolean(invite?.maxUses)

            await database.updateInvite(guildId, code, expiresAt, isPermanent, isValid)
        }
    }
}