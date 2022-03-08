import { ScheduledTask, ScheduledTaskOptions } from '@sapphire/plugin-scheduled-tasks'
import { fetchInvite } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'

@ApplyOptions<ScheduledTaskOptions>({ cron: '1-59/20 * * * *' })
export class UpdateCheckedCodesTask extends ScheduledTask {
    public async run() {
        const { database, queue } = this.container
        const codes = await database.readCheckedCodes(250)

        for (const { guildId, code } of codes) {
            const invite = await queue.add(fetchInvite(code), { priority: 0 })
            const expiresAt = invite?.expiresAt ?? null
            const isValid = Boolean(invite)
            const isPermanent = isValid && !Boolean(expiresAt) && !Boolean(invite?.maxAge) && !Boolean(invite?.maxUses)

            await database.upsertCode(guildId, code, expiresAt, isPermanent, isValid)
        }
    }
}