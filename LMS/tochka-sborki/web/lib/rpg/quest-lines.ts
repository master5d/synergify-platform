// web/lib/rpg/quest-lines.ts
import type { CharacterClass } from '@/lib/intake/types'
import { MODULE_SLUGS } from './modules'

const [K, INTRO, SETUP, STACK, PROMPT, CONTEXT, AUDIO, TOOLS, AGENT] = MODULE_SLUGS

// Each array is a permutation of all 9 slugs (soft reorder — nothing dropped).
export const QUEST_LINES: Record<CharacterClass, string[]> = {
  wanderer:  [...MODULE_SLUGS],
  healer:    [K, INTRO, SETUP, STACK, PROMPT, AUDIO, CONTEXT, TOOLS, AGENT],
  operator:  [K, SETUP, PROMPT, STACK, TOOLS, AUDIO, INTRO, CONTEXT, AGENT],
  mage:      [K, INTRO, PROMPT, STACK, CONTEXT, AGENT, TOOLS, AUDIO, SETUP],
  artificer: [K, SETUP, STACK, PROMPT, TOOLS, AUDIO, CONTEXT, AGENT, INTRO],
  sovereign: [K, INTRO, STACK, CONTEXT, AGENT, TOOLS, PROMPT, AUDIO, SETUP],
}
