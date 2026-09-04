import { chatJson, type GatewayEnv } from './gateway.js'
import { LlmError } from './errors.js'
import { buildSkinPrompt } from './prompts.js'
import { WORLD_SKINS, type WorldSkin } from './types.js'

export interface SkinEnv extends GatewayEnv { POOL_SKIN: string }

export async function classifySkin(
  film: string, env: SkinEnv, fetchImpl?: typeof fetch,
): Promise<WorldSkin> {
  const raw = await chatJson({
    pool: env.POOL_SKIN, prompt: buildSkinPrompt(film, WORLD_SKINS), env, fetchImpl,
  }) as Record<string, unknown>
  const skin = String(raw?.skin ?? '').trim().toLowerCase()
  if (!(WORLD_SKINS as readonly string[]).includes(skin)) {
    // Выдуманный скин ушёл бы в D1 и сломал бы рендер листа.
    throw new LlmError('bad_shape', `skin "${skin}" is not in the allowed set`)
  }
  return skin as WorldSkin
}
