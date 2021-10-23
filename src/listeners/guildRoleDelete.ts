import { ApplyOptions } from '@sapphire/decorators'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { Constants, type Role } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Constants.Events.GUILD_ROLE_DELETE })
export class SakuraListener extends Listener {
    public async run(role: Role) {
        const { settings } = this.container
        const guildId = BigInt(role.guild.id)
        const roleId = BigInt(role.id)

		if (settings.read(guildId, 'additionalRoleId') === roleId)
			await settings.update(guildId, { additionalRoleId: null })
    }
}