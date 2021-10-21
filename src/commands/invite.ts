import { SakuraCommand } from '#structures'
import type { SakuraCommandOptions } from '#types'
import { ApplyOptions } from '@sapphire/decorators'
import { type CommandInteraction, type MessageActionRowOptions, type MessageActionRowComponentOptions, Permissions } from 'discord.js'

@ApplyOptions<SakuraCommandOptions>({
    description: 'Displays the invite link for the support server.',
    type: 'CHAT_INPUT'
})
export class SupportCommand extends SakuraCommand {
    public async interact(interaction: CommandInteraction) {
		await interaction.deferReply()

		const url = this.container.client.generateInvite({
			disableGuildSelect: false,
			permissions: [
                Permissions.FLAGS.SEND_MESSAGES,
                Permissions.FLAGS.USE_APPLICATION_COMMANDS,
                Permissions.FLAGS.VIEW_CHANNEL
            ],
			scopes: [
				'applications.commands',
				'bot'
			]
		})
		const inviteButton: MessageActionRowComponentOptions = { label: 'Invite Sakura!', style: 'LINK', type: 'BUTTON', url }
		const row: Required<MessageActionRowOptions> = { components: [inviteButton], type: 'ACTION_ROW' }

		await interaction.editReply({ components: [row], content: String.fromCharCode(8203) })
    }
}