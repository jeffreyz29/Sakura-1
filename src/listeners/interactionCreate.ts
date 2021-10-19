import { Events } from '#constants'
import { ApplyOptions } from '@sapphire/decorators'
import { isDMChannel } from '@sapphire/discord.js-utilities'
import { Listener, UserError, type ListenerOptions } from '@sapphire/framework'
import { Constants, type Interaction, Permissions } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Constants.Events.INTERACTION_CREATE })
export class GenesisListener extends Listener {
    public async run(interaction: Interaction) {
        const { channel, client, guild } = interaction
        const me = guild.me ?? (client.id
            ? await guild.members.fetch(client.id)    
            : null
        )

        if (isDMChannel(channel))
            return false
        if (!channel.permissionsFor(me).has(this.minimumPermissions, true))
            return
        if (interaction.user.bot)
            return
		if (!interaction.isCommand())
			return

        const command = this.container.stores.get('commands').get(interaction.commandName)

        if (!command) {
            client.emit(Events.UNKNOWN_INTERACTION, interaction)
            return
        }

        const { memberPermissions, options } = interaction

        if (!memberPermissions.has('ADMINISTRATOR')) {
            client.emit(Events.INTERACTION_DENIED, new UserError({ identifier: 'UserPermissions', message: `Only administrators may run commands with ${ client.user }.` }), interaction)
            return
        }

		try {
			client.emit(Events.INTERACTION_RUN, interaction, options)		
            const result = await command.interact(interaction, options)
            client.emit(Events.INTERACTION_SUCCESS, { interaction, options, result })
		} catch (error) {
            client.emit(Events.INTERACTION_ERROR, error as Error, { interaction, options })
		} finally {
            client.emit(Events.INTERACTION_FINISH, interaction, options)
		}
    }

    private readonly minimumPermissions = new Permissions(['SEND_MESSAGES', 'USE_APPLICATION_COMMANDS', 'VIEW_CHANNEL']).freeze()
}