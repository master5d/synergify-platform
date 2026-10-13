import { describe, it, expect } from 'vitest'
import { buildLearnPrompt, buildBootstrapDeepLink, MAX_BOOTSTRAP, PRACTICE_RULES } from './learn-prompt'
import { PACK_SLUG } from './pack'
import { COURSE } from './course'
import { COMPANION } from './course/companion'
import { DAY_MS, reviewKey, type ReviewRecord, type ReviewStore } from './spaced-review'
import {
  FADE_LINE, FADE_MIN_ANSWERS, FADE_WINDOW, fadeLine, fadeModules, fadeSignal,
} from './learn-prompt-fading'

const base = {
  locale: 'ru' as const,
  moduleTitle: 'Промпт-инжиниринг',
  unitIndex: 1,
  totalUnits: 3,
}

// Снимок снят с кода ДО сигнала по самопроверкам (origin/main): без сигнала промпт обязан остаться
// байт-в-байт тем же. Имя снимка несёт pack — у каждого курса свой компаньон.
describe('learn prompt without a fade signal is byte-identical to the pre-signal prompt', () => {
  const variants = {
    'ru learn': { ...base },
    'ru learn copilot': { ...base, mode: 'copilot' as const },
    'ru practice archmage': { ...base, mode: 'archmage' as const, studyMode: 'practice' as const },
    'en learn': { ...base, locale: 'en' as const },
    'en practice commander': { ...base, locale: 'en' as const, mode: 'commander' as const, studyMode: 'practice' as const },
  }
  for (const [name, input] of Object.entries(variants)) {
    it(`${PACK_SLUG}: ${name}`, () => {
      expect({ full: buildLearnPrompt(input), bootstrap: buildBootstrapDeepLink(input) }).toMatchSnapshot()
    })
  }
})

// ---- сигнал по самопроверкам ----

function rec(module: string, id: string, correct: boolean, last: number): ReviewRecord {
  return { module, unit: 'u1', id, box: 0, due: last + DAY_MS, last, correct, n: 1, q: {} }
}
/** n ответов в модуле, первые `right` по ВРЕМЕНИ (свежие) — верные. */
function storeOf(module: string, right: number, n: number, t0 = 1_000_000): ReviewStore {
  const s: ReviewStore = {}
  for (let k = 0; k < n; k++) {
    const r = rec(module, `c${k}`, k < right, t0 - k)
    s[reviewKey(r.module, r.id)] = r
  }
  return s
}

describe('fadeSignal thresholds', () => {
  const M = ['04-prompt-engineering']
  it('too few answers → none (and an empty store → none)', () => {
    expect(fadeSignal({}, M)).toBe('none')
    expect(fadeSignal(storeOf(M[0], FADE_MIN_ANSWERS - 1, FADE_MIN_ANSWERS - 1), M)).toBe('none')
  })
  it('exactly the minimum: all right → fade; 3 of 4 (0.75) → hold; 2 of 4 (0.5) → hold; 1 of 4 → add', () => {
    expect(fadeSignal(storeOf(M[0], 4, 4), M)).toBe('fade')
    expect(fadeSignal(storeOf(M[0], 3, 4), M)).toBe('hold')
    expect(fadeSignal(storeOf(M[0], 2, 4), M)).toBe('hold')
    expect(fadeSignal(storeOf(M[0], 1, 4), M)).toBe('add')
    expect(fadeSignal(storeOf(M[0], 0, 4), M)).toBe('add')
  })
  it('FADE_HIGH is inclusive: 4 of 5 (0.8) → fade', () => {
    expect(fadeSignal(storeOf(M[0], 4, 5), M)).toBe('fade')
    expect(fadeSignal(storeOf(M[0], 3, 5), M)).toBe('hold')
  })
  it('FADE_LOW is exclusive: 3 of 6 (0.5) → hold, 2 of 6 → add', () => {
    expect(fadeSignal(storeOf(M[0], 3, 6), M)).toBe('hold')
    expect(fadeSignal(storeOf(M[0], 2, 6), M)).toBe('add')
  })
  it('only the last FADE_WINDOW answers count: old mistakes do not hold the learner back', () => {
    // 8 свежих верных + 8 старых неверных → смотрим только свежие.
    expect(fadeSignal(storeOf(M[0], FADE_WINDOW, FADE_WINDOW * 2), M)).toBe('fade')
  })
  it('ignores other modules; the previous module counts when passed', () => {
    const s = { ...storeOf('03-stack-selection', 0, 6), ...storeOf(M[0], 2, 2, 2_000_000) }
    expect(fadeSignal(s, M)).toBe('none')
    expect(fadeSignal(s, [M[0], '03-stack-selection'])).toBe('add')
  })
  it('fadeModules adds the previous module in course order, none for the first or unknown module', () => {
    const order = ['00-a', '01-b', '02-c']
    expect(fadeModules('01-b', order)).toEqual(['01-b', '00-a'])
    expect(fadeModules('00-a', order)).toEqual(['00-a'])
    expect(fadeModules('zz', order)).toEqual(['zz'])
    expect(fadeModules('01-b')).toEqual(['01-b'])
  })
})

describe('fadeLine', () => {
  it('only fade/add with the flag on produce a phrase', () => {
    expect(fadeLine('fade', 'ru', true)).toBe(FADE_LINE.fade.ru)
    expect(fadeLine('add', 'en', true)).toBe(FADE_LINE.add.en)
    for (const s of ['hold', 'none', null, undefined] as const) expect(fadeLine(s, 'ru', true)).toBeNull()
  })
  it('flag off → the signal is ignored', () => {
    expect(fadeLine('fade', 'ru', false)).toBeNull()
    expect(fadeLine('add', 'en', false)).toBeNull()
  })
})

const FLAG = (COURSE.pedagogy as { fadeByChecks?: boolean }).fadeByChecks === true

describe('pack flag COURSE.pedagogy.fadeByChecks', () => {
  it.runIf(PACK_SLUG === 'tochka-sborki')('tochka-sborki: on', () => expect(FLAG).toBe(true))
  it.runIf(PACK_SLUG === 'living-practice')('living-practice: off', () => expect(FLAG).toBe(false))
})

describe('prompt with a checks signal', () => {
  for (const locale of ['ru', 'en'] as const) {
    for (const studyMode of ['learn', 'practice'] as const) {
      const input = { ...base, locale, mode: 'copilot' as const, studyMode }
      const plain = buildLearnPrompt(input)
      const plainBoot = buildBootstrapDeepLink(input)

      it(`${locale}/${studyMode}: none and hold leave the prompt and bootstrap unchanged`, () => {
        for (const fadeSignal of ['none', 'hold', null] as const) {
          expect(buildLearnPrompt({ ...input, fadeSignal })).toBe(plain)
          expect(buildBootstrapDeepLink({ ...input, fadeSignal })).toBe(plainBoot)
        }
      })

      for (const sig of ['fade', 'add'] as const) {
        it.runIf(FLAG)(`${locale}/${studyMode}: ${sig} adds one phrase right after the mode line`, () => {
          const p = buildLearnPrompt({ ...input, fadeSignal: sig })
          const unitLine = p.split('\n').find(l => l.includes(FADE_LINE[sig][locale]))
          expect(unitLine).toBeDefined()
          // Режим анкеты остаётся базой: строка режима на месте, фраза идёт после неё.
          const modeIdx = unitLine!.indexOf(locale === 'ru' ? 'Средние опоры' : 'Medium scaffolding')
          expect(modeIdx).toBeGreaterThan(-1)
          expect(unitLine!.indexOf(FADE_LINE[sig][locale])).toBeGreaterThan(modeIdx)
          expect(p.split(FADE_LINE[sig][locale]).length).toBe(2)
          expect(p.replace(` ${FADE_LINE[sig][locale]}`, '')).toBe(plain)
          expect(buildBootstrapDeepLink({ ...input, fadeSignal: sig })).toContain(FADE_LINE[sig][locale])
        })
        it.runIf(!FLAG)(`${locale}/${studyMode}: ${sig} is ignored when the pack flag is off`, () => {
          expect(buildLearnPrompt({ ...input, fadeSignal: sig })).toBe(plain)
          expect(buildBootstrapDeepLink({ ...input, fadeSignal: sig })).toBe(plainBoot)
        })
      }
    }
  }

  it('bootstrap cap: a huge profile never cuts the practice rules, the fade phrase or the opener', () => {
    const long = 'очень длинный запрос '.repeat(200)
    for (const locale of ['ru', 'en'] as const) {
      for (const studyMode of ['learn', 'practice'] as const) {
        // Без флага learn-ветка — прежний cap головы целиком (не этот путь, не этот тест).
        if (!FLAG && studyMode === 'learn') continue
        for (const sig of ['fade', 'add'] as const) {
          const b = buildBootstrapDeepLink({
            ...base, locale, studyMode, fadeSignal: sig, outcome: long, moduleTitle: 'М'.repeat(2000),
            mentorName: 'Фиксер', skinName: 'Кибер-Нуар', niche: 'coach', mode: 'commander',
          })
          expect(b.length).toBeLessThanOrEqual(MAX_BOOTSTRAP)
          if (studyMode === 'practice') expect(b).toContain(PRACTICE_RULES.compact[locale].trim())
          if (FLAG) expect(b).toContain(FADE_LINE[sig][locale])
          expect(b.endsWith(COMPANION.bootstrap.opener[locale].trim())).toBe(true)
        }
      }
    }
  })
})
