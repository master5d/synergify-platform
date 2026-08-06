import { describe, it, expect } from 'vitest'
import { INTRO, PACKS, PROMPT_KIT, VERIFY_CHECKLIST, resolveNotebookPack, resolvePromptKit, resolveChecklist } from './notebook-pack'
import { lintDehustle } from '@/lib/authoring/dehustle'
import { PACK_SLUG } from '@/lib/pack'

const allBi = () => {
  const out: { ru: string; en: string }[] = []
  out.push(...INTRO)
  for (const p of PACKS) {
    out.push(p.title, p.situation, p.sources, ...p.steps)
  }
  for (const pr of PROMPT_KIT) out.push(pr.label, pr.prompt)
  out.push(...VERIFY_CHECKLIST)
  return out
}

describe('notebook-pack data', () => {
  it('обе локали заполнены у каждой строки', () => {
    for (const b of allBi()) {
      expect(b.ru.trim().length).toBeGreaterThan(0)
      expect(b.en.trim().length).toBeGreaterThan(0)
    }
  })
  it('копи чистая по lintDehustle', () => {
    for (const b of allBi()) {
      expect(lintDehustle(b.ru)).toEqual([])
      expect(lintDehustle(b.en)).toEqual([])
    }
  })
  it('паки с ожидаемыми id', () => {
    // Для Точки Сборки состав пинован 1-в-1; для других pack'ов — непустой и без дублей.
    if (PACK_SLUG === 'tochka-sborki') {
      expect(PACKS.map(p => p.id)).toEqual(['youtube-playlist', 'lesson-sources', 'own-docs'])
    } else {
      expect(PACKS.length).toBeGreaterThan(0)
      expect(new Set(PACKS.map(p => p.id)).size).toBe(PACKS.length)
    }
  })
  it('каждый промпт требует цитату с точкой в источнике', () => {
    for (const pr of PROMPT_KIT) {
      expect(pr.prompt.ru).toMatch(/цитат/i)
      expect(pr.prompt.en).toMatch(/quot/i)
    }
  })
  it('чек-лист верификации не короче 5 пунктов', () => {
    expect(VERIFY_CHECKLIST.length).toBeGreaterThanOrEqual(5)
  })
  it('resolver: локаль и fail-closed', () => {
    const r = resolveNotebookPack(PACKS[0].id, 'en')
    expect(r?.title).toBeTruthy()
    expect(resolveNotebookPack('nope', 'ru')).toBeNull()
    expect(resolvePromptKit('ru').length).toBe(PROMPT_KIT.length)
    expect(resolveChecklist('en').length).toBe(VERIFY_CHECKLIST.length)
  })
})
