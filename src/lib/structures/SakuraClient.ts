import { TOKEN } from '#config'
import { Audits, Invites, Schedules, Settings, TaskStore } from '#structures'
import Prisma from '@prisma/client'
import { container, SapphireClient } from '@sapphire/framework'
import { Intents, Options } from 'discord.js'
import PQueue from 'p-queue'

export class SakuraClient extends SapphireClient {
	public constructor() {
		super({
			allowedMentions: {
				parse: ['users'],
				repliedUser: false
			},
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MESSAGES
			],
			loadDefaultErrorListeners: false,
            makeCache: Options.cacheWithLimits({
                BaseGuildEmojiManager: 0,
                GuildBanManager: 0,
                GuildInviteManager: 0,
                GuildStickerManager: 0,
                MessageManager: 15,
                PresenceManager: 0,
                ReactionManager: 0,
                ReactionUserManager: 0,
                StageInstanceManager: 0,
                ThreadManager: 0,
                ThreadMemberManager: 0,
                VoiceStateManager: 0
            })
		})	
	}

    public async setup() {
		container.audits = new Audits()
		container.invites = new Invites()
		container.prisma = new Prisma.PrismaClient()
		container.queue = new PQueue({ autoStart: true, concurrency: 1, interval: 1250, intervalCap: 1 })
		container.schedules = new Schedules()
		container.settings = new Settings()
		container.stores.register(new TaskStore())
    }

	public async start() {
		await this.setup()
		await super.login(TOKEN)
	}
}