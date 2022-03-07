import { Invite } from '@prisma/client'
import { container } from '@sapphire/framework'

export class Invites {
    public async createMany(guildId: bigint, codes: string[], fromMessage = false) {
        const inviteData = codes.map(code => ({ guildId, code }))
        const { count } = await container.prisma.invite.createMany({ data: inviteData, skipDuplicates: true })

        if (!count)
            return
        if (!fromMessage && !container.settings.read(guildId, 'inCheck'))
            await container.settings.update(guildId, { inCheck: true })
    }

    public async delete(guildId: bigint) {
        await container.prisma.invite.deleteMany({ where: { guildId } })
    }

    public async readCheckedCodes(amount: number): Promise<{ guildId: bigint; code: string }[]> {
        const codes = await container.prisma.invite.findMany({
            orderBy: { updatedAt: 'asc' },
            select: { guildId: true, code: true },
            take: amount,
            where: { isChecked: true, isValid: true }			
        })

        return codes
    }

    public async readGuildCodes(guildId: bigint): Promise<Map<string, Invite>> {
        const data = await container.prisma.invite.findMany({ where: { guildId } })
        const invites = new Map<string, Invite>()

        for (const datum of data)
            invites.set(datum.code, datum)

        return invites
    }

    public async readUncheckedCodes(amount: number): Promise<{ guildId: bigint; code: string }[]> {
        const codes = await container.prisma.invite.findMany({
            orderBy: { createdAt: 'asc' },
            select: { guildId: true, code: true },
            take: amount,
            where: { isChecked: false }			
        })

        return codes
    }

    public async upsert(guildId: bigint, code: string, expiresAt: Date, isPermanent: boolean, isValid: boolean) {
        await container.prisma.invite.upsert({
            create: { guildId, code, expiresAt, isPermanent, isValid, isChecked: true },
            update: { expiresAt, isPermanent, isValid, isChecked: true },
            where: { guildId_code: { guildId, code } }
        })

        const uncheckedCodeCount = await container.prisma.invite.count({ where: { guildId, isChecked: false } })

        if (uncheckedCodeCount === 0)
            await container.settings.update(guildId, { inCheck: false })
    }
}