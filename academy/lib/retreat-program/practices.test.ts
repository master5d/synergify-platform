import { describe, expect, it } from 'vitest'
import { STARTER } from './starter'
import { checkCard, emptyCard, mergeRegistry, pickCard, registryFromJson, registryToJson, starterCards, type PracticeCard } from './practices'

const card = (id = 'x', patch: Partial<PracticeCard> = {}): PracticeCard => ({ ...emptyCard(id), name: 'X', groupMinutes: 10, ...patch })
describe('practice registry', () => {
  it('builds clean bilingual starter sets with stable structure', () => {
    const ru = starterCards('ru'); const en = starterCards('en')
    expect(ru).toHaveLength(STARTER.length); expect(en).toHaveLength(STARTER.length)
    expect(ru.length).toBeGreaterThan(0); expect(new Set(ru.map((x) => x.id)).size).toBe(ru.length)
    expect(ru.flatMap(checkCard)).toEqual([]); expect(en.flatMap(checkCard)).toEqual([])
    expect(ru.map(({ id, format, load, touch, groupMinutes, pairMinutes, added }) => ({ id, format, load, touch, groupMinutes, pairMinutes, added }))).toEqual(en.map(({ id, format, load, touch, groupMinutes, pairMinutes, added }) => ({ id, format, load, touch, groupMinutes, pairMinutes, added })))
    expect(ru.flatMap((x) => x.added)).not.toContain('evil')
  })
  it('keeps raw starter added fields allowlisted', () => {
    const allowed = new Set(Object.keys(emptyCard('x')))
    for (const source of STARTER) expect(source.added.every((field) => allowed.has(field))).toBe(true)
  })
  it('keeps forbidden words out of every bilingual starter field', () => {
    const forbidden = /аяуаск|ayahuasca|flush|детокс|detox|экстрасенс|целительск/iu
    for (const source of STARTER) for (const value of Object.values(source)) {
      if (!value || typeof value !== 'object') continue
      for (const text of Object.values(value as Record<string, string>)) expect(text).not.toMatch(forbidden)
    }
  })
  it('keeps every bilingual starter sentence under 25 words', () => {
    for (const source of STARTER) for (const value of Object.values(source)) {
      if (!value || typeof value !== 'object') continue
      for (const text of Object.values(value as Record<string, string>)) for (const sentence of text.split(/(?<=[.!?])\s+/)) {
        const words = sentence.trim() ? sentence.trim().split(/\s+/) : []
        expect(words.length).toBeLessThan(25)
      }
    }
  })
  it('keeps duration issues distinct', () => {
    const pairPerCouple = pickCard({ ...emptyCard('pair'), name: 'P', format: 'pair', groupMinutes: null, pairMinutes: 10 })!
    expect(checkCard(pairPerCouple).map((x) => x.id)).toEqual(['pair-duration'])
    expect(checkCard(card('none', { groupMinutes: null, pairMinutes: null })).map((x) => x.id)).toEqual(['no-duration'])
    const pairWithoutDuration = pickCard({ ...emptyCard('pair-none'), name: 'Pair', format: 'pair', groupMinutes: null, pairMinutes: null })!
    expect(checkCard(pairWithoutDuration).map((x) => x.id)).toEqual(['no-duration'])
  })
  it('checks consent, contraindications and only promise-bearing fields', () => {
    expect(checkCard(card('a', { description: 'Эта практика исцеляет тревогу' })).find((x) => x.id === 'promise-in-text')?.field).toBe('description')
    expect(checkCard(card('b', { description: 'Практика не лечит и не исцеляет' })).some((x) => x.id === 'promise-in-text')).toBe(true)
    expect(checkCard(card('c', { notPromise: 'Практика не лечит и не исцеляет' })).some((x) => x.id === 'promise-in-text')).toBe(false)
    expect(checkCard(card('d', { description: 'heals anxiety' })).some((x) => x.id === 'promise-in-text')).toBe(true)
    expect(checkCard(card('e', { load: 'high', contraindications: '' })).map((x) => x.id)).toContain('high-load-without-contraindications')
    expect(checkCard(card('f', { touch: true, touchConsent: '' })).map((x) => x.id)).toContain('touch-without-consent')
  })
  it('imports an allowlisted, bounded registry', () => {
    expect(registryFromJson('{').error).toBe('broken')
    const imported = registryFromJson('{"v":1,"cards":[{"id":"x","name":"X","evil":1}]}')
    expect(imported.cards).toHaveLength(1); expect(imported.cards[0]).not.toHaveProperty('evil')
    expect(registryFromJson('{"v":2,"cards":[]}').error).toBe('not-registry')
    const many = Array.from({ length: 500 }, (_, i) => card(`x-${i}`, { name: `X${i}` }))
    expect(registryFromJson(registryToJson(many)).cards).toHaveLength(200)
  })
  it('round-trips both starter registries', () => {
    expect(registryFromJson(registryToJson(starterCards('ru'))).cards).toEqual(starterCards('ru'))
    expect(registryFromJson(registryToJson(starterCards('en'))).cards).toEqual(starterCards('en'))
  })
  it('merges without changing own cards', () => {
    const own = [card('breath', { name: 'Own' }), card('breath-2', { name: 'Occupied' })]
    const result = mergeRegistry(own, [card('breath', { name: 'Incoming' }), card('breath', { name: 'Own' })])
    expect(result.cards[0]).toEqual(own[0]); expect(result.cards.map((x) => x.id)).toEqual(['breath', 'breath-2', 'breath-3']); expect(result.renamed).toEqual(['breath'])
  })
  it('renames a different incoming card when breath-2 is free', () => {
    const result = mergeRegistry([card('breath', { name: 'Own' })], [card('breath', { name: 'Incoming' })])
    expect(result.cards.map((x) => x.id)).toEqual(['breath', 'breath-2'])
    expect(result.renamed).toEqual(['breath']); expect(result.cards[0]).toEqual(card('breath', { name: 'Own' }))
  })
  it('does not rename an equal card when object keys are reordered', () => {
    const own = card('breath', { name: 'Own' })
    const reordered = JSON.parse(JSON.stringify({ added: own.added, source: own.source, notPromise: own.notPromise, needs: own.needs, description: own.description, guestDoes: own.guestDoes, contraindications: own.contraindications, touchConsent: own.touchConsent, touch: own.touch, load: own.load, pairMinutes: own.pairMinutes, groupMinutes: own.groupMinutes, groupSize: own.groupSize, format: own.format, name: own.name, id: own.id })) as PracticeCard
    expect(mergeRegistry([own], [reordered])).toEqual({ cards: [own], renamed: [] })
  })
})
