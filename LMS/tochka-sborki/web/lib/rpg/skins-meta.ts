import type { WorldSkin } from './types'
import type { Locale } from '../intake/types'
// Course data lives in lib/course/skins.ts. Re-exported here so consumers (and workers,
// which cross-import this module via a relative path) keep the same public API. The import
// path stays RELATIVE — workers tsc can't resolve the @/ alias (Gotcha 2).
import { SKINS_META } from '../course/skins'

export { SKINS_META }

/** One-line intro of the skin's familiar/sidekick («Machine Elves»), or null if none. */
export function skinCompanion(skin: WorldSkin, locale: Locale): string | null {
  const c = SKINS_META[skin]?.companion
  if (!c) return null
  return locale === 'en'
    ? `Companion — ${c.glyph} ${c.name.en}: ${c.vibe.en}.`
    : `Спутник — ${c.glyph} ${c.name.ru}: ${c.vibe.ru}.`
}

export function skinDecoder(skin: WorldSkin, locale: Locale): string {
  const meta = SKINS_META[skin]
  if (meta?.decoder) return meta.decoder[locale]
  // fallback для будущих скинов без явного decoder
  const name = meta?.displayName[locale] ?? skin
  const mentor = meta?.mentor?.name[locale]
  return locale === 'en'
    ? `Your world is ${name}: it's just styling — underneath is a normal course${mentor ? `; your mentor is ${mentor}` : ''}.`
    : `Твой мир — ${name}: это лишь оформление, под ним обычный курс${mentor ? `, наставник — ${mentor}` : ''}.`
}
