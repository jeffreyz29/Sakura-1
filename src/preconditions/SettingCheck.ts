import { Precondition } from '@sapphire/framework'
import { type CommandInteraction } from 'discord.js'

export class SakuraPrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        const guildId = BigInt(interaction.guild.id)
        const setting = this.container.database.readSetting(guildId)
        const commandName = interaction.command.name
        const commandsThatUseSettings = ['category', 'check', 'ignore', 'set', 'setting']

        return (setting || !commandsThatUseSettings.includes(commandName))
            ? this.ok()
            : this.error({ identifier: 'SettingsCheck', message: `Please kick and reinvite ${ this.container.client.user.username }.` })
    }
}