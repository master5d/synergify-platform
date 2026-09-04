import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const read = (p: string) => readFileSync(join(HERE, p), 'utf8')

const CARDS: [string, string][] = [
  ['личный план обучения', 'learning-plan-card.tsx'],
  ['устав напарника', 'charter-card.tsx'],
  ['настройка ИИ-компаньона', 'companion-setup.tsx'],
  ['за пределами курса', '../office-hours-card.tsx'],
]

/**
 * Четыре блока под картой мира свёрнуты в аккордеон. Свернуть — не значит
 * выбросить: у каждого внутри лежит длинный текст для копирования, ради
 * которого блок и существует.
 *
 * Риск ровно тот же, что у панели настроек: при следующей правке листа легко
 * «вернуть как было» одному блоку — и он останется единственным развёрнутым,
 * то есть аккордеон визуально сломается, а тестов, которые это ловят, нет.
 */
describe('лист персонажа: четыре раздела — аккордеон', () => {
  it.each(CARDS)('%s свёрнут через общий SheetSection', (_name, file) => {
    const src = read(file)
    expect(src, 'раздел не использует общий SheetSection').toContain('<SheetSection')
    expect(src, 'остался собственный <section> вместо общего раздела')
      .not.toMatch(/<section style=\{\{ maxWidth: 640/)
  })

  it('свой <details> не остался ни у кого — раскрытие живёт в одном месте', () => {
    for (const [, file] of CARDS) {
      expect(read(file), `${file} раскрывается сам по себе`).not.toContain('<details')
    }
  })

  it('содержимое для копирования не потеряно', () => {
    expect(read('learning-plan-card.tsx')).toContain('{plan}')
    expect(read('charter-card.tsx')).toContain('{charter}')
    expect(read('companion-setup.tsx')).toContain('{prompt}')
    expect(read('../office-hours-card.tsx')).toContain('oh.oneToOne.url')
  })

  it('разделы независимы: взаимоисключающего <details name> нет', () => {
    // `name` закрывал бы устав в момент сверки с планом — оба и нужны рядом.
    expect(read('sheet-section.tsx')).not.toMatch(/<details[^>]*\sname=/)
  })
})
