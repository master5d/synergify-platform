// Гварды представлений урока (спека docs/superpowers/specs/2026-09-28-lesson-views.md), активный pack.
// Артефакт → существующий юнит; хэш источника свежий; конспект дословно из урока; ручные пункты —
// без чисел и ссылок не из урока; карточки = самопроверки юнита; пара RU↔EN.
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
import { LessonViews, availableViews } from '../../components/lesson-views'

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
        expect(a, REGEN).toEqual(fresh)
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
    })
  }
})

describe('extract-v1', () => {
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
