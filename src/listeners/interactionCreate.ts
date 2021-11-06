import { EVENTS } from '#constants'
import { ApplyOptions } from '@sapphire/decorators'
import { isDMChannel } from '@sapphire/discord.js-utilities'
import { Listener, UserError, type ListenerOptions } from '@sapphire/framework'
import { Constants, type Interaction, Permissions, PermissionString, CommandInteraction } from 'discord.js'

@ApplyOptions<ListenerOptions>({ event: Constants.Events.INTERACTION_CREATE })
export class SakuraListener extends Listener {
    public async run(interaction: Interaction) {
        const { channel, client, guild } = interaction
        const me = guild.me ?? (client.id
            ? await guild.members.fetch(client.id)    
            : null
        )

        if (isDMChannel(channel))
            return false
        if (!interaction.inCachedGuild())
            return
        if (!interaction.isCommand())
			return
        if (interaction.user.bot)
            return

        const { settings, stores } = this.container
        const { commandName } = interaction
        const command = stores.get('commands').get(interaction.commandName)
        const commandsThatUseSettings = ['category', 'check', 'ignore', 'set', 'settings']
        const guildId = BigInt(interaction.guildId)

        if (!command) {
            client.emit(EVENTS.UNKNOWN_INTERACTION, interaction)
            return
        }
        if (commandsThatUseSettings.includes(commandName) && !settings.read(guildId)) {
            client.emit(EVENTS.INTERACTION_ERROR, new Error(`Please kick and reinvite ${ client.user.username }.`), interaction)
            return
        }
        if (!channel.permissionsFor(me).has(this.minimumPermissions)) {
            const missingPermissions = channel.permissionsFor(me).missing(this.minimumPermissions).map(permission => `\`${ permission}\``)
            // @ts-expect-error
            const message = `I am missing the ${ new Intl.ListFormat().format(missingPermissions) } ${ missingPermissions.length === 1 ? 'permission': 'permissions' } in order to run this command.`
            client.emit(EVENTS.INTERACTION_DENIED, new UserError({ identifier: 'ClientPermissions', message }), interaction)
            return
        }

        const { permissions, roles } = interaction.member
        const isAdmin = permissions.has('ADMINISTRATOR')
        const additionalRoleId = settings.read(BigInt(guildId), 'additionalRoleId')
        const hasAdditionalRole = additionalRoleId
            ? roles.cache.has(additionalRoleId.toString())
            : false

        if (!isAdmin && !hasAdditionalRole) {
            client.emit(EVENTS.INTERACTION_DENIED, new UserError({ identifier: 'UserPermissions', message: `Only administrators${ additionalRoleId ? ` or those with the <@&${ additionalRoleId.toString() }> role ` : ' ' }may run commands with ${ client.user.username }.` }), interaction)
            return
        }

		try {
			client.emit(EVENTS.INTERACTION_RUN, interaction, interaction.options)		
            const result = await command.interact(interaction, interaction.options)
            client.emit(EVENTS.INTERACTION_SUCCESS, interaction, result)
		} catch (error) {
            client.emit(EVENTS.INTERACTION_ERROR, error as Error, interaction)
		} finally {
            client.emit(EVENTS.INTERACTION_FINISH, interaction)
		}
    }

    private readonly minimumPermissions = new Permissions(['EMBED_LINKS', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'USE_APPLICATION_COMMANDS', 'VIEW_CHANNEL']).freeze()
}