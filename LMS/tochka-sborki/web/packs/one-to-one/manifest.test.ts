import { describe, it, expect } from 'vitest'
import { checkManifest } from '../../lib/authoring/manifest'
import { MANIFEST } from './manifest'

describe('one-to-one manifest — promising forms only', () => {
  const PROMISES: [string, RegExp][] = [
    ['гарантированный доход', /гарантированный доход/],
    ['поток клиентов', /поток клиентов/],
    ['исцеление', /исцеления/],
  ]
  const DIRTY = {
    ru: ['После курса ты гарантированно заработаешь.', 'Курс даст тебе поток клиентов.', 'Сессия исцеляет тревогу.'],
    en: ['Guaranteed income from your sessions.', 'You will get a steady stream of clients.', 'The session heals anxiety.'],
  }
  for (const lang of ['ru', 'en'] as const) {
    PROMISES.forEach(([name, label], i) => {
      it('раздельно ловит обещание', () => {
        const labels = checkManifest(DIRTY[lang][i], MANIFEST).map(f => f.label).join(' | ')
        expect(labels).toMatch(label)
      })
    })
  }
  it('честные формулировки не матчатся', () => {
    const honest = [
      'Курс не обещает дохода и потока клиентов.',
      'Посчитай, сколько ты заработаешь при 15 часах вместо 25.',
      'Work out how much you will earn with 15 hours instead of 25.',
      'The course does not promise clients or income.',
      'Сессия не лечит и не заменяет врача.',
    ].join('\\n')
    expect(checkManifest(honest, MANIFEST)).toEqual([])
  })
})
