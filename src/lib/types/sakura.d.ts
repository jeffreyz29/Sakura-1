import type { CommandJSON, CommandOptions } from '@sapphire/framework'
import type { ApplicationCommandOptionData, ApplicationCommandType } from 'discord.js'

export interface CategoryCounts {
    channels: ChannelCounts[]
    issues: number
    manual: string[]
    name: string
}
export interface ChannelCounts {
    bad: number
    channelId: string
    good: number
}

export type SakuraCommandOptions = Pick<CommandOptions, 'description' | 'enabled' | 'name'> & {
    defaultPermission?: boolean
    parameters?: ApplicationCommandOption[]
    type: ApplicationCommandType
}