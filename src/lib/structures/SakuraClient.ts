import { TOKEN } from '#config'
import { Database } from '#structures'
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
            }),
		})	
	}

    public async setup() {
		container.database = new Database();	
		container.queue = new PQueue({
			concurrency: 4,
			interval: 2000,
		})

		await container.database.init();
    }

	public async start() {
		await this.setup()
		await super.login(TOKEN)
	}
}