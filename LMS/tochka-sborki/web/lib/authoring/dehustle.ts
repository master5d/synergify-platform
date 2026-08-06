// lib/authoring/dehustle.ts
// Executable de-hustle lint: strips profit-first / scarcity / sales / avatar framing
// (reverse-engineered from the APM challenge, then DE-HUSTLED). Authenticity-sacred.
import type { CourseOutline } from './outline'

// Case-insensitive markers. EN uses word boundaries (ASCII); RU uses plain substrings
// (\b is unreliable around Cyrillic in JS RegExp).
const BANNED: RegExp[] = [
  /limited time/i, /act now/i, /only \d+ spots?/i, /spots? left/i,
  /buyer avatar/i, /customer avatar/i, /sales funnel/i, /passive income/i,
  /6-?figure/i, /six-?figure/i, /\bguru\b/i, /\bupsell\b/i, /\bhustle\b/i,
  /\bscarcity\b/i, /\bfomo\b/i,
  /успей/i, /осталось мест/i, /ограниченное предложение/i, /аватар клиента/i,
  /воронк[аи] продаж/i, /инфобизнес/i, /пассивный доход/i, /гуру/i, /допродаж/i,
]

/** Banned marketing terms found in one string (lowercased matches). */
export function lintDehustle(text: string): string[] {
  const found: string[] = []
  for (const re of BANNED) {
    const m = re.exec(text)
    if (m) found.push(m[0].toLowerCase())
  }
  return found
}

/** Scans every Bi field of an outline (ru + en); returns the deduplicated union. */
export function lintOutlineDehustle(o: CourseOutline): string[] {
  const hits = new Set<string>()
  const scan = (s: string) => { for (const t of lintDehustle(s)) hits.add(t) }
  scan(o.name.ru); scan(o.name.en)
  for (const m of o.modules) {
    scan(m.title.ru); scan(m.title.en); scan(m.description.ru); scan(m.description.en)
    for (const u of m.units) {
      scan(u.title.ru); scan(u.title.en); scan(u.objective.ru); scan(u.objective.en)
    }
  }
  return [...hits]
}
