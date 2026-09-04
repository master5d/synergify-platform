import { chatJson, type GatewayEnv } from './gateway.js'
import { LlmError } from './errors.js'
import { buildDemandClassifyPrompt, buildBriefPrompt } from './prompts.js'
import type { CatalogEntry, Signal, DemandClassification, BriefProposal } from './types.js'

export interface DemandEnv extends GatewayEnv {
  POOL_DEMAND_CLASSIFY: string; POOL_DEMAND_BRIEF: string
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function isNonEmptyBilingualLabel(v: unknown): v is { ru: string; en: string } {
  return typeof v === 'object' && v !== null &&
    isNonEmptyString((v as any).ru) && isNonEmptyString((v as any).en)
}

function isStringOrNull(v: unknown): v is string | null {
  return v === null || typeof v === 'string'
}

export async function classifyDemand(
  signals: Signal[], catalog: CatalogEntry[], env: DemandEnv, fetchImpl?: typeof fetch,
): Promise<DemandClassification[]> {
  if (!signals.length) return []
  const raw = await chatJson({
    pool: env.POOL_DEMAND_CLASSIFY,
    prompt: buildDemandClassifyPrompt(signals, catalog), env, fetchImpl,
  }) as Record<string, unknown>
  const items = raw?.items
  if (!Array.isArray(items) || items.length !== signals.length) {
    // Несовпадение длины = ответы разъедутся по строкам, и это тихо.
    throw new LlmError('bad_shape',
      `expected ${signals.length} items, got ${Array.isArray(items) ? items.length : 'non-array'}`)
  }

  // Валидируем каждый элемент по типам.
  const classifications = ['covered', 'gap', 'not_feasible', 'unclassified']
  const valueTiers = ['high', 'normal']
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as any
    if (!classifications.includes(item?.classification)) {
      throw new LlmError('bad_shape', `item[${i}].classification "${item?.classification}" is not in [covered|gap|not_feasible|unclassified]`)
    }
    if (!valueTiers.includes(item?.value_tier)) {
      throw new LlmError('bad_shape', `item[${i}].value_tier "${item?.value_tier}" is not in [high|normal]`)
    }
    if (!isStringOrNull(item?.matched_module)) {
      throw new LlmError('bad_shape', `item[${i}].matched_module must be string or null, got ${typeof item?.matched_module}`)
    }
    if (!isStringOrNull(item?.gap_topic_key)) {
      throw new LlmError('bad_shape', `item[${i}].gap_topic_key must be string or null, got ${typeof item?.gap_topic_key}`)
    }
    if (!isStringOrNull(item?.feasibility_note)) {
      throw new LlmError('bad_shape', `item[${i}].feasibility_note must be string or null, got ${typeof item?.feasibility_note}`)
    }
    if (item?.gap_topic_label !== null && !isNonEmptyBilingualLabel(item?.gap_topic_label)) {
      throw new LlmError('bad_shape', `item[${i}].gap_topic_label must be null or {ru, en} with non-empty strings`)
    }
  }
  return items as DemandClassification[]
}

export async function draftBrief(
  topicLabel: { ru: string; en: string }, quotes: string[], catalog: CatalogEntry[],
  env: DemandEnv, fetchImpl?: typeof fetch,
): Promise<BriefProposal> {
  const raw = await chatJson({
    pool: env.POOL_DEMAND_BRIEF,
    prompt: buildBriefPrompt(topicLabel, quotes, catalog), env, fetchImpl,
  }) as Record<string, unknown>

  // Валидируем каждое поле по типам.
  // М-1: нормализованное значение — не raw.proposed_type — идёт и в проверку, и в возврат,
  // иначе неочищенное " module " уезжало бы в D1 мимо валидации.
  const proposedType = String(raw?.proposed_type ?? '').trim()
  const proposedTypes = ['module', 'unit']
  if (!proposedTypes.includes(proposedType)) {
    throw new LlmError('bad_shape', `proposed_type must be "module" or "unit", got "${raw?.proposed_type}"`)
  }
  if (!isNonEmptyBilingualLabel(raw?.title)) {
    throw new LlmError('bad_shape', 'title must be {ru, en} with non-empty strings')
  }
  if (!isNonEmptyString(raw?.learning_objective)) {
    throw new LlmError('bad_shape', `learning_objective must be non-empty string, got "${raw?.learning_objective}"`)
  }
  if (!isNonEmptyString(raw?.slot)) {
    throw new LlmError('bad_shape', `slot must be non-empty string, got "${raw?.slot}"`)
  }
  if (!isNonEmptyString(raw?.agentic_approach)) {
    throw new LlmError('bad_shape', `agentic_approach must be non-empty string, got "${raw?.agentic_approach}"`)
  }
  // М-1: Number.isFinite пропускал 2.5 и -3 — промпт требует целое положительное число.
  if (!Number.isInteger(raw?.unit_count_estimate) || (raw!.unit_count_estimate as number) <= 0) {
    throw new LlmError('bad_shape', `unit_count_estimate must be a positive integer, got ${raw?.unit_count_estimate}`)
  }
  if (!Array.isArray(raw?.source_quotes)) {
    throw new LlmError('bad_shape', `source_quotes must be array, got ${typeof raw?.source_quotes}`)
  }
  // Валидируем каждый элемент массива: каждый должен быть непустой строкой.
  for (let i = 0; i < (raw.source_quotes as any[]).length; i++) {
    const quote = (raw.source_quotes as any)[i]
    if (!isNonEmptyString(quote)) {
      throw new LlmError('bad_shape', `source_quotes[${i}] must be non-empty string, got ${typeof quote}`)
    }
  }
  // М-1: возвращаем нормализованное proposed_type, а не raw целиком.
  return { ...(raw as unknown as BriefProposal), proposed_type: proposedType as BriefProposal['proposed_type'] }
}
