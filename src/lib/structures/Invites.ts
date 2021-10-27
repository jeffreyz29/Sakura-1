import { AuditEvent, Invite, Prisma } from '@prisma/client'
import { container } from '@sapphire/framework'

export class Invites {
    public async create(guildId: bigint, codes: string[], fromMessage = false) {
        const inviteData = codes.map(code => ({ guildId, code }))

        await container.prisma.invite.createMany({ data: inviteData, skipDuplicates: true })

        if (!fromMessage && !container.settings.read(guildId, 'inCheck'))
            await container.settings.update(guildId, { inCheck: true })
    }

    public async delete(guildId: bigint) {
        await container.prisma.invite.deleteMany({ where: { guildId } })
    }

    public async read(guildId: bigint, codesOnly: false): Promise<Map<string, Invite>>
    public async read(guildId: bigint, codesOnly: true): Promise<string[]>
    public async read(guildId: bigint, codesOnly: boolean) {
        if (codesOnly) {
            const data = await container.prisma.invite.findMany({ select: { code: true }, where: { guildId } })
            const codes = data.map(({ code }) => code)

            return codes
        } else {
            const data = await container.prisma.invite.findMany({ where: { guildId } })
            const invites = new Map<string, Invite>()
    
            for (const datum of data)
                invites.set(datum.code, datum)
    
            return invites
        }
    }
    
	public async readUncheckedCodes() {
		const uncheckedCodes = await container.prisma.invite.findMany({
			orderBy: { createdAt: 'asc' },
			select: { guildId: true, code: true },
			take: 100,
			where: { isChecked: false }			
		})

		return uncheckedCodes
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