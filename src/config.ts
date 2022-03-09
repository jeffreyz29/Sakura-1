export const ENVIRONMENT = process.env.ENVIRONMENT ?? 'development'
export const INVITE_CHECK_COOLDOWN = Number(process.env.INVITE_CHECK_COOLDOWN ?? 0)
export const REDIS_DB = Number(process.env.REDIS_DB)
export const REDIS_HOST = process.env.REDIS_HOST
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD
export const REDIS_PORT = Number(process.env.REDIS_PORT)
export const TOKEN = process.env.TOKEN