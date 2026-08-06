// Закрепляет шрам «regex-над-прозой»: манифест living-practice ловит ОБЕЩАЮЩИЕ
// формы и молчит на честных отрицаниях, которыми курс и написан.
import { describe, it, expect } from 'vitest'
import { checkManifest } from '../../lib/authoring/manifest'
import { MANIFEST } from './manifest'

describe('living-practice manifest — promising forms only', () => {
  it('catches first-person guarantees, healing promises, therapy replacement, superpowers-as-result', () => {
    const dirty = [
      'Мы гарантируем: практика исцелит тревогу.',
      'Этот курс заменит психотерапию.',
      'Ты обретёшь сверхспособности уже к третьему уроку.',
      'The circle will heal you and grants superpowers.',
    ].join('\n')
    const labels = checkManifest(dirty, MANIFEST).map(f => f.label).join(' | ')
    expect(labels).toMatch(/гарантия от первого лица/)
    expect(labels).toMatch(/исцелит/)
    expect(labels).toMatch(/заменит/)
    expect(labels).toMatch(/сверхспособности/)
  })

  it('«не гарантирует» и прочие честные отрицания курса НЕ матчатся', () => {
    const honest = [
      // дословные обороты из живого контента/словаря pack'а:
      'Осознанность без закупорки не гарантирует комфорта.',
      'Awareness without sealing over does not guarantee comfort.',
      'Практика не заменяет психотерапию. Чего здесь нет: замены психотерапии, сверхспособностей и «уровней».',
      'no promises of superpowers and "levels"',
      'excluded: a substitute for psychotherapy', // список «чего здесь НЕТ» в EN-словаре
      'граница «практика не терапия»; всё трудное отправляется «на психотерапию»',
    ].join('\n')
    expect(checkManifest(honest, MANIFEST)).toEqual([])
  })
})
