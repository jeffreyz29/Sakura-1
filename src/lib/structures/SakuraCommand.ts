import type { SakuraCommandOptions } from '#types'
import { Command, PieceContext } from '@sapphire/framework'

export abstract class SakuraCommand extends Command {
    protected constructor(context: PieceContext, options: SakuraCommandOptions) {
        super(
            context, 
            {
                name: context.name.toLowerCase(),
                ...options,
                requiredClientPermissions: ['EMBED_LINKS', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'USE_APPLICATION_COMMANDS', 'VIEW_CHANNEL'],
                requiredUserPermissions: ['ADMINISTRATOR'],
                runIn: ['GUILD_NEWS', 'GUILD_TEXT']
            }
        )
    }
}