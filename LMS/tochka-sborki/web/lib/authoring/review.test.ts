import { describe, it, expect } from 'vitest'
import { lintReadability, lintPhaseOrder, buildPolishPrompt } from './review'
import { draftLesson, SAMPLE_NOTES, validateDraftMdx } from './draft'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { lintDehustle } from './dehustle'

const clean = draftLesson({
  unitTitle: 'Getting started', unitIndex: 0, moduleIndex: 0,
  objective: 'Understand why this module exists', notes: SAMPLE_NOTES, locale: 'en',
})
const LONG = 'This is an intentionally very long sentence that keeps going and going with many many extra words so that it clearly exceeds the twenty five word maximum threshold set by the readability lint today'

describe('lintReadability', () => {
  it('passes a clean S3 draft', () => {
    expect(lintReadability(clean)).toEqual([])
  })
  it('flags a long sentence in a phase', () => {
    const dirty = clean.replace('Run it in your head — where have you met this before?', LONG + '.')
    expect(lintReadability(dirty).some(e => /long sentence/.test(e))).toBe(true)
  })
  it('flags a leftover TODO in a phase body', () => {
    const dirty = clean.replace('Do this:', 'TODO: Do this:')
    expect(lintReadability(dirty).some(e => /leftover TODO/.test(e))).toBe(true)
  })
  it('flags a too-vague practice step', () => {
    const dirty = clean.replace('Do this: name one real task you want this module to help you finish', 'Do this: go')
    expect(lintReadability(dirty).some(e => /too vague/.test(e))).toBe(true)
  })
})

// Хвосты волны 18: две ложные находки review-lesson на реальных уроках ТС.
describe('ложные находки линтера (повторы багов волны 18)', () => {
  // Файл в рабочем дереве Windows (core.autocrlf=true) приходит с CRLF — строим повтор в тесте,
  // а не файлом-фикстурой: git нормализовал бы её в LF, и на Linux-чекауте баг бы не воспроизводился.
  const crlf = clean.replace(/\n/g, '\r\n')
  it('CRLF-фронтматтер не даёт «missing title» (validateDraftMdx)', () => {
    expect(crlf).toMatch(/^---\r\ntitle: "/)
    expect(validateDraftMdx(crlf)).toEqual(validateDraftMdx(clean))
    expect(validateDraftMdx(crlf)).not.toContain('frontmatter: missing title')
  })
  it('CRLF + BOM — тот же вердикт, что у LF', () => {
    expect(validateDraftMdx('﻿' + crlf)).toEqual(validateDraftMdx(clean))
    expect(lintReadability('﻿' + crlf)).toEqual(lintReadability(clean))
  })
  it('без фронтматтера «missing title» по-прежнему ловится (исправление не глушит проверку)', () => {
    expect(validateDraftMdx(crlf.replace(/^---\r\ntitle: "[^"]*"\r\n/, '---\r\n'))).toContain('frontmatter: missing title')
  })
  it('имя файла TODO.md — не заглушка (модуль 05 учит этому файлу)', () => {
    const withFile = clean.replace('Do this:', 'Open TODO.md and do this:')
    expect(lintReadability(withFile).some(e => /leftover TODO/.test(e))).toBe(false)
  })
  it('голый TODO и «TODO.» в конце фразы — по-прежнему заглушка', () => {
    expect(lintReadability(clean.replace('Do this:', 'TODO Do this:')).some(e => /leftover TODO/.test(e))).toBe(true)
    expect(lintReadability(clean.replace('Do this:', 'Finish later TODO. Do this:')).some(e => /leftover TODO/.test(e))).toBe(true)
  })
  it('реальный урок 05/u3-memory (CRLF с диска, упоминает TODO.md) — ни одной из двух ложных находок', () => {
    for (const locale of ['ru', 'en']) {
      const file = join(process.cwd(), 'packs', 'tochka-sborki', 'content', locale, '05-context-memory', 'u3-memory.mdx')
      if (!existsSync(file)) continue
      const raw = readFileSync(file, 'utf8')
      const mdx = raw.includes('\r\n') ? raw : raw.replace(/\n/g, '\r\n')
      const all = [...validateDraftMdx(mdx), ...lintReadability(mdx)]
      expect(all.filter(f => /missing title|leftover TODO/.test(f))).toEqual([])
    }
  })
})

describe('lintPhaseOrder', () => {
  it('passes a clean S3 draft (activation -> reflection -> concept -> practice)', () => {
    expect(lintPhaseOrder(clean)).toEqual([])
  })
  it('flags reflection and concept swapped (the real 03-stack-selection/u2-stack-matrix bug)', () => {
    const swapped = clean
      .replace('<Phase type="reflection">', '<Phase type="TMP">')
      .replace('<Phase type="concept">', '<Phase type="reflection">')
      .replace('<Phase type="TMP">', '<Phase type="concept">')
    const findings = lintPhaseOrder(swapped)
    expect(findings).toHaveLength(1)
    expect(findings[0]).toMatch(/expected order activation -> reflection -> concept -> practice/)
    expect(findings[0]).toMatch(/got activation -> concept -> reflection -> practice/)
  })
  it('ignores prose-layout content with no Phase tags', () => {
    expect(lintPhaseOrder('# Just a page\n\nNo phases here.')).toEqual([])
  })
  it('does not pile on when a phase is missing entirely (lintReadability already flags it)', () => {
    const missingPractice = clean.replace(/<Phase type="practice">[\s\S]*<\/Phase>/, '')
    expect(lintPhaseOrder(missingPractice)).toEqual([])
  })
})

describe('buildPolishPrompt', () => {
  const findings = ['activation: long sentence (30 words)']
  it('embeds the draft, findings, and constraints (en)', () => {
    const p = buildPolishPrompt(clean, findings, 'en')
    expect(p).toContain('--- DRAFT ---')
    expect(p).toContain('Getting started')
    expect(p).toContain('activation: long sentence (30 words)')
    expect(p).toMatch(/under 25 words/)
    expect(p).toMatch(/activation.*reflection.*concept.*practice/)
    expect(p).toMatch(/mental/)
    expect(p).toMatch(/no selling/)
  })
  it('differs by locale and both are de-hustle clean', () => {
    const en = buildPolishPrompt(clean, findings, 'en')
    const ru = buildPolishPrompt(clean, findings, 'ru')
    expect(en).not.toBe(ru)
    expect(lintDehustle(en)).toEqual([])
    expect(lintDehustle(ru)).toEqual([])
  })
  it('carries the clarity-first guardrail in both locales (fb_a1a446f5)', () => {
    expect(buildPolishPrompt('<Phase type="activation">x</Phase>', [], 'en')).toContain('clarity comes first')
    expect(buildPolishPrompt('<Phase type="activation">x</Phase>', [], 'ru')).toContain('ясность первична')
  })
})
