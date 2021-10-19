import type { CommandJSON, CommandOptions } from '@sapphire/framework'
import type { ApplicationCommandOptionData, ApplicationCommandType } from 'discord.js'

export type SakuraCommandOptions = Pick<CommandOptions, 'description' | 'enabled' | 'name' | 'parameters'> & {
    defaultPermission?: boolean
    type: ApplicationCommandType
}