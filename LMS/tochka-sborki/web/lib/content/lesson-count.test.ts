// Гвард числа уроков (intake LMS#16): тексты курса, которые называют число уроков/юнитов/шагов,
// обязаны совпадать с _meta.json. Поймано дважды одним классом: «Тишина» писала «шесть уроков»
// при восьми (реестр, роадмап, сертификат, экосистема), Точка Сборки — «28 юнитов» при 39 в ядре.
// Допустимо любое из: все уроки курса, уроки обязательной части (без OPTIONAL_MODULE_SLUGS),
// а в описании модуля — ещё и уроки этого модуля.
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { PACK_DIR, PACK_SLUG } from '../pack'
import { OPTIONAL_MODULE_SLUGS } from '../rpg/modules'

type Locale = 'ru' | 'en'

const NUM: Record<string, number> = {
  один: 1, одна: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5, шесть: 6, семь: 7, восемь: 8,
  девять: 9, десять: 10, одиннадцать: 11, двенадцать: 12,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
}
const COUNT_RE = /(\d+|[а-яёa-z]+)\s+(?:урок|юнит|шаг|lesson|unit|step)/giu

function claims(text: string): number[] {
  const out: number[] = []
  for (const m of text.matchAll(COUNT_RE)) {
    const tok = m[1].toLowerCase()
    const n = /^\d+$/.test(tok) ? Number(tok) : NUM[tok]
    if (n !== undefined) out.push(n)
  }
  return out
}

interface ModuleMeta { slug: string; units: number; description: string }

function modules(locale: Locale): ModuleMeta[] {
  const dir = join(PACK_DIR, 'content', locale)
  const out: ModuleMeta[] = []
  for (const slug of readdirSync(dir)) {
    const meta = join(dir, slug, '_meta.json')
    if (!existsSync(meta)) continue
    const j = JSON.parse(readFileSync(meta, 'utf8')) as { units?: unknown[]; description?: string }
    out.push({ slug, units: (j.units ?? []).length, description: j.description ?? '' })
  }
  return out
}

function counts(locale: Locale) {
  const ms = modules(locale)
  const optional = OPTIONAL_MODULE_SLUGS as readonly string[]
  return {
    total: ms.reduce((s, m) => s + m.units, 0),
    core: ms.filter((m) => !optional.includes(m.slug)).reduce((s, m) => s + m.units, 0),
  }
}

const ru = counts('ru')
const ALLOWED = new Set([ru.total, ru.core])

function assertClaims(where: string, text: string, allowed: Set<number>) {
  for (const n of claims(text)) {
    expect(allowed.has(n), `${where}: написано «${n}», а уроков ${ru.total} (обязательных ${ru.core})`).toBe(true)
  }
}

describe(`lesson counts in course texts match _meta.json (${PACK_SLUG})`, () => {
  it('both locales have the same lessons', () => {
    expect(counts('en')).toEqual(ru)
  })

  it('registry tagline', () => {
    const reg = JSON.parse(readFileSync(join(process.cwd(), '..', '..', 'registry.json'), 'utf8')) as {
      courses: { slug: string; tagline: Record<Locale, string> }[]
    }
    const me = reg.courses.find((c) => c.slug === PACK_SLUG)
    if (!me) return
    for (const l of ['ru', 'en'] as const) assertClaims(`LMS/registry.json tagline.${l}`, me.tagline[l], ALLOWED)
  })

  it('certificate and ecosystem', () => {
    for (const f of ['course/certificate.ts', 'course/ecosystem.ts']) {
      const p = join(PACK_DIR, f)
      if (existsSync(p)) assertClaims(f, readFileSync(p, 'utf8'), ALLOWED)
    }
  })

  it('roadmap description', () => {
    for (const l of ['ru', 'en'] as const) {
      const p = join(PACK_DIR, 'content', l, 'roadmap.mdx')
      if (!existsSync(p)) continue
      const d = readFileSync(p, 'utf8').match(/^description:\s*"(.*)"/m)?.[1]
      if (d) assertClaims(`content/${l}/roadmap.mdx`, d, ALLOWED)
    }
  })

  it('module descriptions', () => {
    for (const l of ['ru', 'en'] as const) {
      for (const m of modules(l)) {
        assertClaims(`content/${l}/${m.slug}/_meta.json`, m.description, new Set([...ALLOWED, m.units]))
      }
    }
  })
})
