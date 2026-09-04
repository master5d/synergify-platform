export interface Env {
  DB: D1Database
  WORKER_JWT_SECRET: string
  SES_ACCESS_KEY_ID: string
  SES_SECRET_ACCESS_KEY: string
  SES_REGION?: string
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
  LLM_SERVICE_URL: string
  LLM_SERVICE_TOKEN: string
  LLM_CF_ACCESS_CLIENT_ID: string
  LLM_CF_ACCESS_CLIENT_SECRET: string
}

export interface JWTPayload {
  sub: string    // user_id
  email: string
  iat: number
  exp: number
}

// Перенесены из удалённого lib/demand-gemini.ts (Task 9) — теперь это форма
// ответа сервиса lms-llm, а не форма ответа Gemini напрямую.
export interface DemandClassification {
  classification: 'covered' | 'gap' | 'not_feasible' | 'unclassified'
  matched_module: string | null
  gap_topic_key: string | null
  gap_topic_label: { ru: string; en: string } | null
  feasibility_note: string | null
  value_tier: 'high' | 'normal'
}

export interface BriefProposal {
  proposed_type: 'module' | 'unit'
  title: { ru: string; en: string }
  learning_objective: string
  slot: string
  agentic_approach: string
  unit_count_estimate: number
  source_quotes: string[]
}
