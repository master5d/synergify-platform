import { chatJson, type GatewayEnv } from './gateway.js'
import { LlmError } from './errors.js'
import { buildDemandClassifyPrompt, buildBriefPrompt } from './prompts.js'
import type { CatalogEntry, Signal, DemandClassification, BriefProposal } from './types.js'

export interface DemandEnv extends GatewayEnv {
  POOL_DEMAND_CLASSIFY: string; POOL_DEMAND_BRIEF: string
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
  for (const f of ['proposed_type', 'title', 'learning_objective', 'slot', 'agentic_approach']) {
    if (raw?.[f] == null) throw new LlmError('bad_shape', `brief field missing: ${f}`)
  }
  return raw as unknown as BriefProposal
}
