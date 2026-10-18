import { describe, expect, it } from 'vitest'
import { decodeToolLink, TOOL_MAX_FRAGMENT } from '../retreat-core/tool-link'
import { defaultForm as timelineDefaultForm, timelineHash } from '../retreat-timeline/form'
import { PRACTICE_LIMITS, starterCards } from './practices'
import { defaultBlocks, pickProgramTool } from './grid'
import { defaultForm, draftOf, formFromDecoded, formFromDraft, programHash, registryFromStorage } from './form'

const today = '2026-10-18' as const

describe('program form', () => {
  it('round-trips a program link', () => {
    const f = defaultForm(today); const registry = starterCards('ru')
    f.blocks = f.blocks.slice(0, 2).map((b, i) => ({ ...b, kind: 'practice', practiceId: registry[i].id, minutes: 0 }))
    const result = formFromDecoded(decodeToolLink(programHash(f, registry), pickProgramTool, 'ru'), today)
    expect(result?.form).toEqual(f)
    expect(result?.cards).toEqual(registry.slice(0, 2))
  })

  it('puts only cards used by blocks into a link', () => {
    const registry = starterCards('ru'); const f = defaultForm(today)
    f.blocks = f.blocks.slice(0, 2).map((b, i) => ({ ...b, kind: 'practice', practiceId: registry[i].id }))
    const decoded = decodeToolLink(programHash(f, registry), pickProgramTool, 'ru')
    expect(decoded.ok && decoded.kind === 'tool' ? decoded.link.tool.cards : []).toHaveLength(2)
  })

  it('takes the passport from a timeline link and restores meal defaults', () => {
    const timeline = timelineDefaultForm(today); timeline.passport.nights = 6
    const result = formFromDecoded(decodeToolLink(timelineHash(timeline), pickProgramTool, 'ru'), today)
    expect(result?.form.passport.nights).toBe(6)
    expect(result?.form.blocks).toEqual(defaultBlocks(result!.form.passport))
    expect(result?.form.blocks).toHaveLength(18)
  })

  it('fits the whole RU starter set and 40 practice blocks into one link', () => {
    const cards = starterCards('ru')
    const f = defaultForm(today); f.blocks = Array.from({ length: 40 }, (_, i) => ({ day: (i % 6) + 1, start: `${String(7 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`, minutes: 30, kind: 'practice' as const, practiceId: cards[i % cards.length].id }))
    expect(programHash(f, cards).length).toBeLessThan(TOOL_MAX_FRAGMENT)
  })

  // 20 карточек со всеми полями по пределу ссылку превышают: страница проверяет длину и предлагает CSV и реестр JSON
  it('reports cards filled to the limit as longer than one link', () => {
    const cards = starterCards('en').slice(0, 20)
    const max = 'x'.repeat(PRACTICE_LIMITS.text); const filled = cards.map((c) => ({ ...c, touchConsent: max, contraindications: max, guestDoes: max, description: max, needs: max, notPromise: max, source: max }))
    const f = defaultForm(today); f.blocks = filled.map((c, i) => ({ day: (i % 6) + 1, start: `${String(7 + Math.floor(i / 6)).padStart(2, '0')}:00`, minutes: 30, kind: 'practice' as const, practiceId: c.id }))
    expect(programHash(f, filled).length).toBeGreaterThan(TOOL_MAX_FRAGMENT)
  })

  it('loads a registry from storage and falls back to the starter set', () => {
    expect(registryFromStorage(null, 'en')).toEqual(starterCards('en'))
    expect(registryFromStorage('{bad', 'en')).toEqual(starterCards('en'))
    expect(registryFromStorage(JSON.stringify({ v: 1, cards: [starterCards('en')[0]] }), 'en')).toEqual([starterCards('en')[0]])
  })

  it('round-trips drafts without card text', () => {
    const f = defaultForm(today); const text = draftOf(f)
    expect(formFromDraft(text, today)).toEqual(f)
    expect(text).not.toContain('description')
    expect(text).not.toContain('touchConsent')
  })
})
