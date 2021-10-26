import { INVITE_CHECK_COOLDOWN } from '#config'
import { EVENTS, PRIORITY } from '#constants'
import { SakuraCommand } from '#structures'
import { CategoryCounts, type SakuraCommandOptions } from '#types'
import { extractCodes, fetchInvite, isNewsOrTextChannel } from '#utils'
import { ApplyOptions } from '@sapphire/decorators'
import type { GuildBasedChannelTypes } from '@sapphire/discord.js-utilities'
import { type CategoryChannel, type CommandInteraction, type CommandInteractionOptionResolver, Formatters, type MessageEmbed, type NewsChannel, type TextChannel } from 'discord.js'
import { hrtime } from 'node:process'
import prettyMilliseconds from 'pretty-ms'

@ApplyOptions<SakuraCommandOptions>({
    description: 'Runs an invite check.',
    type: 'CHAT_INPUT'
})
export class CheckCommand extends SakuraCommand {
    public async interact(interaction: CommandInteraction, options: CommandInteractionOptionResolver) {
        await interaction.deferReply()

        const { audits, client, invites, queue, settings } = this.container
        const guildId = BigInt(interaction.guildId)
        const { categoryChannelIds, checkChannelId, checkEmbedColor, ignoreChannelIds, inCheck, lastInviteCheckAt = new Date } = settings.read(guildId)
        const now = Date.now()
        const checkCounts: CategoryCounts[] = []

        if (inCheck) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error(`${ client.user.username } is still checking categories for this guild. Please try again at a later time.`), { interaction, options })
            return
        }
        if (now <= lastInviteCheckAt.getTime() + INVITE_CHECK_COOLDOWN) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error(`You may run an invite check again at ${ Formatters.time(lastInviteCheckAt.getTime() + INVITE_CHECK_COOLDOWN) } (${ Formatters.time(lastInviteCheckAt.getTime() + INVITE_CHECK_COOLDOWN, 'R') })`), { interaction, options })
            return   
        }
        if (!checkChannelId) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error('No check channel has been set for this guild. Please set one before running an invite check.'), { interaction, options })
            return
        }
        if (checkChannelId !== BigInt(interaction.channelId)) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error(`This command can only be run in <#${ checkChannelId }>.`), { interaction, options })
            return
        }
        if (!categoryChannelIds.length) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error('There are no categories to check. Please add some before running an invite check.'), { interaction, options })
            return
        }
       
        const { guild } = interaction
        const checkChannel = guild.channels.cache.get(interaction.channelId)

        if (!isNewsOrTextChannel(checkChannel)) {
            await client.emit(EVENTS.INTERACTION_ERROR, new Error('INSERT_MESSAGE_HERE.'), { interaction, options })
            return
        }

        await settings.update(guildId, { inCheck: true })
        await audits.create('INVITE_CHECK_START', { guildId: interaction.guildId })
        const timerStart = hrtime.bigint()
        const startEmbed: Partial<MessageEmbed> = { color: checkEmbedColor, description: `${ client.user.username } is checking your invites now!` }
        await checkChannel.send({ embeds: [startEmbed] })
        
        const isAddedCategoryChannel = (channel: GuildBasedChannelTypes): channel is CategoryChannel => (channel.type === 'GUILD_CATEGORY') && categoryChannelIds.includes(BigInt(channel.id))
        const sortedCategoriesToCheck = guild.channels.cache
            .filter(isAddedCategoryChannel)
            .sort((c1, c2) => c1.position - c2.position)
        const shouldCheckChannel = (channel: GuildBasedChannelTypes): channel is NewsChannel | TextChannel => isNewsOrTextChannel(channel) && !ignoreChannelIds.includes(BigInt(channel.id))
        const knownCodes = await invites.read(guildId, false)

        for (const { children, name } of sortedCategoriesToCheck.values()) {
            const counts: CategoryCounts = { channels: [], issues: 0, manual: [], name }
            const channelsToCheck = children
                .filter(shouldCheckChannel)
                .sort((c1, c2) => c1.position - c2.position)

            if (!channelsToCheck.size) {
                const emptyCategoryEmbed = this.formatCategoryEmbed(counts, checkEmbedColor)
                await checkChannel.send({ embeds: [emptyCategoryEmbed] })
                continue
            }

            for (const channel of channelsToCheck.values()) {
				if (!channel) {
					counts.issues++
					continue
				}

				const channelId = channel.id

                if (!channel.lastMessageId) {
                    counts.channels.push({ bad: 0, channelId, good: 0 })
                    continue
                }

				const messages = await channel.messages.fetch({ limit: 10 })

				if (!messages.size) {
					counts.manual.push(channelId)
					continue
				}

				const foundCodes = extractCodes(messages)
				let bad = 0, good = 0

				for (const code of foundCodes) {
                    let isValid: boolean

                    if (knownCodes.has(code)) {
                        const invite = knownCodes.get(code)
                        isValid = invite?.isPermanent || (invite?.isValid && (now < invite?.expiresAt.getTime()))
                    } else {
                        const invite = await queue.add(fetchInvite(code), { priority: PRIORITY.INVITE_CHECK })
                        const expiresAt = invite?.expiresAt ?? null
                        const isPermanent = !Boolean(expiresAt) && !Boolean(invite?.maxAge) && !Boolean(invite?.maxUses)
                        isValid = Boolean(invite)

                        await invites.createCheckedCode(guildId, code, expiresAt, isPermanent, isValid)
                    }

                    isValid
                        ? good++
                        : bad++
                }		
					
				counts.channels.push({ bad, channelId, good })
            }

			checkCounts.push(counts)
			const categoryEmbed = this.formatCategoryEmbed(counts, checkEmbedColor)
			await checkChannel.send({ embeds: [categoryEmbed] })  
        }

        const timerEnd = hrtime.bigint()
        const elapsedTime = timerEnd - timerStart
		const endEmbed: Partial<MessageEmbed> = { color: checkEmbedColor, description: 'Invite check complete!' }
        const { totalBad, totalChannels, totalGood, totalInvites } = this.count(checkCounts)
		const resultsEmbed = this.formatResultsEmbed(totalBad, totalChannels, totalGood, totalInvites, elapsedTime, checkEmbedColor)
		
		await checkChannel.send({ embeds: [endEmbed, resultsEmbed] })
        await settings.update(guildId, { inCheck: false }) 
        await audits.create('INVITE_CHECK_FINISH', { elapsedTime: Number(elapsedTime / BigInt(1e6)), guildId: interaction.guildId, totalBad, totalChannels, totalGood, totalInvites })
    }

    private count(categories: CategoryCounts[]) {
        let totalBad = 0, totalChannels = 0, totalGood = 0

        for (const { channels, issues, manual } of categories) {
            totalChannels += channels.length + issues + manual.length

			if (!channels.length)
				continue

            for (const { bad, good } of channels) {
                totalBad += bad
                totalGood += good
            }
        }

        return { totalBad, totalChannels, totalGood, totalInvites: totalBad + totalGood }
    }

	private formatCategoryEmbed({ channels, issues, manual, name}: CategoryCounts, color: number) {
        const embed: Partial<MessageEmbed> = {
            color,
            footer: { text: `Checked ${ channels.length ? 10 : 0 } messages` },
            timestamp: Number(new Date),
            title: `The "${ name }" category`
		}

        embed.description = (channels.length)
            ? channels.map(({ bad, channelId, good }) => `<#${ channelId }> - **${ bad + good }** total (**${ bad }** bad, **${ good }** good)`).join('\n')
            : 'No channels to check in this category.'

		if (issues) {
			embed.fields ??= []
			embed.fields.push({ inline: false, name: 'Issues', value: `- ${ issues } channel(s) could not be checked.` })
		}
		if (manual.length) {
			embed.fields ??= []
			embed.fields.push({ inline: false, name: 'Manual check(s) required', value: manual.map(channelId => `- <#${ channelId }>`).join('\n') })
		}

		return embed
	}

    private formatResultsEmbed(totalBad: number, totalChannels: number, totalGood: number, totalInvites: number, elapsedTime: bigint, color: number) {   
        const embed: Partial<MessageEmbed> = {
            color,
            fields: [
                { inline: false, name: 'Elapsed time', value: prettyMilliseconds(Number(elapsedTime / BigInt(1e6)), { secondsDecimalDigits: 0, separateMilliseconds: true }) },
                {
                    inline: false,
                    name: 'Stats',
                    value: [
                        `- **${ totalChannels }** channels checked`,
                        `- **${ totalInvites }** invites checked`,
                        `- **${ totalBad }** (${ (100 * totalBad / totalInvites).toFixed(2) }%) invalid invites`,
                        `- **${ totalGood }** (${ (100 * totalGood / totalInvites).toFixed(2) }%) valid invites`                        
                    ].join('\n')
                }
            ],
            timestamp: Number(new Date),
            title: 'Invite check results'
        }

        return embed
    }
}