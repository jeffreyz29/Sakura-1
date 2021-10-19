import { SakuraCommandOptions } from '#types'
import { Awaitable, Command, PieceContext } from '@sapphire/framework'
import type { ApplicationCommandData, CommandInteraction, CommandInteractionOptionResolver } from 'discord.js'

export abstract class SakuraCommand extends Command {
    protected constructor(context: PieceContext, options: SakuraCommandOptions) {
        super(context, { name: context.name.toLowerCase(), ...options })

        this.defaultPermission = options.defaultPermission ?? true
        this.description = options.description?.substring(0, 100) ?? ''
        this.parameters = (options.type === 'CHAT_INPUT')
            ? (options.parameters ?? [])
            : null
        this.type = options.type
    }

    public messageRun(..._args: unknown[]) {
        return null
    }

    public abstract interact(interaction: CommandInteraction, options: CommandInteractionOptionResolver): Awaitable<unknown>

    public getCommandData(): ApplicationCommandData {
		return {
            defaultPermission: this.defaultPermission,
			description: this.description,
            name: this.name,
            options: this.parameters,
			type: this.type			
		}
    }
}