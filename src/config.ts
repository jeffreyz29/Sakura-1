export const ENVIRONMENT = process.env.ENVIRONMENT ?? 'development'
export const INVITE_CHECK_COOLDOWN = Number(process.env.INVITE_CHECK_COOLDOWN ?? 0)
export const PGCRYPTO_KEY = process.env.PGCRYPTO_KEY!
export const TOKEN = process.env.TOKEN!