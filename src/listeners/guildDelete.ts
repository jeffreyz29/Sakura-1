import { ApplyOptions } from '@sapphire/decorators'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { Constants, type Guild } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Constants.Events.GUILD_DELETE })
export class SakuraListener extends Listener {
    public async run(guild: Guild) {
        const guildId = BigInt(guild.id)

        await this.container.database.deleteSetting(guildId)
        await this.container.database.deleteGuildInvites(guildId)
    }
}