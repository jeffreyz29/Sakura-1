import { ScheduledTask, ScheduledTaskOptions } from '@sapphire/plugin-scheduled-tasks'
import { ApplyOptions } from '@sapphire/decorators'

@ApplyOptions<ScheduledTaskOptions>({ cron: '0 0 * * *' })
export class DeleteCodesTask extends ScheduledTask {
	public async run() {
        await this.container.database.recycleInvites(30)
	}
}