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

export interface FormattedInvite {
    id: number;
    guildId: bigint
    code: string
    expiresAt: Date | null
    isPermanent: boolean | null
    isValid: boolean | null
    isChecked: boolean
    createdAt: Date
    updatedAt: Date | null
}

export interface RawInvite {
    id: number;
    guildId: string
    code: string
    expiresAt: Date | null
    isPermanent: boolean | null
    isValid: boolean | null
    isChecked: boolean
    createdAt: Date
    updatedAt: Date | null
}


export type SakuraCommandOptions = Pick<CommandOptions, 'description'> & PieceOptions