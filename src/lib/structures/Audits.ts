import { AuditEvent, Prisma } from '@prisma/client'
import { container } from '@sapphire/framework'

export class Audits {
    public async create(event: AuditEvent, metadata: Prisma.JsonObject) {
        await container.prisma.audit.create({ data: { event, metadata } })
    }

    public async createMany(data: { event: AuditEvent, metadata: Prisma.JsonObject }[]) {
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