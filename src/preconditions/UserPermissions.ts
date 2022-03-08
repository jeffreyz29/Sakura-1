import { Precondition } from '@sapphire/framework'
import { type CommandInteraction } from 'discord.js'

export class SakuraPrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return interaction.memberPermissions.has('ADMINISTRATOR')
            ? this.ok()
            : this.error({ identifier: 'UserPermissions', message: `Only administrators may run commands with ${ this.container.client.user.tag }.` })
    }
}