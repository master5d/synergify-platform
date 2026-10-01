import { describe, it, expect } from 'vitest'
import { parseOutcome } from './parse-outcome'

describe('parseOutcome', () => {
  it('новая анкета: V_OUTCOME (строка JSON и объект)', () => {
    expect(parseOutcome({ answers: JSON.stringify({ V_OUTCOME: 'собрать лендинг' }) })).toBe('собрать лендинг')
    expect(parseOutcome({ answers: { V_OUTCOME: '  ship my course ' } })).toBe('ship my course')
  })
  it('старая анкета: F3', () => {
    expect(parseOutcome({ answers: JSON.stringify({ F3: 'больше клиентов' }) })).toBe('больше клиентов')
    expect(parseOutcome({ answers: { F3: 'more clients' } })).toBe('more clients')
  })
  it('оба ключа — приоритет у V_OUTCOME; пустой V_OUTCOME уступает F3', () => {
    expect(parseOutcome({ answers: { V_OUTCOME: 'новое', F3: 'старое' } })).toBe('новое')
    expect(parseOutcome({ answers: { V_OUTCOME: '   ', F3: 'старое' } })).toBe('старое')
  })
  it('пусто: нет ключей, пустые строки, не строка, битый JSON, нет профиля', () => {
    expect(parseOutcome({ answers: {} })).toBeNull()
    expect(parseOutcome({ answers: { V_OUTCOME: '', F3: ' ' } })).toBeNull()
    expect(parseOutcome({ answers: { V_OUTCOME: 42 } })).toBeNull()
    expect(parseOutcome({ answers: '{bad' })).toBeNull()
    expect(parseOutcome({})).toBeNull()
    expect(parseOutcome(null)).toBeNull()
  })
})
