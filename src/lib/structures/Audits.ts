import { AuditEvent, Prisma } from '@prisma/client'
import { container } from '@sapphire/framework'

export class Audits {
    public async create(userId: bigint, event: AuditEvent, metadata: object) {
        await container.prisma.audit.create({ data: { userId, event, metadata } })
    }

    public async createMany(data: { userId: bigint, event: AuditEvent, metadata: object }[]) {
        await container.prisma.audit.createMany({ data, skipDuplicates: true })
    }

    public async read(startTime: Date, endTime: Date) {
        const records = await container.prisma.audit.findMany({
            where: {
                timestamp: {
                    gte: startTime,
                    lte: endTime
                }
            }
        })

        return records        
    }
}