// Закрепляет шрам «regex-над-прозой»: манифест ловит ОБЕЩАЮЩИЕ формы и молчит на честных
// отрицаниях, которыми модуль и должен быть написан.
import { describe, it, expect } from 'vitest'
import { checkPromises } from './promises'

describe('eidetics promises — promising forms only', () => {
  it('catches photographic/eidetic memory as an outcome, guarantees, «remember everything», N-fold claims', () => {
    const cases: [string, RegExp][] = [
      ['За месяц вы разовьёте фотографическую память.', /фотографическая/],
      ['Курс пробудит вашу эйдетическую память.', /фотографическая/],
      ['Train your brain and unlock photographic memory.', /photographic/],
      ['This module will give you eidetic memory.', /photographic/],
      ['Запомните всё с первого раза.', /запомните всё/],
      ['Мы гарантируем результат.', /гарантия/],
      ['Память станет в 10 раз лучше.', /кратный/],
    ]
    for (const [text, label] of cases) {
      const labels = checkPromises(text).map(f => f.label).join(' | ')
      expect(labels, text).toMatch(label)
    }
  })

  it('honest negations and neutral mentions do NOT match', () => {
    const honest = [
      '«Фотографическая память» как навык, который можно натренировать взрослому, доказательств не имеет.',
      'Мы не обещаем фотографической памяти.',
      'Этот курс не даст фотографической памяти — и никакой другой тоже.',
      'Невозможно развить фотографическую память упражнениями.',
      'You will not get a photographic memory here.',
      'Эйдетические образы у взрослых почти не встречаются (Haber 1979).',
      'Photographic memory is not a trainable skill; we do not promise it.',
      'There is no evidence that adults can train eidetic memory.',
      'Метод локусов держится и через месяцы (Wagner 2021).',
      'Запомните ряд из десяти слов и проверьте себя через час.',
    ].join('\n')
    expect(checkPromises(honest)).toEqual([])
  })
})
