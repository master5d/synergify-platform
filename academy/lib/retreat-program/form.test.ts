import { describe, expect, it } from 'vitest'
import { decodeToolLink, encodeToolLink, TOOL_MAX_FRAGMENT } from '../retreat-core/tool-link'
import { defaultForm as timelineDefaultForm, timelineHash } from '../retreat-timeline/form'
import { PRACTICE_LIMITS, starterCards } from './practices'
import { defaultBlocks, pickProgramTool } from './grid'
import {
  defaultForm, draftCardsOf, draftOf, draftWorthKeeping, formAndCardsFromDraft, formFromDecoded, formFromDraft,
  migrateLegacy, programDraftKey, programPrevKey, programHash, reconcileMeals, registryFromStorage,
  restoreStarter, withDraftBlocks,
} from './form'

const today = '2026-10-18' as const

describe('program form', () => {
  it('uses different draft and previous-draft keys for each language', () => {
    expect(programDraftKey('ru')).not.toBe(programDraftKey('en'))
    expect(programPrevKey('ru')).not.toBe(programPrevKey('en'))
  })

  it('moves a legacy draft to the language key and removes the old key', () => {
    const values: Record<string, string> = { 'retreat-program:draft': 'legacy' }
    const storage = {
      getItem: (key: string) => values[key] ?? null,
      setItem: (key: string, value: string) => { values[key] = value },
      removeItem: (key: string) => { delete values[key] },
    }
    expect(migrateLegacy(storage, 'ru', 'draft')).toBe('legacy')
    expect(values['retreat-program:draft:ru']).toBe('legacy')
    expect(values['retreat-program:draft']).toBeUndefined()
  })

  it('does not find the old draft after migration', () => {
    const values: Record<string, string> = { 'retreat-program:draft': 'legacy' }
    const storage = {
      getItem: (key: string) => values[key] ?? null,
      setItem: (key: string, value: string) => { values[key] = value },
      removeItem: (key: string) => { delete values[key] },
    }
    migrateLegacy(storage, 'ru', 'draft')
    expect(storage.getItem('retreat-program:draft')).toBeNull()
    expect(migrateLegacy(storage, 'en', 'draft')).toBeNull()
  })

  it('keeps the legacy draft untouched when the language key exists', () => {
    const values: Record<string, string> = { 'retreat-program:draft:ru': 'language', 'retreat-program:draft': 'legacy' }
    const storage = {
      getItem: (key: string) => values[key] ?? null,
      setItem: (key: string, value: string) => { values[key] = value },
      removeItem: (key: string) => { delete values[key] },
    }
    expect(migrateLegacy(storage, 'ru', 'draft')).toBe('language')
    expect(values['retreat-program:draft']).toBe('legacy')
  })

  it('does not restore a removed previous draft', () => {
    const values: Record<string, string> = { 'retreat-program:draft-before-link:ru': 'previous' }
    const storage = {
      getItem: (key: string) => values[key] ?? null,
      setItem: (key: string, value: string) => { values[key] = value },
      removeItem: (key: string) => { delete values[key] },
    }
    expect(migrateLegacy(storage, 'ru', 'previous')).toBe('previous')
    storage.removeItem(programPrevKey('ru'))
    expect(migrateLegacy(storage, 'ru', 'previous')).toBeNull()
  })

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

  it('round-trips a linked card referenced by a draft block', () => {
    const card = starterCards('ru')[0]
    const f = defaultForm(today)
    f.blocks = [{ ...f.blocks[0], kind: 'practice', practiceId: card.id }]
    const result = formAndCardsFromDraft(draftOf(f, [card]), today)
    expect(result?.cards).toEqual([card])
  })

  it('does not save a card that is not referenced by a draft block', () => {
    const cards = starterCards('ru').slice(0, 2)
    const f = defaultForm(today)
    f.blocks = [{ ...f.blocks[0], kind: 'practice', practiceId: cards[0].id }]
    expect(formAndCardsFromDraft(draftOf(f, cards), today)?.cards).toEqual([cards[0]])
  })

  it('does not put a registry card into a draft when a block references it', () => {
    const [inRegistry, fromLink] = starterCards('ru')
    const own = { ...fromLink, id: 'my-linkonly' }
    const f = defaultForm(today)
    f.blocks = [
      { ...f.blocks[0], kind: 'practice', practiceId: inRegistry.id },
      { ...f.blocks[0], kind: 'practice', practiceId: own.id },
    ]
    const cards = draftCardsOf([inRegistry, own], [inRegistry])
    expect(cards).toEqual([own])
    expect(formAndCardsFromDraft(draftOf(f, cards), today)?.cards).toEqual([own])
  })

  it('reads an old draft with an empty cards array', () => {
    const f = defaultForm(today)
    const old = JSON.stringify({ passport: f.passport, tool: { blocks: f.blocks, cards: [] } })
    expect(formFromDraft(old, today)).toEqual(f)
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
  it('does not set aside an edited copy of the same lesson week', () => {
    const week = { ...defaultForm(today), passport: { ...defaultForm(today).passport, title: 'Учебная неделя' } }
    const edited = { ...week, blocks: [...week.blocks, { day: 2, start: '10:00', minutes: 60, kind: 'free' as const }] }
    expect(draftWorthKeeping(draftOf(edited), week, today)).toBe(false)
    const own = { ...edited, passport: { ...edited.passport, title: 'Моя неделя' } }
    expect(draftWorthKeeping(draftOf(own), week, today)).toBe(true)
  })
})
