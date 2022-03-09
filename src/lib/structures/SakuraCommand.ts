import type { SakuraCommandOptions } from '#types'
import { Command, PieceContext } from '@sapphire/framework'

export abstract class SakuraCommand extends Command {
    protected constructor(context: PieceContext, options: SakuraCommandOptions) {
        super(
            context, 
            {
                name: context.name.toLowerCase(),
                ...options,
                preconditions: ['SakuraPermissions', 'AdministratorOnly'],
                runIn: ['GUILD_NEWS', 'GUILD_TEXT']
            }
        )
    }
}