import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { BUDGET_BYTES, checkAssemblyWeight, figureBytes, figureExpected } from '../scripts/check-assembly-weight.mjs'

const svg = (inner: string) => `<svg data-am-figure="" class="am-figure" viewBox="0 0 1 1">${inner}</svg>`

function out(pages: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'am-weight-'))
  for (const [p, html] of Object.entries(pages)) {
    mkdirSync(join(dir, p), { recursive: true })
    writeFileSync(join(dir, p, 'index.html'), html)
  }
  return dir
}

describe('бюджет веса картины', () => {
  it('figureBytes меряет самую тяжёлую картину страницы в байтах UTF-8; нет картины — 0', () => {
    expect(figureBytes('<p>нет</p>')).toBe(0)
    const a = svg('<g/>')
    expect(figureBytes(`<div>${a}</div>`)).toBe(Buffer.byteLength(a))
    expect(figureBytes(`${svg('я')}${svg('<g/><g/>')}`)).toBe(Buffer.byteLength(svg('<g/><g/>')))
  })

  it('checkAssemblyWeight смотрит только страницы уроков и находит превышение', () => {
    const dir = out({
      'lessons/06/u1': `<html>${svg('x'.repeat(10))}</html>`,
      'en/lessons/06/u2': `<html>${svg('x'.repeat(BUDGET_BYTES))}</html>`,
      'cheatsheet': `<html>${svg('x'.repeat(BUDGET_BYTES * 2))}</html>`,
    })
    const r = checkAssemblyWeight(dir)
    expect(r.withFigure).toBe(2)
    expect(r.over).toHaveLength(1)
    expect(r.over[0].page).toMatch(/en[\\/]lessons[\\/]06[\\/]u2/)
  })

  it('figureExpected читает флаг активного pack\'а', () => {
    const root = mkdtempSync(join(tmpdir(), 'am-pack-'))
    mkdirSync(join(root, 'packs', '_active'), { recursive: true })
    writeFileSync(join(root, 'packs', '_active', 'course.config.ts'), 'features: { assemblyMap: true }')
    expect(figureExpected(root)).toBe(true)
    writeFileSync(join(root, 'packs', '_active', 'course.config.ts'), 'features: { assemblyMap: false }')
    expect(figureExpected(root)).toBe(false)
  })
})
