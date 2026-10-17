// Закрепляет шрам «regex-над-прозой»: манифест retreat ловит ОБЕЩАЮЩИЕ формы
// и молчит на честных отрицаниях, которыми курс и написан.
import { describe, it, expect } from 'vitest'
import { checkManifest } from '../../lib/authoring/manifest'
import { MANIFEST } from './manifest'

describe('retreat manifest — promising forms only', () => {
  it('catches income, full-group, legal-safety and healing promises', () => {
    const dirty = [
      'После курса ты гарантированно заработаешь на первом ретрите.',
      'Мы наполним вашу группу за месяц.',
      'Такой договор юридически безопасен.',
      'Практика исцеляет тревогу.',
      'Guaranteed income from day one; we will fill your retreat; legally bulletproof; the retreat heals.',
    ].join('\n')
    const labels = checkManifest(dirty, MANIFEST).map(f => f.label).join(' | ')
    expect(labels).toMatch(/гарантированный доход/)
    expect(labels).toMatch(/наполним группу/)
    expect(labels).toMatch(/юридической защиты/)
    expect(labels).toMatch(/исцеления/)
  })

  it('честные отрицания курса НЕ матчатся', () => {
    const honest = [
      'Курс не обещает дохода и полной группы.',
      'Посчитай, сколько ты заработаешь при 12 гостях вместо 20.',
      'Work out how much you will earn with 12 guests instead of 20.',
      'Никто не наполнит группу за тебя: её собирает твоя аудитория.',
      'Это не юридическая консультация, проверь нормы для своей страны.',
      'Практика не лечит и не исцеляет; противопоказания названы в карточке.',
      'Минус 10 процентов за полную оплату.',
      'The course does not promise income or a full group.',
      'This is not legal advice; check the rules in your country.',
      'Ten percent off the full price for paying in full.',
    ].join('\n')
    expect(checkManifest(honest, MANIFEST)).toEqual([])
  })

  it('форма «N% скидка» ловится ядром — курс пишет «минус N процентов»', () => {
    expect(checkManifest('10% скидка за оплату целиком', MANIFEST).length).toBeGreaterThan(0)
  })
})
