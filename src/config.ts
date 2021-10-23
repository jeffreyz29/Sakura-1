export const ENVIRONMENT = process.env.ENVIRONMENT ?? 'development'
export const GUILD_ID = BigInt(process.env.GUILD_ID ?? 0)
export const INVITE_CHECK_COOLDOWN = Number(process.env.INVITE_CHECK_COOLDOWN ?? 0)
export const SUPPORT_SERVER_CODE = process.env.SUPPORT_SERVER_CODE
export const TOKEN = process.env.TOKEN