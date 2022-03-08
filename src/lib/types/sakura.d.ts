import type { CommandOptions, PieceOptions } from '@sapphire/framework'
import { Except } from 'type-fest'
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

export type SakuraCommandOptions = Pick<CommandOptions, 'description'> & PieceOptions