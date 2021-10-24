import { ApplyOptions } from '@sapphire/decorators'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { Constants, type Guild } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Constants.Events.GUILD_DELETE })
export class SakuraListener extends Listener {
    public async run(guild: Guild) {
        await this.container.settings.delete(BigInt(guild.id))
    }
}