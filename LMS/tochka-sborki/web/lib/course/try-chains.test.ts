import { describe, it, expect } from 'vitest'
import { getTryChains, ALL_CHAINS, HONEST_ITEMS, type TryChain } from './try-chains'
import { lintDehustle } from '@/lib/authoring/dehustle'

const LOCALES = ['ru', 'en'] as const

describe('состав страницы', () => {
  it('шесть цепочек, поровну рабочих и личных', () => {
    expect(ALL_CHAINS).toHaveLength(6)
    expect(ALL_CHAINS.filter((c) => c.kind === 'work')).toHaveLength(3)
    expect(ALL_CHAINS.filter((c) => c.kind === 'life')).toHaveLength(3)
  })

  it('идентификаторы уникальны', () => {
    const ids = ALL_CHAINS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('это цепочки, а не одиночные промпты', () => {
    // Одиночный промпт даёт демонстрацию, цепочка — результат. Если однажды
    // кто-то сократит цепочку до одного шага, страница перестанет быть собой.
    for (const c of ALL_CHAINS) {
      expect(c.steps.length, `${c.id}: цепочка из одного шага`).toBeGreaterThanOrEqual(3)
    }
  })
})

/**
 * Главный риск этой страницы: человек копирует строки в агента, который умеет
 * переименовывать и перезаписывать его файлы. Поэтому порядок шагов и формулировки
 * здесь — вопрос сохранности чужих данных, а не стиля.
 */
describe('безопасность копируемых инструкций', () => {
  // Судим по свойству, объявленному данными. Цепочка про незнакомую тему файлов
  // не трогает вовсе — требовать от неё запрета «ничего не меняй» было бы
  // обрядом, а обряды в гвардах учат обходить гварды.
  const fileChains = ALL_CHAINS.filter((c) => c.touchesFiles).map((c) => ({ id: c.id, step: c.steps[0] }))

  it('цепочки, работающие с файлами, помечены явно', () => {
    expect(fileChains.length).toBeGreaterThanOrEqual(4)
    expect(ALL_CHAINS.filter((c) => !c.touchesFiles).map((c) => c.id)).toEqual(['new-topic'])
  })

  it.each(fileChains)('$id: первый шаг — разведка, без изменений', ({ id, step }) => {
    const ru = step.prompt.ru.toLowerCase()
    const en = step.prompt.en.toLowerCase()
    const declaresNoChange =
      /ничего (пока )?не (переименовыв|трогай|пиши|меняй)|не сверяй пока|файлы не трогай/.test(ru) &&
      /do not (rename|touch|write|change|reconcile)/.test(en)
    expect(declaresNoChange, `${id}: первый шаг не запрещает агенту менять файлы`).toBe(true)
  })

  it('ни один промпт не просит удалять', () => {
    const dangerous = /\b(удали|сотри|delete|rm -rf|drop table)\b/i
    const hits: string[] = []
    for (const c of ALL_CHAINS) {
      for (const s of c.steps) {
        if (dangerous.test(s.prompt.ru) || dangerous.test(s.prompt.en)) hits.push(`${c.id}: ${s.prompt.ru}`)
      }
    }
    expect(hits, `опасные инструкции: ${hits.join(' | ')}`).toEqual([])
  })

  it('цепочки, трогающие файлы, оставляют путь назад', () => {
    // Переименование и раскладка — необратимы на глаз. Либо журнал отката,
    // либо работа с копиями; иначе новичок теряет свой архив на первом же заходе.
    // Сверка (reconcile) и письма ничего не перезаписывают — они только читают
    // и создают новое, поэтому путь назад им не нужен.
    const rewriting = ['rename-files', 'notes-pile', 'home-archive']
    for (const id of rewriting) {
      const chain = ALL_CHAINS.find((c) => c.id === id) as TryChain
      const all = chain.steps.map((s) => `${s.prompt.ru} ${s.prompt.en}`).join(' ').toLowerCase()
      const reversible = /откат|rename-log|коп(ии|ию)|оригиналы (не трогай|оставь)|copies|leave the originals|undone/.test(all)
      expect(reversible, `${id}: нет ни журнала отката, ни работы с копиями`).toBe(true)
    }
  })

  it('у каждой цепочки названа своя граница применимости', () => {
    for (const c of ALL_CHAINS) {
      expect(c.caution.ru.length, `${c.id}: пустая оговорка`).toBeGreaterThan(30)
      expect(c.caution.en.length, `${c.id}: пустая оговорка`).toBeGreaterThan(30)
    }
  })
})

describe('каждый шаг объясняет себя', () => {
  for (const c of ALL_CHAINS) {
    it(`${c.id}: у всех шагов есть промпт и «зачем» на обоих языках`, () => {
      for (const s of c.steps) {
        expect(s.prompt.ru.length).toBeGreaterThan(20)
        expect(s.prompt.en.length).toBeGreaterThan(20)
        expect(s.why.ru.length, 'шаг без объяснения читается как заклинание').toBeGreaterThan(20)
        expect(s.why.en.length).toBeGreaterThan(20)
      }
    })
  }
})

describe('честный раздел', () => {
  it('на месте и не выродился в формальность', () => {
    expect(HONEST_ITEMS.length).toBeGreaterThanOrEqual(4)
    for (const item of HONEST_ITEMS) {
      expect(item.ru.length).toBeGreaterThan(80)
      expect(item.en.length).toBeGreaterThan(80)
    }
  })

  it('называет вещи, которые невыгодно называть', () => {
    const ru = HONEST_ITEMS.map((i) => i.ru).join(' ').toLowerCase()
    expect(ru, 'нет оговорки про малый объём').toMatch(/быстрее руками|не окупается/)
    expect(ru, 'нет оговорки про уверенные ошибки').toMatch(/ошибается уверенно|уверенно/)
    expect(ru, 'нет оговорки про данные').toMatch(/данные уходят|уезжает наружу/)
  })
})

describe('обе локали', () => {
  for (const locale of LOCALES) {
    it(`${locale}: страница собирается целиком`, () => {
      const vm = getTryChains(locale)
      expect(vm.heading.length).toBeGreaterThan(0)
      expect(vm.intro.length).toBeGreaterThanOrEqual(2)
      expect(vm.chains).toHaveLength(6)
      expect(vm.honest.items.length).toBeGreaterThanOrEqual(4)
      expect(vm.outro.body.length).toBeGreaterThanOrEqual(2)
      for (const c of vm.chains) {
        expect(c.title.length).toBeGreaterThan(0)
        expect(c.steps.every((s) => s.prompt.length > 0 && s.why.length > 0)).toBe(true)
      }
    })

    it(`${locale}: шаги пронумерованы подряд с единицы`, () => {
      for (const c of getTryChains(locale).chains) {
        expect(c.steps.map((s) => s.n)).toEqual(c.steps.map((_, i) => i + 1))
      }
    })
  }

  it('ссылка на программу учитывает локаль', () => {
    expect(getTryChains('ru').outro.ctaHref).toBe('/syllabus/')
    expect(getTryChains('en').outro.ctaHref).toBe('/en/syllabus/')
  })

  it('русский и английский не перепутаны местами', () => {
    const ru = getTryChains('ru')
    const en = getTryChains('en')
    expect(ru.heading).not.toBe(en.heading)
    expect(/[а-яё]/i.test(ru.heading)).toBe(true)
    expect(/[а-яё]/i.test(en.heading)).toBe(false)
  })
})

describe('вся копия страницы — без приёмов продаж', () => {
  for (const locale of LOCALES) {
    it(`${locale}: de-hustle чисто`, () => {
      const vm = getTryChains(locale)
      const strings = [
        vm.heading, ...vm.intro, vm.notProgramming.heading, ...vm.notProgramming.body,
        ...vm.chains.flatMap((c) => [c.title, c.situation, c.needs, c.result, c.caution,
          ...c.steps.flatMap((s) => [s.prompt, s.why])]),
        vm.honest.heading, vm.honest.intro, ...vm.honest.items,
        vm.outro.heading, ...vm.outro.body, vm.outro.ctaLabel, vm.outro.noCta,
      ]
      for (const s of strings) expect(lintDehustle(s), `в строке: ${s.slice(0, 60)}`).toEqual([])
    })
  }

  it('страница не выменивает доступ на контакт', () => {
    // Владелец выбрал открытый доступ: обещание «оставь почту — пришлю» здесь
    // означало бы ровно тот барьер, ради снятия которого страница и делается.
    const all = LOCALES.flatMap((l) => {
      const vm = getTryChains(l)
      return [...vm.intro, ...vm.outro.body, vm.outro.noCta]
    }).join(' ').toLowerCase()
    expect(all).not.toMatch(/оставь (свою )?почт|пришлю в личк|enter your email|in exchange for/)
    expect(all, 'страница не говорит вслух, что ничего не требует').toMatch(/ничего не нужно оставлять|nothing to leave behind/)
  })
})
