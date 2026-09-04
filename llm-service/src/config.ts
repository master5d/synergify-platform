import type { ProseEnv } from './prose.js'
import type { SkinEnv } from './skin.js'
import type { DemandEnv } from './demand.js'

export interface ServiceEnv extends ProseEnv, SkinEnv, DemandEnv {
  API_TOKEN: string
  PORT: number
  fetchImpl?: typeof fetch
}

// Отсутствие адреса гейтвея или пустой токен — не «предупреждение», а причина не стартовать:
// первое даёт тихо неработающий сервис, второе — открытый наружу.
const REQUIRED = [
  'GATEWAY_URL', 'GATEWAY_API_KEY', 'API_TOKEN',
] as const

export function loadEnv(src: NodeJS.ProcessEnv): ServiceEnv {
  for (const k of REQUIRED) {
    if (!src[k] || !String(src[k]).trim()) {
      throw new Error(`${k} is required and must be non-empty`)
    }
  }
  return {
    GATEWAY_URL: String(src.GATEWAY_URL).replace(/\/$/, ''),
    GATEWAY_API_KEY: String(src.GATEWAY_API_KEY),
    API_TOKEN: String(src.API_TOKEN),
    POOL_PROSE: src.POOL_PROSE || 'google/gemini-3-flash-preview',
    POOL_SKIN: src.POOL_SKIN || 'reasoning',
    POOL_DEMAND_CLASSIFY: src.POOL_DEMAND_CLASSIFY || 'reasoning',
    POOL_DEMAND_BRIEF: src.POOL_DEMAND_BRIEF || 'google/gemini-3-flash-preview',
    PORT: Number(src.PORT || 4310),
  }
}
