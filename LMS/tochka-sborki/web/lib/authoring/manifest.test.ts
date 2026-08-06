import { describe, it, expect } from 'vitest'
import { checkManifest, CORE_MANIFEST } from './manifest'
import type { ManifestRule } from './manifest'

describe('checkManifest', () => {
  const rules: ManifestRule[] = [
    { pattern: 'гарантируем|гарантирую', label: 'обещание гарантии' },
    { pattern: 'only \\d+ seats', flags: 'i', label: 'scarcity seats' },
  ]

  it('returns [] on clean text', () => {
    expect(checkManifest('Спокойный честный текст о практике.', rules)).toEqual([])
  })

  it('reports {label, match} per triggered rule', () => {
    const findings = checkManifest('Мы ГАРАНТИРУЕМ вам место — Only 3 seats!', rules)
    expect(findings).toEqual([
      { label: 'обещание гарантии', match: 'ГАРАНТИРУЕМ' },
      { label: 'scarcity seats', match: 'Only 3 seats' },
    ])
  })

  it('defaults to case-insensitive when flags omitted', () => {
    expect(checkManifest('ГаРанТиРуЮ', rules)).toHaveLength(1)
  })
})

describe('CORE_MANIFEST (общее ядро академии)', () => {
  it('catches scarcity and guaranteed-results copy (RU + EN)', () => {
    const dirty = 'Успей записаться — только сегодня скидка сгорает! Guaranteed results.'
    const labels = checkManifest(dirty, CORE_MANIFEST).map(f => f.label)
    expect(labels.length).toBeGreaterThanOrEqual(3)
    expect(labels.join(' ')).toMatch(/scarcity/)
    expect(labels.join(' ')).toMatch(/гарантированный результат/)
  })

  it('stays silent on honest copy, including negations of promises', () => {
    const honest = [
      'Курс не гарантирует комфорта и не обещает результата.',
      'Practice does not guarantee comfort; there is no deadline.',
      'Поддержка promotional discount в чекауте.', // техдока, не хайп
      'Where pipes are joined in a hurry — it drips.',
    ].join('\n')
    expect(checkManifest(honest, CORE_MANIFEST)).toEqual([])
  })
})
