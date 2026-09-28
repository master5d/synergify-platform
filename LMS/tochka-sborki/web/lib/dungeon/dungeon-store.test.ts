import { describe, it, expect } from 'vitest'
import { markCleared, isCleared, dungeonStageId, legacyAliases } from './dungeon-store'

describe('markCleared / isCleared', () => {
  it('marks an id once and reports it cleared', () => {
    const s = { clearedIds: [] as string[] }
    const next = markCleared(s, 'dungeon:04-prompt-engineering:s1')
    expect(isCleared(next, 'dungeon:04-prompt-engineering:s1')).toBe(true)
  })
  it('is idempotent for a repeated id', () => {
    const s = { clearedIds: ['x'] }
    expect(markCleared(s, 'x').clearedIds).toEqual(['x'])
  })
  it('does not mutate the input', () => {
    const s = { clearedIds: [] as string[] }
    markCleared(s, 'y')
    expect(s.clearedIds).toEqual([])
  })
  it('isCleared is false for unknown id', () => {
    expect(isCleared({ clearedIds: ['a'] }, 'b')).toBe(false)
  })
})

describe('пройденность по модулю подземелья', () => {
  it('ид — в пространстве модуля', () => {
    expect(dungeonStageId('07-tools', 'boss')).toBe('dungeon:07-tools:boss')
  })
  it('старый нишевой ключ засчитывается только для того же модуля', () => {
    const old = { clearedIds: ['dungeon:coach:boss', 'dungeon:content:s1'] }
    expect(isCleared(old, 'dungeon:04-prompt-engineering:boss')).toBe(true) // coach → 04
    expect(isCleared(old, 'dungeon:07-tools:boss')).toBe(false)             // coach ≠ 07
    expect(isCleared(old, 'dungeon:06-audio-pipeline:s1')).toBe(true)       // content → 06
    expect(isCleared(old, 'dungeon:06-audio-pipeline:boss')).toBe(false)    // другой этап
    expect(isCleared(old, 'dungeon:00-kickstart:boss')).toBe(false)
  })
  it('у модуля без старой привязки алиасов нет', () => {
    expect(legacyAliases('dungeon:00-kickstart:boss')).toEqual([])
    expect(legacyAliases('мусор')).toEqual([])
  })
})
