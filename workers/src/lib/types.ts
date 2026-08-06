export interface Env {
  DB: D1Database
  WORKER_JWT_SECRET: string
  SES_ACCESS_KEY_ID: string
  SES_SECRET_ACCESS_KEY: string
  SES_REGION?: string
  GEMINI_API_KEY: string
  OWNER_EMAIL: string
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_WEBHOOK_SECRET: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  GOOGLE_OAUTH_CLIENT_ID: string
  GOOGLE_OAUTH_CLIENT_SECRET: string
  LISTMONK_URL: string
  LISTMONK_API_USER: string
  LISTMONK_API_TOKEN: string
  CF_ACCESS_CLIENT_ID: string
  CF_ACCESS_CLIENT_SECRET: string
  LISTMONK_CRM_LIST_ID: string
}

export interface JWTPayload {
  sub: string    // user_id
  email: string
  iat: number
  exp: number
}
