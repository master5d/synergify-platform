import { chatJson, type GatewayEnv } from './gateway.js'
import { LlmError, BadRequestError } from './errors.js'
import { buildInterestExamplePrompt, LANGUAGE_RULES } from './prompts.js'
import { INTERESTS, type Interest } from './types.js'

// Пример из интереса ученика в концепт-фазе (intake LMS#8).
// Спека: lms-engine docs/superpowers/specs/2026-09-28-interest-example.md

export interface InterestEnv extends GatewayEnv { POOL_INTEREST: string }

export interface InterestExampleInput { source: string; interest: string; language: string }

/** Свой потолок: воркер ждёт этот вызов в waitUntil 25 с, общий 90 с здесь бы его пережил. */
export const INTEREST_TIMEOUT_MS = 20_000
/** Пересказ, а не сочинение: ниже температура — меньше выдумки поверх исходника. */
export const INTEREST_TEMPERATURE = 0.4
export const MAX_SOURCE_CHARS = 2000

export async function rewriteExample(
  input: InterestExampleInput, env: InterestEnv, fetchImpl?: typeof fetch,
): Promise<{ example: string }> {
  // Все отказы вызывающего — ДО гейтвея: кривой запрос не должен стоить ни токена.
  if (!LANGUAGE_RULES[input?.language]) throw new BadRequestError(`unknown language: ${input?.language}`)
  if (!(INTERESTS as readonly string[]).includes(input?.interest)) {
    // Свободный текст интереса сделал бы кэш бесконечным, а промпт — открытым для инъекций.
    throw new BadRequestError(`unknown interest: ${input?.interest}`)
  }
  const source = typeof input?.source === 'string' ? input.source.trim() : ''
  if (!source) throw new BadRequestError('source must be a non-empty string')
  if (source.length > MAX_SOURCE_CHARS) throw new BadRequestError(`source longer than ${MAX_SOURCE_CHARS} chars`)

  const raw = await chatJson({
    pool: env.POOL_INTEREST,
    prompt: buildInterestExamplePrompt(source, input.interest as Interest, input.language),
    env, fetchImpl, timeoutMs: INTEREST_TIMEOUT_MS, temperature: INTEREST_TEMPERATURE,
  }) as Record<string, unknown>
  const example = typeof raw?.example === 'string' ? raw.example.trim() : ''
  if (!example) throw new LlmError('bad_shape', 'example missing or empty')
  // Только форма. Смысловой гвард (цифры, код, манифест) живёт в воркере — одно место правила.
  if (example.length > source.length * 3) throw new LlmError('bad_shape', 'example is far longer than the source')
  return { example }
}
