import { chatJson, type GatewayEnv } from './gateway.js'
import { LlmError, BadRequestError } from './errors.js'
import { buildProsePrompt, LANGUAGE_RULES } from './prompts.js'
import type { ProseInput, ProseOut } from './types.js'

export interface ProseEnv extends GatewayEnv { POOL_PROSE: string }

const FIELDS = ['legendaryTitle', 'backstory', 'firstQuest', 'finalBoss'] as const

export async function generateProse(
  input: ProseInput, env: ProseEnv, fetchImpl?: typeof fetch,
): Promise<ProseOut> {
  // Незнакомый язык — ошибка ВЫЗЫВАЮЩЕГО, и отвечать на неё надо отказом, а не
  // догадкой модели: именно догадка выдала владельцу английский лист. Проверка
  // стоит ДО гейтвея — кривой промпт не должен стоить ни токена, ни 9 секунд.
  if (!LANGUAGE_RULES[input.language]) {
    throw new BadRequestError(`unknown language: ${input.language}`)
  }
  const raw = await chatJson({
    pool: env.POOL_PROSE, prompt: buildProsePrompt(input), env, fetchImpl,
  }) as Record<string, unknown>
  const missing = FIELDS.filter(f => typeof raw?.[f] !== 'string' || !(raw[f] as string).trim())
  if (missing.length) {
    // Пустое поле молча уехало бы в лист персонажа как пустая строка.
    throw new LlmError('bad_shape', `prose fields missing or empty: ${missing.join(', ')}`)
  }
  return {
    legendaryTitle: String(raw.legendaryTitle), backstory: String(raw.backstory),
    firstQuest: String(raw.firstQuest), finalBoss: String(raw.finalBoss),
  }
}
