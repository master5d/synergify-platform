import { describe, it, expect } from 'vitest'
import { buildLearnPrompt, buildBootstrapDeepLink, agentUrl, MAX_BOOTSTRAP, PRACTICE_RULES } from './learn-prompt'
import { PACK_SLUG } from './pack'
import { COURSE } from './course'
import { COMPANION } from './course/companion'
import { REFERENCE_RULES, unitReference } from './learn-prompt-reference'
import { PRACTICE_REFERENCES } from './course/practice-references'
import { normalizeErrorStyle } from './intake/relational-style'
import { getAllModules, getModuleMeta } from './content'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const base = {
  locale: 'ru' as const,
  moduleTitle: 'Промпт-инжиниринг',
  unitIndex: 1,
  totalUnits: 3,
}

// Формулировки компаньона — данные курса (packs/<pack>/course/companion.ts), поэтому
// содержательные проверки привязаны к своему pack'у; общие инварианты — ниже, для любого.
const TS = PACK_SLUG === 'tochka-sborki'
const LP = PACK_SLUG === 'living-practice'

describe.runIf(TS)('buildLearnPrompt (tochka-sborki)', () => {
  it('embeds co-thinking identity, Kolb, bisociation, and the 5-step loop', () => {
    const p = buildLearnPrompt(base)
    expect(p).toContain('co-thinking')
    expect(p).toMatch(/Колб/)
    expect(p).toMatch(/бисоциаци/)
    expect(p).toContain('intent')
    expect(p).toContain('системное мышление')
    expect(p).toContain('дизайн-мышление')
    expect(p).toContain('todo')
    expect(p).toContain('юнит 2 из 3')
  })

  it('fills profile slots when present (skin, mentor, niche, outcome)', () => {
    const p = buildLearnPrompt({ ...base, skinName: 'Кибер-Нуар', mentorName: 'Фиксер', niche: 'coach', outcome: 'выйти на первых клиентов' })
    expect(p).toContain('«Кибер-Нуар»')
    expect(p).toContain('Фиксер')
    expect(p).toContain('коучинг')
    expect(p).toContain('выйти на первых клиентов')
  })

  it('mode changes the scaffolding directive', () => {
    const cmd = buildLearnPrompt({ ...base, mode: 'commander' })
    const arch = buildLearnPrompt({ ...base, mode: 'archmage' })
    expect(cmd).toMatch(/максимум опор/)
    expect(arch).toMatch(/Минимум опор/)
    expect(cmd).not.toEqual(arch)
  })

  it('attaches the applied challenge when given', () => {
    const p = buildLearnPrompt({ ...base, appliedChallenge: 'Собери промпт под свою задачу.' })
    expect(p).toContain('Собери промпт под свою задачу.')
  })

  it('produces an English variant', () => {
    const p = buildLearnPrompt({ ...base, locale: 'en', mode: 'copilot' })
    expect(p).toContain('co-think')
    expect(p).toContain('Kolb')
    expect(p).toMatch(/unit 2 of 3/)
  })

  it('adds a bonding directive from the relational style (без MBTI)', () => {
    const p = buildLearnPrompt({ ...base, relational: { rhythm: 'suave', errorStyle: 'soft_feedback', anchor: 'support', attention: 'short' } })
    expect(p).toMatch(/мягк/i)        // soft feedback → gentle correction
    expect(p).toMatch(/корот|3–5|мелк/) // short attention → short turns
  })

  it('omits the bonding block entirely when absent', () => {
    const p = buildLearnPrompt(base)
    expect(p).not.toContain('MBTI')
  })
})

describe.runIf(TS)('buildBootstrapDeepLink (tochka-sborki)', () => {
  it('is compact (≤1500 chars) and carries co-thinking + module + the loop', () => {
    const p = buildBootstrapDeepLink({ ...base, skinName: 'Кибер-Нуар', mentorName: 'Фиксер' })
    expect(p.length).toBeLessThanOrEqual(1500)
    expect(p).toMatch(/со-мышл|co-think/i)
    expect(p).toContain('Промпт-инжиниринг')
    expect(p).toContain('Фиксер')
    expect(p).toMatch(/намерени|intent/i)
  })

  it('caps a long outcome so the URL stays bounded', () => {
    const long = 'цель '.repeat(400) // ~2000 chars
    const p = buildBootstrapDeepLink({ ...base, outcome: long })
    expect(p.length).toBeLessThanOrEqual(1500)
    expect(p).toContain('…')
  })

  it('produces an English variant', () => {
    const p = buildBootstrapDeepLink({ ...base, locale: 'en' })
    expect(p).toMatch(/co-think/i)
    expect(p).toMatch(/intent/i)
  })
})

describe('agentUrl', () => {
  it('builds chatgpt and claude deep-links with the prompt url-encoded', () => {
    expect(agentUrl('chatgpt', 'a b')).toBe('https://chatgpt.com/?q=a%20b')
    expect(agentUrl('claude', 'a b')).toBe('https://claude.ai/new?q=a%20b')
  })
})

describe.runIf(TS)('anti-sycophancy contract (tochka-sborki)', () => {
  it('buildLearnPrompt carries the firmness contract (ru + en)', () => {
    expect(buildLearnPrompt(base)).toMatch(/льст/)
    expect(buildLearnPrompt({ ...base, locale: 'en' })).toMatch(/flatter/)
  })

  it('buildBootstrapDeepLink carries the compact clause and stays within the cap', () => {
    const ru = buildBootstrapDeepLink(base)
    const en = buildBootstrapDeepLink({ ...base, locale: 'en' })
    expect(ru).toMatch(/льст/)
    expect(en).toMatch(/flatter/)
    expect(ru.length).toBeLessThanOrEqual(1500)
    expect(en.length).toBeLessThanOrEqual(1500)
  })
})

// Инвариант шва (intake LMS#16): компаньон говорит от имени АКТИВНОГО курса и никогда —
// от имени чужого. До фикса «Тишина» отдавала своим студентам промпт «курс „Точка Сборки“».
describe('companion belongs to the active course (any pack)', () => {
  it('names the active course, and a non-default course never names «Точка Сборки»', () => {
    const p = buildLearnPrompt(base)
    const b = buildBootstrapDeepLink(base)
    expect(p).toContain(COURSE.name)
    expect(b).toContain(COURSE.name)
    if (!TS) {
      expect(p).not.toContain('Точка Сборки')
      expect(b).not.toContain('Точка Сборки')
      expect(buildLearnPrompt({ ...base, locale: 'en' })).not.toContain('Точка Сборки')
      expect(buildBootstrapDeepLink({ ...base, locale: 'en' })).not.toContain('Точка Сборки')
    }
  })

  it('bootstrap stays within the URL cap in both locales', () => {
    expect(buildBootstrapDeepLink(base).length).toBeLessThanOrEqual(1500)
    expect(buildBootstrapDeepLink({ ...base, locale: 'en' }).length).toBeLessThanOrEqual(1500)
  })
})

describe.runIf(LP)('living-practice companion keeps the boundaries the course promises', () => {
  it('carries the prohibitions from u1/u3/u5/u7 (ru + en)', () => {
    const ru = buildLearnPrompt(base)
    expect(ru).toMatch(/диагноз/)
    expect(ru).toMatch(/кризисн/)
    expect(ru).toMatch(/дольше|интенсивн/)
    expect(ru).toMatch(/травм/)
    expect(ru).toMatch(/по инерции согласишься/)
    const en = buildLearnPrompt({ ...base, locale: 'en' })
    expect(en).toMatch(/diagnos/)
    expect(en).toMatch(/crisis/)
    expect(en).toMatch(/longer|intense/)
    expect(en).toMatch(/trauma/)
  })

  it('ignores the vibe-coding questionnaire profile entirely', () => {
    const p = buildLearnPrompt({
      ...base,
      skinName: 'Кибер-Нуар', mentorName: 'Фиксер', niche: 'coach', outcome: 'выйти на первых клиентов',
      appliedChallenge: 'Собери промпт под свою задачу.', mode: 'commander', mbti: 'INFP',
    } as Parameters<typeof buildLearnPrompt>[0])
    for (const leak of ['Кибер-Нуар', 'Фиксер', 'коучинг', 'выйти на первых клиентов', 'Собери промпт', 'опор', 'INFP', 'Колб', 'todo']) {
      expect(p, leak).not.toContain(leak)
    }
  })

  it('bootstrap carries the core prohibitions and no profile', () => {
    const b = buildBootstrapDeepLink({ ...base, mentorName: 'Фиксер', outcome: 'выйти на первых клиентов' })
    expect(b).toMatch(/диагноз/)
    expect(b).toMatch(/кризисн/)
    expect(b).not.toContain('Фиксер')
    expect(b).not.toContain('выйти на первых клиентов')
  })
})

// Режим «Помоги мне практиковаться» (intake LMS#18): правила движка, поверх любого курса.
describe('practice mode (any pack)', () => {
  const practice = { ...base, studyMode: 'practice' as const }

  it('learn mode is unchanged by default and carries no practice rules', () => {
    expect(buildLearnPrompt({ ...base, studyMode: 'learn' })).toBe(buildLearnPrompt(base))
    expect(buildBootstrapDeepLink({ ...base, studyMode: 'learn' })).toBe(buildBootstrapDeepLink(base))
    expect(buildLearnPrompt(base)).not.toMatch(/сократическ/i)
    expect(buildBootstrapDeepLink(base)).not.toMatch(/Режим практики/)
  })

  it('full prompt carries Socratic questions, stepwise hints and the self-check rule (ru)', () => {
    const p = buildLearnPrompt(practice)
    expect(p).toContain(PRACTICE_RULES.heading.ru)
    expect(p).toMatch(/Не давай готовый ответ/)
    expect(p).toMatch(/сократические вопросы/)
    expect(p).toMatch(/подсказывай по шагам/)
    expect(p).toMatch(/«Проверь себя».*не называй правильный вариант/)
    expect(p).toMatch(/только после того, как я ответил сам/)
    expect(p).toContain(COURSE.name) // остаётся промптом своего курса
  })

  it('full prompt carries the same rules in English', () => {
    const p = buildLearnPrompt({ ...practice, locale: 'en' })
    expect(p).toContain('"Help me practice" mode')
    expect(p).toMatch(/Socratic questions/)
    expect(p).toMatch(/hint step by step/)
    expect(p).toMatch(/"Check yourself".*never name the correct option/)
    expect(p).toMatch(/only after I have answered on my own/)
  })

  it('practice rules come before the opener, after the course boundaries', () => {
    const p = buildLearnPrompt(practice)
    expect(p.indexOf(PRACTICE_RULES.heading.ru)).toBeGreaterThan(p.indexOf(COURSE.name))
    expect(p.endsWith(COMPANION.opener.ru)).toBe(true)
    expect(p.indexOf(PRACTICE_RULES.heading.ru)).toBeLessThan(p.indexOf(COMPANION.opener.ru))
  })

  it('bootstrap carries the compact practice clause in both locales', () => {
    const ru = buildBootstrapDeepLink(practice)
    const en = buildBootstrapDeepLink({ ...practice, locale: 'en' })
    expect(ru).toMatch(/Режим практики: не давай готовый ответ/)
    expect(ru).toMatch(/сократические вопросы/)
    expect(ru).toMatch(/«Проверь себя».*не называй правильный вариант/)
    expect(en).toMatch(/Practice mode: do not give the finished answer/)
    expect(en).toMatch(/"Check yourself".*never name the correct option/)
    expect(ru).toContain(COURSE.name)
  })

  it('bootstrap stays within MAX_BOOTSTRAP and keeps the practice clause even with a huge profile', () => {
    const long = 'цель '.repeat(400)
    for (const locale of ['ru', 'en'] as const) {
      const b = buildBootstrapDeepLink({ ...practice, locale, outcome: long, moduleTitle: 'М'.repeat(2000), mentorName: 'Фиксер', skinName: 'Кибер-Нуар', niche: 'coach' })
      expect(b.length).toBeLessThanOrEqual(MAX_BOOTSTRAP)
      expect(b).toContain(PRACTICE_RULES.compact[locale].trim().slice(0, 40))
      // prefill-ссылка: тот же лимит, что у режима «Учиться» (кап до encodeURIComponent)
      expect(decodeURIComponent(agentUrl('claude', b).split('?q=')[1])).toBe(b)
    }
    expect(buildBootstrapDeepLink(practice).length).toBeLessThanOrEqual(MAX_BOOTSTRAP)
    expect(buildBootstrapDeepLink({ ...practice, locale: 'en' }).length).toBeLessThanOrEqual(MAX_BOOTSTRAP)
  })
})

// Педагогика 5 и «риски» (intake LMS#20): защита от «ИИ сделал за меня» и MBTI вне правил обучения.
describe('companion guard: no ready-made fix, reference hidden, no MBTI (any pack)', () => {
  const ref = {
    keyPoints: ['Что остаётся за человеком? → Замысел и решение. ЭТАЛОН-МАРКЕР-42'],
    solution: 'Промпт по CTID, все пять разделов. ЭТАЛОН-МАРКЕР-43',
    mistakes: ['Задача размыта. ЭТАЛОН-МАРКЕР-44'],
  }
  type In = Parameters<typeof buildLearnPrompt>[0]

  it('source carries no «ready fix» branch', () => {
    const src = readFileSync(join(process.cwd(), 'lib', 'learn-prompt.ts'), 'utf8')
    expect(src).not.toMatch(/точную правку|exact fix|fix_immediately/)
  })

  it('legacy fix_immediately profile reads as step hints, never as a ready fix (ru/en)', () => {
    for (const locale of ['ru', 'en'] as const) {
      for (const studyMode of ['learn', 'practice'] as const) {
        const p = buildLearnPrompt({ ...base, locale, studyMode, relational: { rhythm: null, errorStyle: 'fix_immediately', anchor: null, attention: null } })
        expect(p).not.toMatch(/точную правку|готовую правку|exact fix|fix immediately/i)
        if (COMPANION.usesProfile) {
          expect(p).toMatch(locale === 'ru' ? /подсказывай по шагам — исправляю я сам/ : /hint step by step — I make the fix myself/)
        }
      }
    }
    expect(normalizeErrorStyle('fix_immediately')).toBe('step_hints')
    expect(normalizeErrorStyle('calm')).toBe('calm')
    expect(normalizeErrorStyle(undefined)).toBeNull()
  })

  it('reference is in the full prompt with the «do not reveal» rule (ru/en, both modes)', () => {
    for (const locale of ['ru', 'en'] as const) {
      for (const studyMode of ['learn', 'practice'] as const) {
        const p = buildLearnPrompt({ ...base, locale, studyMode, reference: ref })
        expect(p).toContain(REFERENCE_RULES.heading[locale])
        expect(p).toContain(REFERENCE_RULES.rules[0][locale])
        for (const m of ['42', '43', '44']) expect(p).toContain(`ЭТАЛОН-МАРКЕР-${m}`)
        expect(p.endsWith(COMPANION.opener[locale])).toBe(true)
      }
    }
    expect(buildLearnPrompt(base)).not.toContain(REFERENCE_RULES.heading.ru)
    expect(buildLearnPrompt({ ...base, reference: null })).toBe(buildLearnPrompt(base))
  })

  it('reference carries the «not in the lesson material» rule (intake LMS#24, ru/en)', () => {
    const pattern = { ru: /нет в материале урока/, en: /not in the lesson material/ } as const
    for (const locale of ['ru', 'en'] as const) {
      expect(REFERENCE_RULES.rules.some((r) => pattern[locale].test(r[locale]))).toBe(true)
      expect(buildLearnPrompt({ ...base, locale, reference: ref })).toMatch(pattern[locale])
    }
  })

  it('reference never reaches the ?q= prefill, which stays within MAX_BOOTSTRAP', () => {
    for (const locale of ['ru', 'en'] as const) {
      for (const studyMode of ['learn', 'practice'] as const) {
        const b = buildBootstrapDeepLink({ ...base, locale, studyMode, reference: ref })
        expect(b).not.toContain('ЭТАЛОН-МАРКЕР')
        expect(b).not.toContain(REFERENCE_RULES.heading[locale])
        expect(b).toBe(buildBootstrapDeepLink({ ...base, locale, studyMode }))
        expect(b.length).toBeLessThanOrEqual(MAX_BOOTSTRAP)
      }
    }
  })

  it('MBTI does not take part in the learning rules (Pashler 2008)', () => {
    for (const locale of ['ru', 'en'] as const) {
      const relational = { rhythm: 'suave', errorStyle: 'calm', anchor: null, attention: 'mid' } as const
      const withMbti = { ...base, locale, mbti: 'INFP', relational } as In
      const withoutMbti: In = { ...base, locale, relational }
      for (const studyMode of ['learn', 'practice'] as const) {
        const p = buildLearnPrompt({ ...withMbti, studyMode })
        expect(p).not.toMatch(/INFP|MBTI|психотип/)
        expect(p).toBe(buildLearnPrompt({ ...withoutMbti, studyMode }))
        expect(buildBootstrapDeepLink({ ...withMbti, studyMode })).not.toMatch(/INFP|MBTI|психотип/)
      }
    }
  })
})

describe('unitReference: data of the active pack', () => {
  it('builds key ideas from the unit checks; null for a unit without checks and entry', () => {
    const mod = getAllModules('ru').find((m) => (m.checks ?? []).length > 0)!
    const c = mod.checks![0]
    const r = unitReference(mod, mod.slug, c.unit, 'ru')!
    expect(r.keyPoints.some((k) => k.includes(c.options[c.answer]) && k.includes(c.question))).toBe(true)
    expect(unitReference({ checks: [] }, mod.slug, 'no-such-unit', 'ru')).toBeNull()
  })

  it('every practice reference points to a real unit in both locales and has 2–4 mistakes', () => {
    for (const r of PRACTICE_REFERENCES) {
      for (const locale of ['ru', 'en'] as const) {
        const meta = getModuleMeta(r.module, locale)
        expect(meta.units.map((u) => u.slug), `${r.module}/${r.unit}`).toContain(r.unit)
        expect(r.solution[locale].length, `${r.unit} solution ${locale}`).toBeGreaterThan(40)
        const ur = unitReference(meta, r.module, r.unit, locale, PRACTICE_REFERENCES)!
        expect(ur.solution).toBe(r.solution[locale])
        expect(buildLearnPrompt({ ...base, locale, reference: ur })).toContain(r.solution[locale])
      }
      expect(r.mistakes.length).toBeGreaterThanOrEqual(2)
      expect(r.mistakes.length).toBeLessThanOrEqual(4)
      for (const m of r.mistakes) expect(m.ru && m.en).toBeTruthy()
    }
  })

  it.runIf(TS)('tochka-sborki: pilot references exist for 2–3 practices', () => {
    expect(PRACTICE_REFERENCES.length).toBeGreaterThanOrEqual(2)
    expect(PRACTICE_REFERENCES.length).toBeLessThanOrEqual(3)
  })
})
