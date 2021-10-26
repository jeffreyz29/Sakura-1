import { AuditEvent, Invite, Prisma } from '@prisma/client'
import { container } from '@sapphire/framework'

export class Invites {
    public async createCheckedCode(guildId: bigint, code: string, expiresAt: Date, isPermanent: boolean, isValid: boolean) {
        await container.prisma.invite.create({ data: { guildId, code, expiresAt, isPermanent, isValid, isChecked: true } })
        await container.audits.create('CHECKED_CODE_ADD', { guildId: guildId.toString(), code, expiresAt: expiresAt?.toJSON(), isPermanent, isValid, isChecked: true })
    }

    public async createUncheckedCodes(guildId: bigint, codes: string[]) {
        const inviteData = codes.map(code => ({ guildId, code }))
        const auditData: { event: AuditEvent, metadata: Prisma.JsonObject }[] = codes.map(code => ({ event: 'UNCHECKED_CODE_ADD', metadata: { guildId: guildId.toString(), code } }))

        await container.prisma.invite.createMany({ data: inviteData, skipDuplicates: true })        
        await container.audits.createMany(auditData)

        if (!container.settings.read(guildId, 'inCheck'))
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

    public async update(guildId: bigint, code: string, expiresAt: Date, isPermanent: boolean, isValid: boolean) {
        await container.prisma.invite.update({
            data: { expiresAt, isPermanent, isValid, isChecked: true },
            where: { guildId_code: { guildId, code } }
        })
        await container.audits.create('UNCHECKED_CODE_UPDATE', { guildId: guildId.toString(), code, expiresAt: expiresAt?.toJSON(), isPermanent, isValid, isChecked: true })

        const uncheckedCodeCount = await container.prisma.invite.count({ where: { guildId, isChecked: false } })

        if (uncheckedCodeCount === 0)
            await container.settings.update(guildId, { inCheck: false })
    }
}