// lib/authoring/dehustle.ts
// Executable de-hustle lint: strips profit-first / scarcity / sales / avatar framing.
// Перенесён из LMS вместе с курсом скорочтения (без outline-обвязки — у академии
// нет CourseOutline). Authenticity-sacred.

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
