// Гварды представлений урока (спека docs/superpowers/specs/2026-09-28-lesson-views.md), активный pack.
// Артефакт → существующий юнит; хэш источника свежий; конспект дословно из урока; ручные пункты —
// без чисел и ссылок не из урока; карточки = самопроверки юнита; пара RU↔EN; пересказ — только годный.
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { CONTENT_ROOT, PACK_DIR, PACK_SLUG } from '../pack'
import type { ModuleMeta } from '../content'
import {
  buildArtifact, checkPoint, extractOutline, flattenOutline, hasManualPoints, sourceHash, unitChecks,
  GENERATOR, SCHEMA, type LessonViewsArtifact,
} from './extract'
import { getLessonViews, readArtifact } from './load'
import { LessonViews, Summary, availableViews } from '../../components/lesson-views'
import {
  buildPrompt, checkParaphrasePoint, checkParaphraseSection, paraphrasedOutline, parseReply, sectionHash, sectionsWithPoints,
  settleSection, similarity, NEAR_IDENTICAL, PARAPHRASE_GENERATOR, PARAPHRASE_POOL,
} from './paraphrase'
import { MANIFEST } from '../manifest'
import { COURSE } from '../course'

const LOCALES = ['ru', 'en'] as const
const REGEN = 'node scripts/gen-lesson-views.ts'

function listArtifacts(): { locale: 'ru' | 'en'; module: string; unit: string }[] {
  const out: { locale: 'ru' | 'en'; module: string; unit: string }[] = []
  for (const locale of LOCALES) {
    const root = join(PACK_DIR, 'views', locale)
    if (!existsSync(root)) continue
    for (const module of readdirSync(root)) {
      for (const f of readdirSync(join(root, module))) {
        if (f.endsWith('.json')) out.push({ locale, module, unit: f.replace(/\.json$/, '') })
      }
    }
  }
  return out
}

function meta(locale: string, module: string): ModuleMeta | null {
  const p = join(CONTENT_ROOT, locale, module, '_meta.json')
  return existsSync(p) ? { slug: module, ...JSON.parse(readFileSync(p, 'utf8')) } : null
}

const ARTIFACTS = listArtifacts()

describe(`lesson views guards (${PACK_SLUG})`, () => {
  it('пилот размечен: у pack\'а есть хотя бы один артефакт', () => {
    expect(ARTIFACTS.length).toBeGreaterThan(0)
  })

  for (const { locale, module, unit } of ARTIFACTS) {
    const at = `${locale}/${module}/${unit}`
    const a = readArtifact(locale, module, unit) as LessonViewsArtifact
    const m = meta(locale, module)
    const mdxPath = join(CONTENT_ROOT, locale, module, `${unit}.mdx`)

    it(`${at}: ссылается на существующий юнит`, () => {
      expect(m, `нет модуля ${module} в ${locale}`).not.toBeNull()
      const u = m!.units.find(x => x.slug === unit)
      expect(u, `юнита ${unit} нет в _meta.json`).toBeTruthy()
      expect(existsSync(mdxPath)).toBe(true)
      expect([a.locale, a.module, a.unit, a.title]).toEqual([locale, module, unit, u!.title])
      expect([a.schema, a.generator]).toEqual([SCHEMA, GENERATOR])
    })

    it(`${at}: не устарел (хэш MDX и вопросов совпадает)`, () => {
      const fresh = sourceHash(readFileSync(mdxPath, 'utf8'), unitChecks(m!.checks, unit))
      expect(a.sourceHash, `урок изменился, представление — нет: ${REGEN}`).toBe(fresh)
    })

    it(`${at}: каждый пункт — из источника`, () => {
      const src = readFileSync(mdxPath, 'utf8')
      const findings: string[] = []
      for (const x of flattenOutline(a.outline)) {
        if (x.heading) findings.push(...checkPoint({ text: x.heading, origin: 'extract' }, src))
        if (x.point) findings.push(...checkPoint(x.point, src))
      }
      expect([...new Set(findings)]).toEqual([])
      expect(flattenOutline(a.outline).some(x => x.point)).toBe(true)
    })

    it(`${at}: карточки = самопроверки юнита`, () => {
      expect(a.cards).toEqual(unitChecks(m!.checks, unit).map(c => c.id))
    })

    it(`${at}: аудио — зарезервированный слот (null)`, () => {
      expect(a.audio).toBeNull()
    })

    if (!hasManualPoints(a)) {
      it(`${at}: равен свежему извлечению (без ручных пунктов)`, () => {
        const fresh = buildArtifact({ module, unit, locale, title: a.title, mdx: readFileSync(mdxPath, 'utf8'), checks: m!.checks })
        // Пересказ — не часть извлечения: сверяется своим гвардом ниже.
        expect({ ...a, paraphrase: undefined }, REGEN).toEqual(fresh)
      })
    }

    if (a.paraphrase) {
      it(`${at}: пересказ помечен, привязан к текущим разделам и проходит гвард`, () => {
        const p = a.paraphrase!
        expect([p.source, p.generator, p.pool]).toEqual(['paraphrase', PARAPHRASE_GENERATOR, PARAPHRASE_POOL])
        const src = readFileSync(mdxPath, 'utf8')
        const nodes = new Map(sectionsWithPoints(a.outline).map(n => [sectionHash(n), n]))
        const findings: string[] = []
        for (const s of p.sections) {
          const n = nodes.get(s.sourceHash)
          if (!n) { findings.push(`раздел ${s.sourceHash.slice(0, 15)} не из текущего outline: ${REGEN}`); continue }
          if (s.verbatim) {
            // Закреплён дословным: пунктов нет, причина — одна из известных.
            if (s.points || !['near-identical', 'review'].includes(s.verbatim)) findings.push(`«${n.heading}»: битая метка verbatim`)
            continue
          }
          if (!s.points) { findings.push(`«${n.heading}»: нет ни пунктов, ни метки verbatim`); continue }
          findings.push(...checkParaphraseSection(s.points, n, src, locale, MANIFEST).map(f => `«${n.heading}»: ${f}`))
          const sim = similarity(n.points.map(x => x.text), s.points)
          if (sim >= NEAR_IDENTICAL) findings.push(`«${n.heading}»: почти дословный пересказ (${sim.toFixed(2)}) хранится — ${REGEN}`)
        }
        expect(findings).toEqual([])
        expect(p.sections.length).toBeGreaterThan(0)
      })
    }

    it(`${at}: есть пара в другой локали`, () => {
      const other = locale === 'ru' ? 'en' : 'ru'
      expect(existsSync(join(PACK_DIR, 'views', other, module, `${unit}.json`))).toBe(true)
    })

    it(`${at}: загрузчик отдаёт данные, страница рендерит вкладки`, () => {
      const data = getLessonViews(module, unit, locale, m!.checks)
      expect(data).not.toBeNull()
      expect(data!.cards.map(c => c.id)).toEqual(a.cards)
      const html = renderToStaticMarkup(createElement(LessonViews, { data, locale, children: createElement('p', null, 'BODY') }))
      expect(html).toContain('role="tablist"')
      expect(html).toContain('BODY')
      expect((html.match(/role="tab"/g) ?? []).length).toBe(availableViews(data!).length)
      expect(data!.paraphrased !== null).toBe(Boolean(a.paraphrase?.sections.some(x => x.points && !x.verbatim)))
      expect(data!.summaryDefault).toBe(COURSE.lessonViews.summaryDefault)
    })
  }
})

describe('extract-v2', () => {
  const mdx = [
    '---', 'title: "X"', '---', '',
    '<Phase type="activation">', '', '**Это тезис из активации, не концепта.**', '', '</Phase>', '',
    '<Phase type="concept">', '',
    '## Раздел первый', '',
    'Вступление без выделений. Второе предложение.', '',
    '### Подраздел', '',
    'Обзор (Smith et al., *Journal*, 2020) показал: **эффект был во всех четырёх группах.** Дальше текст.', '',
    '**Было:** `команда`', '**Стало:** `задача`', '',
    '## Метки', '',
    'Хорошее ТЗ: **Кто** / **Что** / **Зачем** / **Как**.', '',
    '```', '**Жирное в коде не тезис вовсе**', '```', '',
    '<SelfCheck id="c1"/>', '',
    '</Phase>',
  ].join('\r\n')

  it('берёт только концепт-фазу, строит дерево ## → ###, код и JSX не трогает', () => {
    const o = extractOutline(mdx)
    expect(o.map(n => n.heading)).toEqual(['Раздел первый', 'Метки'])
    expect(o[0].points.map(p => p.text)).toEqual(['Вступление без выделений.'])
    expect(o[0].children.map(n => n.heading)).toEqual(['Подраздел'])
    expect(o[0].children[0].points.map(p => p.text)).toEqual(['Обзор (Smith et al., Journal, 2020) показал: эффект был во всех четырёх группах.'])
    expect(o[1].points.map(p => p.text)).toEqual(['Хорошее ТЗ: Кто / Что / Зачем / Как.'])
    expect(JSON.stringify(o)).not.toMatch(/активации|в коде/)
  })

  it('v2: вводная фраза перед кодом/таблицей — тезис без двоеточия; раздел без прозы — без тезисов', () => {
    const src = ['<Phase type="concept">', '', '## Стеки', '', 'Никакой стек не лучше других:', '', '| a | b |', '',
      '## Шаблон', '', '```', 'код', '```', '', '</Phase>'].join('\n')
    const o = extractOutline(src)
    expect(o[0].points.map(p => p.text)).toEqual(['Никакой стек не лучше других'])
    expect(o[1].points).toEqual([])
    expect(checkPoint(o[0].points[0], src)).toEqual([])
  })

  it('детерминирован и не зависит от концов строк', () => {
    expect(extractOutline(mdx)).toEqual(extractOutline(mdx.replace(/\r\n/g, '\n')))
    expect(sourceHash(mdx, [])).toBe(sourceHash(mdx.replace(/\r\n/g, '\n'), []))
  })

  it('хэш меняется от правки урока и от правки вопросов', () => {
    const q = [{ id: 'c1', unit: 'u', objective: 'o1', question: 'Q', options: ['a', 'b'], answer: 0, explain: 'e' }]
    expect(sourceHash(mdx + ' ', q)).not.toBe(sourceHash(mdx, q))
    expect(sourceHash(mdx, [{ ...q[0], answer: 1 }])).not.toBe(sourceHash(mdx, q))
  })

  it('гвард: выдуманный «дословный» пункт и чужие числа/ссылки в ручном пункте ловятся', () => {
    expect(checkPoint({ text: 'эффект был во всех четырёх группах.', origin: 'extract' }, mdx)).toEqual([])
    expect(checkPoint({ text: 'эффект был в пяти группах.', origin: 'extract' }, mdx)).toHaveLength(1)
    expect(checkPoint({ text: 'Обзор 2020 года', origin: 'manual' }, mdx)).toEqual([])
    expect(checkPoint({ text: 'Обзор 2021 года, см. https://example.com', origin: 'manual' }, mdx)).toHaveLength(2)
  })
})

describe('пересказ конспекта (paraphrase-v1)', () => {
  const src = [
    '---', 'title: "X"', '---', '',
    '<Phase type="concept">', '',
    '## Контекст', '',
    '**Claude Code читает файл CLAUDE.md в начале каждой сессии.** Там 3 раздела, см. https://docs.example.org.', '',
    'Команда `npm test` проверяет всё.', '',
    '</Phase>',
  ].join('\n')
  const outline = extractOutline(src)
  const ok = 'Каждую сессию Claude Code начинает с чтения файла CLAUDE.md.'

  it('чистый пересказ годен; имена, числа и код, которые есть в уроке, разрешены', () => {
    expect(checkParaphrasePoint(ok, src, 'ru', MANIFEST)).toEqual([])
    expect(checkParaphrasePoint('Файл делится на 3 раздела, а `npm test` проверяет всё.', src, 'ru', MANIFEST)).toEqual([])
    expect(checkParaphrasePoint('At the start of every session, Claude Code reads the CLAUDE.md file.', src, 'en', MANIFEST)).toEqual([])
  })

  it('ловит выдуманные числа, ссылки, код, имена инструментов, язык, разметку, тон и длину', () => {
    const bad = (t: string, l: 'ru' | 'en' = 'ru') => checkParaphrasePoint(t, src, l, MANIFEST)
    expect(bad('Файл делится на 5 разделов, это важно знать.')).toEqual(['число 5 не из источника'])
    expect(bad('Подробности есть на https://evil.example.com для всех.')).toHaveLength(1)
    expect(bad('Команда `npm run build` собирает весь проект.')).toEqual(['инлайн-код `npm run build` не из источника'])
    expect(bad('Контекст читает Cursor в начале каждой сессии.')).toEqual(['имя «Cursor» не из источника'])
    expect(bad('The Cursor editor reads the file every session.', 'en')).toEqual(['имя «Cursor» не из источника'])
    expect(bad('Run the settings.json check before every session.', 'en')).toEqual(['имя «settings.json» не из источника'])
    expect(bad('Контекст читается в начале сессии.', 'en')).toContain('кириллица в EN-пункте')
    expect(bad('Context is read at session start.', 'ru')).toContain('в RU-пункте нет кириллицы')
    expect(bad('**Контекст** читается в начале каждой сессии.')).toContain('markdown-разметка')
    expect(bad('В начале каждой сессии ваш агент читает файл.')).toEqual(['обращение на «вы» («ваш»)'])
    expect(bad('Выбор файла происходит в начале каждой сессии.')).toEqual([])
    expect(bad('Успей настроить контекст до начала каждой сессии.').some(f => f.startsWith('манифест'))).toBe(true)
    expect(bad('Коротко.')).toHaveLength(1)
    expect(bad(Array(45).fill('длинно').join(' ') + '.')).toHaveLength(2)
  })

  it('гвард раздела: число пунктов и общая длина', () => {
    expect(checkParaphraseSection([ok], outline[0], src, 'ru', MANIFEST)).toEqual([])
    expect(checkParaphraseSection([], outline[0], src, 'ru', MANIFEST)).toHaveLength(1)
    expect(checkParaphraseSection(Array(6).fill(ok), outline[0], src, 'ru', MANIFEST).join()).toMatch(/пунктов 6/)
  })

  it('outline для показа: годный раздел — пересказ; негодный, чужой хэш, чужой пул — дословно', () => {
    const good = { source: 'paraphrase' as const, generator: PARAPHRASE_GENERATOR, pool: PARAPHRASE_POOL,
      sections: [{ sourceHash: sectionHash(outline[0]), points: [ok] }] }
    expect(paraphrasedOutline(outline, good, src, 'ru', MANIFEST)![0].points).toEqual([{ text: ok, origin: 'llm' }])
    const badPts = { ...good, sections: [{ ...good.sections[0], points: ['Cursor читает файл в начале каждой сессии.'] }] }
    expect(paraphrasedOutline(outline, badPts, src, 'ru', MANIFEST)).toBeNull()
    expect(paraphrasedOutline(outline, { ...good, sections: [{ ...good.sections[0], sourceHash: 'sha256:0' }] }, src, 'ru', MANIFEST)).toBeNull()
    expect(paraphrasedOutline(outline, { ...good, pool: 'some-raw-model' }, src, 'ru', MANIFEST)).toBeNull()
    expect(paraphrasedOutline(outline, undefined, src, 'ru', MANIFEST)).toBeNull()
  })

  it('разбор ответа: JSON в заборе и после рассуждения; пусто и мусор — null', () => {
    expect(parseReply('```json\n{"sections":[{"id":0,"points":["a  b"]}]}\n```')!.get(0)).toEqual(['a b'])
    expect(parseReply('думаю… {"sections":[{"id":1,"points":["x"]}]}')!.get(1)).toEqual(['x'])
    expect(parseReply('')).toBeNull()
    expect(parseReply('нет json')).toBeNull()
  })

  it('промпт: язык юнита, запрет чисел и чужих имён, на вход — только тезисы', () => {
    const p = buildPrompt('en', 'T', [{ id: 0, heading: 'H', theses: ['a thesis'] }])
    expect(p.system).toMatch(/Write in English only/)
    expect(p.system).toMatch(/No digits/)
    expect(buildPrompt('ru', 'T', []).system).toMatch(/Write in Russian only[\s\S]*«ты», never «вы»/)
    expect(JSON.parse(p.user)).toEqual({ lesson: 'T', sections: [{ id: 0, heading: 'H', theses: ['a thesis'] }] })
  })

  it('вкладка «Конспект»: пересказ по умолчанию и кнопка «дословно»; без пересказа кнопки нет', () => {
    const para = [{ ...outline[0], points: [{ text: 'ПЕРЕСКАЗ', origin: 'llm' as const }] }]
    const html = renderToStaticMarkup(createElement(Summary, { data: { title: 'X', outline, paraphrased: para, summaryDefault: 'paraphrase', cards: [] }, locale: 'ru' }))
    expect(html).toContain('ПЕРЕСКАЗ')
    expect(html).not.toContain(outline[0].points[0].text)
    expect(html).toContain('Показать дословно')
    const plainHtml = renderToStaticMarkup(createElement(Summary, { data: { title: 'X', outline, paraphrased: null, summaryDefault: 'paraphrase', cards: [] }, locale: 'en' }))
    expect(plainHtml).toContain(outline[0].points[0].text)
    expect(plainHtml).not.toContain('Show verbatim')
  })

  it('pack «Тишина» (verbatim по умолчанию): дословно сначала, кнопка «Показать пересказ»', () => {
    const para = [{ ...outline[0], points: [{ text: 'ПЕРЕСКАЗ', origin: 'llm' as const }] }]
    const html = renderToStaticMarkup(createElement(Summary, { data: { title: 'X', outline, paraphrased: para, summaryDefault: 'verbatim', cards: [] }, locale: 'ru' }))
    expect(html).toContain(outline[0].points[0].text)
    expect(html).not.toContain('ПЕРЕСКАЗ')
    expect(html).toContain('Показать пересказ')
    expect(html).toContain('aria-pressed="true"')
  })

  it('схожесть: Дайс по токенам; почти дословный пересказ становится меткой near-identical', () => {
    expect(similarity(['Первый ответ — черновик, не приговор.'], ['Первый ответ — черновик, не приговор'])).toBe(1)
    expect(similarity(['a b c d'], ['e f g h'])).toBe(0)
    const near = settleSection(outline[0], [outline[0].points[0].text.replace('каждой', 'любой')])
    expect(near).toEqual({ sourceHash: sectionHash(outline[0]), verbatim: 'near-identical' })
    expect(settleSection(outline[0], [ok])).toEqual({ sourceHash: sectionHash(outline[0]), points: [ok] })
    expect(similarity(outline[0].points.map(p => p.text), [ok])).toBeLessThan(NEAR_IDENTICAL)
  })

  it('метки verbatim и почти дословные пункты в показ не идут', () => {
    const base = { source: 'paraphrase' as const, generator: PARAPHRASE_GENERATOR, pool: PARAPHRASE_POOL }
    const h = sectionHash(outline[0])
    expect(paraphrasedOutline(outline, { ...base, sections: [{ sourceHash: h, verbatim: 'review' }] }, src, 'ru', MANIFEST)).toBeNull()
    expect(paraphrasedOutline(outline, { ...base, sections: [{ sourceHash: h, verbatim: 'near-identical' }] }, src, 'ru', MANIFEST)).toBeNull()
    expect(paraphrasedOutline(outline, { ...base, sections: [{ sourceHash: h, points: [outline[0].points[0].text] }] }, src, 'ru', MANIFEST)).toBeNull()
    expect(paraphrasedOutline(outline, { ...base, sections: [{ sourceHash: h, points: [ok], verbatim: 'review' }] }, src, 'ru', MANIFEST)).toBeNull()
  })
})

describe('умолчание вкладки «Конспект» — настройка pack\'а', () => {
  const cfg = (pack: string) => readFileSync(join(process.cwd(), 'packs', pack, 'course.config.ts'), 'utf8')
  it('каждый pack объявляет lessonViews.summaryDefault', () => {
    const packs = readdirSync(join(process.cwd(), 'packs'), { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('_'))
    for (const p of packs) expect(cfg(p.name), p.name).toMatch(/lessonViews:\s*\{\s*summaryDefault:\s*'(paraphrase|verbatim)'/)
  })
  it('ТС — пересказ, «Тишина» — дословно (2 из 8 пересказов исказили смысл)', () => {
    expect(cfg('tochka-sborki')).toMatch(/summaryDefault:\s*'paraphrase'/)
    expect(cfg('living-practice')).toMatch(/summaryDefault:\s*'verbatim'/)
  })
  it('вычитка: два искажения «Тишины» (EN u5, u6) закреплены дословными', () => {
    const lp = (unit: string) => JSON.parse(readFileSync(join(process.cwd(), 'packs', 'living-practice', 'views', 'en', '01-living-practice', `${unit}.json`), 'utf8')) as LessonViewsArtifact
    for (const [unit, heading] of [['u5-neudobnoe', 'What showed up once somebody finally asked'], ['u6-bez-zakuporki', 'Two different things called by one word']]) {
      const a = lp(unit)
      const n = sectionsWithPoints(a.outline).find(x => x.heading === heading)!
      expect(n, `${unit}: раздел «${heading}»`).toBeTruthy()
      expect(a.paraphrase!.sections.find(x => x.sourceHash === sectionHash(n))).toEqual({ sourceHash: sectionHash(n), verbatim: 'review' })
    }
  })
})
