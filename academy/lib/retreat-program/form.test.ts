import { describe, expect, it } from 'vitest'
import { decodeToolLink, encodeToolLink, TOOL_MAX_FRAGMENT } from '../retreat-core/tool-link'
import { defaultForm as timelineDefaultForm, timelineHash } from '../retreat-timeline/form'
import { PRACTICE_LIMITS, starterCards } from './practices'
import { defaultBlocks, pickProgramTool } from './grid'
import { defaultForm, draftOf, draftWorthKeeping, formFromDecoded, formFromDraft, programHash, reconcileMeals, registryFromStorage, restoreStarter, withDraftBlocks } from './form'

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

  it('keeps a valuable draft blocks when a passport-only link is opened', () => {
    const draft = defaultForm(today); draft.blocks = [{ day: 2, start: '09:00', minutes: 30, kind: 'practice', practiceId: 'x' }]
    const link = encodeToolLink({ v: 1, retreat: { title: 'From link' }, tool: {} })
    const decoded = formFromDecoded(decodeToolLink(link, pickProgramTool, 'ru'), today)!
    expect(withDraftBlocks(decoded.form, draft, decoded.linkHasBlocks)).toEqual({ passport: expect.objectContaining({ title: 'From link' }), blocks: draft.blocks })
  })

  it('prefers blocks carried by a program link and detects valuable drafts', () => {
    const draft = defaultForm(today); draft.blocks = [{ day: 2, start: '09:00', minutes: 30, kind: 'practice', practiceId: 'x' }]
    const linked = { ...defaultForm(today), blocks: [{ day: 3, start: '10:00', minutes: 30, kind: 'free' as const }] }
    expect(withDraftBlocks(linked, draft, true)).toEqual(linked)
    expect(draftWorthKeeping(draftOf(defaultForm(today)), linked, today)).toBe(false)
    expect(draftWorthKeeping(draftOf(draft), linked, today)).toBe(true)
  })

  it('reconciles new days and only untouched default meals', () => {
    const before = { nights: 6, arrivalMeal: 'lunch' as const, departureMeal: 'breakfast' as const }
    const after = { ...before, nights: 7 }
    const extended = reconcileMeals(defaultBlocks(before), before, after)
    expect(extended.filter((b) => b.day === 7).map((b) => b.start).sort()).toEqual(['08:00', '13:00', '19:00'])
    expect(extended.filter((b) => b.day === 8).map((b) => b.start)).toEqual(['08:00'])
    const changed = reconcileMeals(defaultBlocks(before), before, { ...before, arrivalMeal: 'dinner' })
    expect(changed.filter((b) => b.day === 1).map((b) => b.start)).toEqual(['19:00'])
    const custom = defaultBlocks(before).map((b) => b.day === 1 && b.start === '13:00' ? { ...b, title: 'мой обед' } : b)
    expect(reconcileMeals(custom, before, { ...before, arrivalMeal: 'dinner' }).filter((b) => b.day === 1).map((b) => b.title)).toContain('мой обед')
  })

  it('restores missing starter ids without renaming own or edited cards', () => {
    const starter = starterCards('en'); const edited = { ...starter[0], name: 'Edited' }
    const restored = restoreStarter([edited], 'en')
    expect(restored.filter((card) => card.id === starter[0].id)).toEqual([edited])
    expect(restored.filter((card) => card.id === starter[1].id)).toHaveLength(1)
    expect(restored.map((card) => card.id)).toEqual([...new Set(restored.map((card) => card.id))])
  })
})
