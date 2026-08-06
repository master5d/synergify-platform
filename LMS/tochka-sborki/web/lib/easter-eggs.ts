// web/lib/easter-eggs.ts
// Seasonal / event-driven easter-egg infra. Pure + date-driven: a flourish (glyph + label)
// becomes active for an MM-DD range, surfaced minimally (e.g. the nav brand glyph). Add an
// entry to EASTER_EGGS to schedule a new one — no per-asset wiring needed.

export interface EasterEgg {
  id: string
  /** Inclusive MM-DD bounds. If from > to, the range wraps the year end (e.g. New Year). */
  from: string // 'MM-DD'
  to: string   // 'MM-DD'
  glyph: string
  label: { ru: string; en: string }
}

export const EASTER_EGGS: EasterEgg[] = [
  { id: 'new-year', from: '12-25', to: '01-07', glyph: '❄️', label: { ru: 'С наступающим — пусть собирается легко', en: 'Happy New Year — may it assemble easily' } },
  { id: 'cosmonautics', from: '04-12', to: '04-12', glyph: '🚀', label: { ru: 'День космонавтики — поехали', en: "Cosmonautics Day — let's go" } },
  { id: 'spring-equinox', from: '03-20', to: '03-21', glyph: '🌱', label: { ru: 'Равноденствие — новый виток', en: 'Equinox — a new turn' } },
]

const mmdd = (d: Date): string =>
  `${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`

function inRange(today: string, from: string, to: string): boolean {
  // Same-year range: from <= today <= to. Wrapping range (from > to): today >= from OR today <= to.
  return from <= to ? today >= from && today <= to : today >= from || today <= to
}

/** The easter egg active on `date` (UTC), or null on an ordinary day. First match wins. */
export function activeEasterEgg(date: Date = new Date()): EasterEgg | null {
  const today = mmdd(date)
  return EASTER_EGGS.find(e => inRange(today, e.from, e.to)) ?? null
}
