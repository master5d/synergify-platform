// Рамка входа (intake LMS#1 + LMS#10) — обещающая форма «бесплатно, без встроенных
// продаж». Манифест ТС держит её правилом против встроенных продаж: ловит ПРОДАЮЩИЕ
// конструкции и молчит на честных отрицаниях самой рамки (шрам regex-над-прозой).
import { describe, it, expect } from 'vitest'
import { checkManifest } from '../../lib/authoring/manifest'
import { MANIFEST } from './manifest'
import { dictionaries } from './dictionaries'

const SALES = 'встроенная продажа'

describe('tochka-sborki manifest — built-in sales rule', () => {
  it('catches in-course selling calls (RU + EN)', () => {
    for (const dirty of [
      'Купи доступ к модулю 5, чтобы продолжить.',
      'Оформите премиум и откройте продолжение.',
      'Разблокируй за 990 ₽ следующий урок.',
      'Buy access to the next module.',
      'Upgrade to Pro to continue the course.',
      'Unlock the full course today.',
    ]) {
      const labels = checkManifest(dirty, MANIFEST).map(f => f.label).join(' | ')
      expect(labels, dirty).toContain(SALES)
    }
  })

  it('honest negations and everyday wording do NOT match', () => {
    const honest = [
      'Бесплатно и без встроенных продаж: внутри курса нечего докупать.',
      'Free, with no built-in sales: there is nothing to buy inside the course.',
      // дословно из живого контента (02-setup-guide/u1-env-check):
      'молча проверяет каждый предмет: есть / нет / нужно докупить.',
      'Поддержать автора можно добровольно — без давления.',
    ].join('\n')
    expect(checkManifest(honest, MANIFEST)).toEqual([])
  })

  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: entry frame is present, states the promise and positioning, and is manifest-clean`, () => {
      const frame = dictionaries[locale].entryFrame
      expect(frame, 'entryFrame missing in pack dictionary').toBeDefined()
      const text = `${frame!.promise}\n${frame!.positioning}`
      if (locale === 'ru') {
        expect(frame!.promise).toMatch(/Бесплатно/)
        expect(frame!.promise).toMatch(/без встроенных продаж/)
        for (const w of [/асинхронно/, /вход бесплатный/, /суверенн/, /детерминированн\S* русл/]) expect(frame!.positioning).toMatch(w)
      } else {
        expect(frame!.promise).toMatch(/Free/)
        expect(frame!.promise).toMatch(/no built-in sales/)
        for (const w of [/asynchronously/, /entry is free/, /sovereign/, /deterministic channel/]) expect(frame!.positioning).toMatch(w)
      }
      // Позиционирование — через свои свойства, без имени соседа.
      expect(text).not.toMatch(/claude code lab/i)
      expect(checkManifest(text, MANIFEST)).toEqual([])
    })
  }
})
