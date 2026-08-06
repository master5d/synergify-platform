// packs/living-practice/course/skins.ts — course data: themed world skins.
// В этом pack'е живёт ОДИН скин — wanderer (нейтральный). Тип остаётся полным
// Record через cast: движок ходит в SKINS_META с optional chaining, а intake
// этого курса не раздаёт других скинов. Imports stay RELATIVE (workers tsc).
import type { SkinMeta, WorldSkin } from '../../../lib/rpg/types'

export const SKINS_META: Record<WorldSkin, SkinMeta> = {
  'wanderer': { skin: 'wanderer', accent: '#00d1ff', glyph: '🌀', displayName: { ru: 'Странник', en: 'Wanderer' }, mentor: { name: { ru: 'Проводник', en: 'Guide' }, glyph: '🧭' }, companion: { name: { ru: 'Огонёк', en: 'Wisp' }, glyph: '✨', vibe: { ru: 'тихий огонёк, что светит на шаг вперёд', en: 'a quiet wisp lighting one step ahead' } }, decoder: { ru: 'Твой мир — Странник: спокойный нейтральный стиль, наставник — Проводник. Под ним — обычный курс, без лишней мишуры.', en: "Your world is Wanderer: a calm, neutral style, your mentor is the Guide. Underneath is a normal course, with no extra frills." } },
} as Record<WorldSkin, SkinMeta>
