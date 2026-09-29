// Педагогика 2 и 3 (intake LMS#20): pretest в активации и «сначала сам» во вкладках «Конспект»/«Карта».
// Интерактив проверяется чистыми переходами состояния + статическим рендером каждого состояния
// (среда vitest — node, без DOM).
import { describe, it, expect, afterEach, vi } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import type { ModuleMeta, SelfCheckItem } from '../content'
import { PACK_DIR, PACK_SLUG } from '../pack'
import { COURSE } from '../course'
import { conceptBlock, pickPretest, pretestErrors, toPretestItem, PRETEST_MAX } from './pretest'
import {
  THINK_LOCKED, canOpen, parseGuesses, parseThink, readJson, thinkEdit, thinkSkip, thinkSubmit, writeJson, type ThinkState,
} from './local'
import { PretestProvider } from '../../components/pretest'
import { bindPretestEcho, bindPretestPhase } from '../../components/pretest-bound'
import { UnitWizardContext } from '../../components/unit-wizard-context'
import { GatedView } from '../../components/lesson-views'
import type { LessonViewsData } from '../lesson-views/load'

const check = (id: string, unit: string, over: Partial<SelfCheckItem> = {}): SelfCheckItem => ({
  id, unit, objective: 'o1', question: `Вопрос ${id}?`, options: ['Альфа', 'Бета', 'Гамма'], answer: 1,
  explain: `ОБЪЯСНЕНИЕ-${id}`, ...over,
})

const MDX = [
  '<Phase type="activation">', 'Крючок.', '</Phase>',
  '<Phase type="reflection">', 'Мысль.', '<SelfCheck id="c0"/>', '</Phase>',
  '<Phase type="concept">', 'Объяснение.', '<SelfCheck id="c1"/>', '', '<SelfCheck id="c2"/>', '<SelfCheck id="c3"/>', '</Phase>',
  '<Phase type="practice">', 'Делай.', '</Phase>',
].join('\n')
const CHECKS = [check('c0', 'u1'), check('c1', 'u1'), check('c2', 'u1'), check('c3', 'u1'), check('c9', 'u2')]

describe('pretest: какие вопросы', () => {
  it('по умолчанию — первый вопрос юнита, чья метка в фазе concept (ответ будет показан после объяснения)', () => {
    expect(conceptBlock(MDX)).toContain('c1')
    expect(conceptBlock(MDX)).not.toContain('c0')
    expect(pickPretest({ checks: CHECKS }, 'u1', MDX).map(c => c.id)).toEqual(['c1'])
  })
  it('явный выбор в _meta.json: чужие и не-концептные id отбрасываются, не больше двух, [] выключает', () => {
    expect(pickPretest({ checks: CHECKS, pretest: { u1: ['c3', 'c2'] } }, 'u1', MDX).map(c => c.id)).toEqual(['c3', 'c2'])
    expect(pickPretest({ checks: CHECKS, pretest: { u1: ['c0', 'c9', 'c2'] } }, 'u1', MDX).map(c => c.id)).toEqual(['c2'])
    expect(pickPretest({ checks: CHECKS, pretest: { u1: ['c1', 'c2', 'c3'] } }, 'u1', MDX)).toHaveLength(PRETEST_MAX)
    expect(pickPretest({ checks: CHECKS, pretest: { u1: [] } }, 'u1', MDX)).toEqual([])
  })
  it('гвард явного выбора называет ошибки', () => {
    const meta = { checks: CHECKS, units: [{ slug: 'u1', title: '' }], pretest: { u1: ['c0', 'c1', 'c2', 'c3'], u7: ['c1'] } }
    const errs = pretestErrors('m', meta, () => MDX)
    expect(errs.some(e => /u7, которого нет/.test(e))).toBe(true)
    expect(errs.some(e => /4 вопросов/.test(e))).toBe(true)
    expect(errs.some(e => /c0: .*не в фазе concept/.test(e))).toBe(true)
  })
  it('клиенту уходит вопрос без ответа и объяснения', () => {
    const item = toPretestItem(CHECKS[1])
    expect(Object.keys(item).sort()).toEqual(['id', 'options', 'question'])
  })
})

function atStep(step: number, el: ReactElement) {
  return renderToStaticMarkup(<UnitWizardContext.Provider value={{ currentStep: step, totalSteps: 4, locale: 'ru' }}>{el}</UnitWizardContext.Provider>)
}

describe('pretest: ответ не раскрывается до концепта', () => {
  const items = [toPretestItem(CHECKS[1])]
  for (const locale of ['ru', 'en'] as const) {
    const Phase = bindPretestPhase(true, locale)
    it(`[${locale}] активация: вопрос и «ошибаться можно», без ответа и объяснения — до и после догадки`, () => {
      for (const initial of [{}, { c1: 0 }] as Record<string, number>[]) {
        const html = atStep(0, <PretestProvider items={items} storageKey="k" initial={initial}><Phase type="activation"><p>Крючок</p></Phase></PretestProvider>)
        expect(html).toContain('Крючок')
        expect(html).toContain('Вопрос c1?')
        expect(html).toMatch(locale === 'ru' ? /Ошибаться можно/ : /Getting it wrong is fine/)
        expect(html).not.toContain('ОБЪЯСНЕНИЕ-c1')
        // пометки SelfCheck после «Проверить» (lib/self-check.ts optionNote) и вердикт
        expect(html).not.toMatch(/— верный ответ|— correct answer|Верно\.|Correct\.|Не совсем|Not quite/)
      }
      const guessed = atStep(0, <PretestProvider items={items} storageKey="k" initial={{ c1: 0 }}><Phase type="activation">x</Phase></PretestProvider>)
      expect(guessed).toContain(locale === 'ru' ? 'Догадка записана: «Альфа»' : 'Guess saved: “Альфа”')
    })
    it(`[${locale}] другие фазы pretest не несут`, () => {
      const html = atStep(2, <PretestProvider items={items} storageKey="k" initial={{}}><Phase type="concept"><p>Объяснение</p></Phase></PretestProvider>)
      expect(html).toContain('Объяснение')
      expect(html).not.toContain('Вопрос c1?')
    })
  }
  it('выключенный pretest — активация как была', () => {
    const Phase = bindPretestPhase(false, 'ru')
    const html = atStep(0, <PretestProvider items={[toPretestItem(CHECKS[1])]} storageKey="k" initial={{}}><Phase type="activation">x</Phase></PretestProvider>)
    expect(html).not.toContain('Вопрос c1?')
  })
  it('в концепте над самопроверкой — напоминание о догадке; без догадки и у чужого вопроса — ничего', () => {
    const Base = ({ id }: { id: string }) => <div>SELFCHECK-{id}</div>
    const Echoed = bindPretestEcho(Base, ['c1'], 'ru')
    const items = [toPretestItem(CHECKS[1])]
    const withGuess = renderToStaticMarkup(<PretestProvider items={items} storageKey="k" initial={{ c1: 2 }}><Echoed id="c1" /><Echoed id="c2" /></PretestProvider>)
    expect(withGuess).toContain('до объяснения ты выбрал «Гамма»')
    expect(withGuess.match(/до объяснения ты выбрал/g)).toHaveLength(1)
    expect(withGuess).toContain('SELFCHECK-c1')
    expect(withGuess).toContain('SELFCHECK-c2')
    const noGuess = renderToStaticMarkup(<PretestProvider items={items} storageKey="k" initial={{}}><Echoed id="c1" /></PretestProvider>)
    expect(noGuess).not.toContain('до объяснения')
    const en = bindPretestEcho(Base, ['c1'], 'en')
    expect(renderToStaticMarkup(<PretestProvider items={items} storageKey="k" initial={{ c1: 0 }}>{en({ id: 'c1' })}</PretestProvider>)).toContain('before the explanation you picked “Альфа”')
  })
  it('догадки из хранилища: мусор отбрасывается', () => {
    expect(parseGuesses({ c1: 1, c2: -1, c3: 'x', c4: 1.5 })).toEqual({ c1: 1 })
    expect(parseGuesses(['x'])).toEqual({})
    expect(parseGuesses(null)).toEqual({})
  })
})

describe('pretest на данных активного pack\'а', () => {
  const content = (l: string) => join(PACK_DIR, 'content', l)
  const slugs = readdirSync(content('ru'), { withFileTypes: true })
    .filter(e => e.isDirectory() && existsSync(join(content('ru'), e.name, '_meta.json'))).map(e => e.name)
  const meta = (l: string, s: string) => JSON.parse(readFileSync(join(content(l), s, '_meta.json'), 'utf8')) as ModuleMeta
  const mdx = (l: string, s: string, u: string) => { const p = join(content(l), s, `${u}.mdx`); return existsSync(p) ? readFileSync(p, 'utf8') : null }

  it('явный выбор pretest в _meta.json корректен (RU и EN)', () => {
    const errs = slugs.flatMap(s => (['ru', 'en'] as const).flatMap(l => existsSync(join(content(l), s, '_meta.json')) ? pretestErrors(`${s} [${l}]`, meta(l, s), u => mdx(l, s, u)) : []))
    expect(errs).toEqual([])
  })
  it('RU и EN задают одни и те же вопросы pretest', () => {
    for (const s of slugs) {
      if (!existsSync(join(content('en'), s, '_meta.json'))) continue
      const ru = meta('ru', s), en = meta('en', s)
      for (const u of ru.units) {
        const a = mdx('ru', s, u.slug), b = mdx('en', s, u.slug)
        if (a === null || b === null) continue
        expect(pickPretest(en, u.slug, b).map(c => c.id), `${s}/${u.slug}`).toEqual(pickPretest(ru, u.slug, a).map(c => c.id))
      }
    }
  })
  it(`[${PACK_SLUG}] у курса с включённым pretest он есть почти в каждом уроке с самопроверкой в концепте`, () => {
    if (!COURSE.pedagogy.pretest) return
    let units = 0, withPretest = 0
    for (const s of slugs) for (const u of meta('ru', s).units) {
      const m = mdx('ru', s, u.slug)
      if (m === null) continue
      units++
      if (pickPretest(meta('ru', s), u.slug, m).length > 0) withPretest++
    }
    expect(withPretest).toBeGreaterThan(units / 2)
  })
})

describe('«сначала сам»: переходы', () => {
  const two = thinkEdit(thinkEdit(THINK_LOCKED, 0, 'агент читает AGENTS.md'), 1, 'коротко и конкретно')
  it('закрыто, пока нет двух мыслей; открывается с двумя', () => {
    const one = thinkEdit(THINK_LOCKED, 0, 'одна мысль')
    expect(canOpen(one)).toBe(false)
    expect(thinkSubmit(one).status).toBe('locked')
    expect(thinkSubmit(thinkEdit(one, 1, ' a ')).status).toBe('locked') // короче трёх знаков не считается
    expect(thinkSubmit(two).status).toBe('written')
  })
  it('«Пропустить» открывает без мыслей', () => {
    expect(thinkSkip(THINK_LOCKED).status).toBe('skipped')
  })
  it('хранилище: порча и «written» без мыслей — снова закрыто', () => {
    expect(parseThink(null)).toBeNull()
    expect(parseThink({ thoughts: 'x', status: 'written' })).toBeNull()
    expect(parseThink({ thoughts: ['a'], status: 'written' })!.status).toBe('locked')
    expect(parseThink({ thoughts: ['мысль один', 'мысль два'], status: 'written' })).toEqual({ thoughts: ['мысль один', 'мысль два', ''], status: 'written' })
  })
})

describe('«сначала сам»: хранилище браузера', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('пишет и читает; бросающее хранилище не ломает урок', () => {
    const m = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v) } })
    writeJson('k', { a: 1 })
    expect(readJson('k')).toEqual({ a: 1 })
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('denied') } })
    expect(() => writeJson('k', 1)).not.toThrow()
    expect(readJson('k')).toBeNull()
  })
})

describe('«сначала сам»: вкладки «Конспект» и «Карта»', () => {
  const data = (thinkFirst: boolean): LessonViewsData => ({
    title: 'Урок', summaryDefault: 'verbatim', paraphrased: null, thinkFirst, unitKey: 'm/u',
    outline: [{ heading: 'Раздел', points: [{ text: 'КЛЮЧЕВАЯ-ФРАЗА' } as never], children: [] }],
    cards: [{ id: 'c1', question: 'Карточка?', answer: 'Ответ', explain: 'Почему' }],
  })
  const written: ThinkState = { thoughts: ['моя мысль один', 'моя мысль два', ''], status: 'written' }
  const view = (v: 'summary' | 'map' | 'cards', d: LessonViewsData, think: ThinkState, locale: 'ru' | 'en' = 'ru') =>
    renderToStaticMarkup(<GatedView view={v} data={d} locale={locale} think={think} onThink={() => {}} />)

  for (const v of ['summary', 'map'] as const) {
    it(`[${v}] закрыто: поле мыслей, «Пропустить» с пояснением, конспекта нет`, () => {
      const html = view(v, data(true), THINK_LOCKED)
      expect(html).toContain('Сначала своими словами')
      expect(html).toContain('Пропустить')
      expect(html).toContain('Почему стоит сначала самому')
      expect(html.match(/<textarea/g)).toHaveLength(3)
      expect(html).toMatch(/<button[^>]*disabled[^>]*>Открыть и сравнить/)
      expect(html).not.toContain('КЛЮЧЕВАЯ-ФРАЗА')
    })
    it(`[${v}] после своих мыслей: конспект и мысли рядом`, () => {
      const html = view(v, data(true), written)
      expect(html).toContain('КЛЮЧЕВАЯ-ФРАЗА')
      expect(html).toContain('Мои мысли до конспекта')
      expect(html).toContain('моя мысль два')
      expect(html).not.toContain('Сначала своими словами')
    })
    it(`[${v}] после «Пропустить»: конспект без блока мыслей`, () => {
      const html = view(v, data(true), thinkSkip(THINK_LOCKED))
      expect(html).toContain('КЛЮЧЕВАЯ-ФРАЗА')
      expect(html).not.toContain('Мои мысли')
    })
    it(`[${v}] выключено в pack'е — открыто сразу`, () => {
      const html = view(v, data(false), THINK_LOCKED)
      expect(html).toContain('КЛЮЧЕВАЯ-ФРАЗА')
      expect(html).not.toContain('Сначала своими словами')
    })
  }
  it('кнопка «Открыть» активна при двух мыслях', () => {
    const two = thinkEdit(thinkEdit(THINK_LOCKED, 0, 'первая мысль'), 1, 'вторая мысль')
    expect(view('summary', data(true), two)).not.toMatch(/<button[^>]*disabled[^>]*>Открыть и сравнить/)
  })
  it('карточки не закрываются', () => {
    expect(view('cards', data(true), THINK_LOCKED)).toContain('Карточка?')
  })
  it('EN', () => {
    expect(view('summary', data(true), THINK_LOCKED, 'en')).toMatch(/Your own words first[\s\S]*Skip/)
    expect(view('map', data(true), written, 'en')).toContain('My thoughts before the summary')
  })
})

describe('настройка pack\'а: pedagogy', () => {
  const cfg = (pack: string) => readFileSync(join(process.cwd(), 'packs', pack, 'course.config.ts'), 'utf8')
  it('каждый pack объявляет pedagogy.pretest и pedagogy.thinkFirst', () => {
    const packs = readdirSync(join(process.cwd(), 'packs'), { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('_'))
    for (const p of packs) expect(cfg(p.name), p.name).toMatch(/pedagogy:\s*\{\s*pretest:\s*(true|false),\s*thinkFirst:\s*(true|false)\s*\}/)
  })
  it('ТС — оба включены; «Тишина» — оба выключены (деликатная тема)', () => {
    expect(cfg('tochka-sborki')).toMatch(/pedagogy:\s*\{\s*pretest:\s*true,\s*thinkFirst:\s*true\s*\}/)
    expect(cfg('living-practice')).toMatch(/pedagogy:\s*\{\s*pretest:\s*false,\s*thinkFirst:\s*false\s*\}/)
  })
  it('активный pack доносит thinkFirst до данных вкладок', () => {
    expect(typeof COURSE.pedagogy.thinkFirst).toBe('boolean')
  })
})
