import { Precondition } from '@sapphire/framework'
import { type CommandInteraction, NewsChannel, Permissions, TextChannel } from 'discord.js'

export class SakuraPrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        const channel = interaction.channel as NewsChannel | TextChannel
        const me = interaction.guild.me
        const missingPermissions = channel.permissionsFor(me).missing(this.minimumPermissions)

        if (!missingPermissions.length)
            return this.ok()
        
        const missingPermissionsString = missingPermissions.map(permission => `\`${ permission}\``)
        // @ts-expect-error
        const message = `I am missing the ${ new Intl.ListFormat().format(missingPermissionsString) } ${ missingPermissions.length === 1 ? 'permission': 'permissions' } in order to run this command.`

        return this.error({ identifier: 'SakuraPermissions', message })        
    }

    private readonly minimumPermissions = new Permissions(['EMBED_LINKS', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'USE_APPLICATION_COMMANDS', 'VIEW_CHANNEL']).freeze()
}