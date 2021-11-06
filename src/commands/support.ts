import { SUPPORT_SERVER_CODE } from '#config'
import { SakuraCommand } from '#structures'
import type { SakuraCommandOptions } from '#types'
import { ApplyOptions } from '@sapphire/decorators'
import type { CommandInteraction, MessageActionRowOptions, MessageActionRowComponentOptions } from 'discord.js'

@ApplyOptions<SakuraCommandOptions>({
    description: 'Displays the invite link for the support server.',
    type: 'CHAT_INPUT'
})
export class SupportCommand extends SakuraCommand {
    public async interact(interaction: CommandInteraction<'cached'>) {
		await interaction.deferReply()

		const inviteButton: MessageActionRowComponentOptions = { label: 'Support Server', style: 'LINK', type: 'BUTTON', url: `https://discord.gg/${ SUPPORT_SERVER_CODE }` }
		const row: Required<MessageActionRowOptions> = { components: [inviteButton], type: 'ACTION_ROW' }

		await interaction.editReply({ components: [row], content: String.fromCharCode(8203) })
    }
}