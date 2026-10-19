import { describe, expect, it } from 'vitest'
import { defaultBlocks, checkGrid, dayLoad, freeMinutes, blockTitle, pickProgramTool } from './grid'
import { emptyCard, type PracticeCard } from './practices'

const passport = { nights: 6 }
const card = (id: string, load: PracticeCard['load'] = 'low', extra: Partial<PracticeCard> = {}): PracticeCard => ({ ...emptyCard(id), name: id, groupMinutes: 60, load, contraindications: 'ok', ...extra })
const block = (start: string, minutes = 60, extra: Record<string, unknown> = {}) => ({ day: 2, start, minutes, kind: 'practice' as const, practiceId: 'a', ...extra })
const issues = (blocks: Parameters<typeof checkGrid>[1], cards: PracticeCard[] = [card('a')]) => checkGrid(passport, blocks, cards)

describe('program grid', () => {
  it('T1 builds the expected meal blocks for six nights', () => {
    const blocks = defaultBlocks(passport)
    expect(blocks).toHaveLength(18); expect(blocks.every((b) => b.kind === 'meal' && b.minutes === 60)).toBe(true)
    expect(blocks.filter((b) => b.start === '08:00')).toHaveLength(6); expect(blocks.filter((b) => b.start === '13:00')).toHaveLength(6); expect(blocks.filter((b) => b.start === '19:00')).toHaveLength(6)
    expect(blocks.filter((b) => b.day === 1 && b.start === '08:00')).toHaveLength(0); expect(blocks.filter((b) => b.day === 7)).toHaveLength(1); expect(blocks.filter((b) => b.day === 7 && b.start === '08:00')).toHaveLength(1)
  })
  it('T2 reports overlap against the maximum end of all previous blocks', () => {
    expect(issues([block('10:00', 180), block('10:30', 30), block('12:00')])).toEqual(expect.arrayContaining([{ id: 'overlap', day: 2, start: '10:30' }, { id: 'overlap', day: 2, start: '12:00' }]))
    expect(issues([block('10:00', 90), block('11:00')])).toContainEqual({ id: 'overlap', day: 2, start: '11:00' })
    expect(issues([block('10:00', 60), block('11:00')]).some((i) => i.id === 'overlap')).toBe(false)
  })
  it('T3 distinguishes outside-day and off-step blocks', () => {
    expect(issues([block('23:30')]).some((i) => i.id === 'outside-day')).toBe(true); expect(issues([block('04:30')]).some((i) => i.id === 'outside-day')).toBe(true); expect(issues([block('10:15')]).some((i) => i.id === 'off-step')).toBe(true)
  })
  it('allows morning practice from 05:00', () => {
    expect(issues([block('05:30', 150)]).some((i) => i.id === 'outside-day')).toBe(false)
    expect(issues([block('04:30', 30)]).some((i) => i.id === 'outside-day')).toBe(true)
  })
  it('T4 uses rendered block duration for free minutes', () => { expect(freeMinutes(2, [{ day: 2, start: '12:00', minutes: 0, kind: 'free' }])).toBe(30) })
  it('T5 resets a high-load chain on free, meal, low, and missing practices but not transfer or other', () => {
    const high = card('a', 'high'); const low = card('b', 'low')
    expect(issues([block('10:00', 90), block('11:30')], [high])).toContainEqual({ id: 'two-high-in-a-row', day: 2, start: '11:30' })
    expect(issues([{ ...block('10:00') }, { ...block('11:00'), kind: 'free', practiceId: undefined }, { ...block('11:30') }], [high]).some((i) => i.id === 'two-high-in-a-row')).toBe(false)
    expect(issues([{ ...block('10:00') }, { ...block('11:00'), kind: 'meal', practiceId: undefined }, { ...block('11:30') }], [high]).some((i) => i.id === 'two-high-in-a-row')).toBe(false)
    expect(issues([{ ...block('10:00') }, { ...block('11:00'), practiceId: 'b' }, { ...block('11:30') }], [high, low]).some((i) => i.id === 'two-high-in-a-row')).toBe(false)
    expect(issues([{ ...block('10:00') }, { ...block('11:00'), practiceId: 'gone' }, { ...block('11:30') }], [high]).some((i) => i.id === 'two-high-in-a-row')).toBe(false)
    expect(issues([{ ...block('10:00') }, { day: 2, start: '11:00', minutes: 30, kind: 'transfer' }, { ...block('11:30') }], [high]).some((i) => i.id === 'two-high-in-a-row')).toBe(true)
    expect(issues([{ ...block('10:00') }, { day: 2, start: '11:00', minutes: 30, kind: 'other' }, { ...block('11:30') }], [high]).some((i) => i.id === 'two-high-in-a-row')).toBe(true)
  })
  it('T6 requires free time only on interior retreat days', () => { const found = issues([block('10:00')]); expect(found).toContainEqual({ id: 'no-free-time', day: 3 }); expect(found.some((i) => i.id === 'no-free-time' && (i.day === 1 || i.day === 7))).toBe(false) })
  it('T7 reports pair duration and clears it when minutes are supplied', () => { const pair = card('a', 'low', { format: 'pair', groupMinutes: null, pairMinutes: 30 }); expect(issues([block('10:00', 0)], [pair]).some((i) => i.id === 'pair-duration')).toBe(true); expect(issues([block('10:00', 40)], [pair]).some((i) => i.id === 'pair-duration')).toBe(false) })
  it('T8 emits one touch-check-form for two touch blocks', () => { const touch = card('a', 'low', { touch: true }); expect(issues([block('10:00'), block('12:00')], [touch]).filter((i) => i.id === 'touch-check-form')).toHaveLength(1) })
  it('flags high load without contraindications', () => { expect(issues([block('10:00')], [card('a', 'high', { contraindications: '' })]).filter((i) => i.id === 'high-load-without-contraindications')).toHaveLength(1) })
  it('T9 preserves a missing practice title in issues and CSV-facing title lookup', () => { const missing = { ...block('10:00', 30), practiceId: 'gone', title: 'Старая практика' }; expect(issues([missing], [])).toContainEqual({ id: 'practice-missing', day: 2, start: '10:00' }); expect(blockTitle(missing, [], 'ru')).toBe('Старая практика') })
  it('T10 computes maximum day load and free minutes, with null for no practices', () => { const blocks = [block('10:00'), { ...block('11:00'), practiceId: 'high' }, { day: 2, start: '13:00', minutes: 30, kind: 'free' as const }, { day: 2, start: '14:00', minutes: 60, kind: 'free' as const }]; expect(dayLoad(2, blocks, [card('a', 'low'), card('high', 'high')])).toBe('high'); expect(freeMinutes(2, blocks)).toBe(90); expect(dayLoad(3, blocks, [card('a')])).toBeNull() })
  it('T12 accepts only valid block days and strips block/card extras', () => { const raw = { blocks: [{ day: 0, start: '10:00', minutes: 30, kind: 'free' }, { day: 1, start: '10:15', minutes: 30, kind: 'free' }, ...Array.from({ length: 400 }, () => ({ day: 1, start: '10:00', minutes: 30, kind: 'free', evil: true }))], cards: [{ id: 'a', name: 'A', format: 'group', groupMinutes: null, pairMinutes: null, evil: true }] }; const picked = pickProgramTool(raw); expect(picked.blocks).toHaveLength(300); expect(picked.blocks[0]).not.toHaveProperty('evil'); expect(picked.cards[0]).not.toHaveProperty('evil'); expect(picked.blocks.some((b) => b.day === 0 || b.start === '10:15')).toBe(false) })
  it('flags no-buffer when practice at 14:00 is immediately after lunch 13:00-14:00', () => {
    expect(issues([{ day: 2, start: '13:00', minutes: 60, kind: 'meal' as const }, block('14:00')])).toContainEqual({ id: 'no-buffer', day: 2, start: '14:00' })
  })
  it('does not flag no-buffer when practice at 14:30 follows lunch 13:00-14:00', () => {
    expect(issues([{ day: 2, start: '13:00', minutes: 60, kind: 'meal' as const }, block('14:30')]).some((i) => i.id === 'no-buffer')).toBe(false)
  })
  it('flags no-buffer for two practices back to back', () => {
    expect(issues([block('10:00', 60), block('11:00')])).toContainEqual({ id: 'no-buffer', day: 2, start: '11:00' })
  })
  it('does not flag no-buffer when meal follows free block', () => {
    expect(issues([{ day: 2, start: '11:00', minutes: 60, kind: 'free' as const }, { day: 2, start: '12:00', minutes: 60, kind: 'meal' as const }]).some((i) => i.id === 'no-buffer')).toBe(false)
  })
  it('emits exactly one no-buffer issue when three joints occur on the same day', () => {
    const blocks = [{ day: 2, start: '10:00', minutes: 60, kind: 'meal' as const }, block('11:00'), block('12:00'), block('13:00')]
    const found = issues(blocks).filter((i) => i.id === 'no-buffer')
    expect(found).toEqual([{ id: 'no-buffer', day: 2, start: '11:00' }])
  })
  it('does not flag no-buffer for a practice right after a free block', () => {
    expect(issues([{ day: 2, start: '10:00', minutes: 60, kind: 'free' as const }, block('11:00')]).some((i) => i.id === 'no-buffer')).toBe(false)
  })
  it('does not flag no-buffer for a practice right after a transfer', () => {
    expect(issues([{ day: 2, start: '10:00', minutes: 60, kind: 'transfer' as const }, block('11:00')]).some((i) => i.id === 'no-buffer')).toBe(false)
  })
  it('does not flag no-buffer for a meal right after a meal', () => {
    const meals = [{ day: 2, start: '08:00', minutes: 60, kind: 'meal' as const }, { day: 2, start: '09:00', minutes: 60, kind: 'meal' as const }]
    expect(issues(meals).some((i) => i.id === 'no-buffer')).toBe(false)
  })
  it('does not treat an overlap as a no-buffer join', () => {
    expect(issues([block('10:00', 90), block('11:00')]).some((i) => i.id === 'no-buffer')).toBe(false)
  })
  it('takes the block length from the card when the block has no minutes', () => {
    expect(issues([block('10:00', 0), { day: 2, start: '11:00', minutes: 60, kind: 'meal' as const }])).toContainEqual({ id: 'no-buffer', day: 2, start: '11:00' })
  })
})
