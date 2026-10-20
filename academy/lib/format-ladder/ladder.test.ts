import { describe, expect, it } from 'vitest'
import { CHANNELS, EVENT_CLASSES, RUNGS_ORDER } from './axes'
import { checkFormats } from './check'
import { FAMILIES, KNOWN_COURSES } from './families'
import { courseOf, FORMATS, formatsIn } from './formats'
import { EMPTY_MAP, type MyMap, nextLabel, parseMyMap, serializeMyMap } from './my-map'
import type { Format } from './types'
import { RUNGS } from './rungs'

// Клонирование формата для изолированных тестов мутаций
function cloneFormat(format: Format): Format {
  return JSON.parse(JSON.stringify(format)) as Format
}

describe('format-ladder', () => {
  it('L01 оси: шесть ступеней по порядку, три канала, три класса, RU и EN непустые', () => {
    expect(RUNGS.map((r) => r.id)).toEqual(RUNGS_ORDER)
    expect(RUNGS[1].size.ru).toBe('2–7 человек')
    expect(RUNGS[5].label.en).toBe('One to many')

    expect(CHANNELS).toHaveLength(3)
    for (const channel of CHANNELS) {
      expect(channel.label.ru.trim().length).toBeGreaterThan(0)
      expect(channel.label.en.trim().length).toBeGreaterThan(0)
    }

    expect(EVENT_CLASSES).toHaveLength(3)
    for (const eventClass of EVENT_CLASSES) {
      expect(eventClass.label.ru.trim().length).toBeGreaterThan(0)
      expect(eventClass.label.en.trim().length).toBeGreaterThan(0)
    }

    for (const rung of RUNGS) {
      expect(rung.label.ru.trim().length).toBeGreaterThan(0)
      expect(rung.label.en.trim().length).toBeGreaterThan(0)
      expect(rung.size.ru.trim().length).toBeGreaterThan(0)
      expect(rung.size.en.trim().length).toBeGreaterThan(0)

      expect(rung.laws.attention.ru.trim().length).toBeGreaterThan(0)
      expect(rung.laws.attention.en.trim().length).toBeGreaterThan(0)
      expect(rung.laws.pricePerHead.ru.trim().length).toBeGreaterThan(0)
      expect(rung.laws.pricePerHead.en.trim().length).toBeGreaterThan(0)
      expect(rung.laws.team.ru.trim().length).toBeGreaterThan(0)
      expect(rung.laws.team.en.trim().length).toBeGreaterThan(0)
      expect(rung.laws.voice.ru.trim().length).toBeGreaterThan(0)
      expect(rung.laws.voice.en.trim().length).toBeGreaterThan(0)
      expect(rung.laws.gives.ru.trim().length).toBeGreaterThan(0)
      expect(rung.laws.gives.en.trim().length).toBeGreaterThan(0)

      expect(rung.upSignals.length).toBeGreaterThanOrEqual(2)
      for (const sig of rung.upSignals) {
        expect(sig.ru.trim().length).toBeGreaterThan(0)
        expect(sig.en.trim().length).toBeGreaterThan(0)
      }

      expect(rung.earlySignals.length).toBeGreaterThanOrEqual(2)
      for (const sig of rung.earlySignals) {
        expect(sig.ru.trim().length).toBeGreaterThan(0)
        expect(sig.en.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('L02 семейства: девять, эпики 1–9 по разу, курс только у retreat и one-to-one, оба из KNOWN_COURSES', () => {
    expect(FAMILIES).toHaveLength(9)

    const epics = FAMILIES.map((family) => family.epic)
    expect(epics).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])

    expect(FAMILIES.filter((family) => family.course).map((family) => family.id)).toEqual(['retreat', 'one-to-one'])
    expect(KNOWN_COURSES).toHaveLength(2)
    for (const family of FAMILIES) {
      expect(family.label.ru.trim().length).toBeGreaterThan(0)
      expect(family.label.en.trim().length).toBeGreaterThan(0)
      if (family.course) expect(KNOWN_COURSES).toContainEqual(family.course)
    }

    const oneToOne = FAMILIES.find((family) => family.id === 'one-to-one')
    expect(oneToOne?.course).toEqual({
      ru: 'https://academy.synergify.com/odin-na-odin/',
      en: 'https://academy.synergify.com/odin-na-odin/en/',
    })
    expect(courseOf(FORMATS.find((f) => f.id === 'individual')!)).toEqual(KNOWN_COURSES[1])
  })

  it('L03 раскладка совпадает со spec', () => {
    expect(FORMATS).toHaveLength(41)

    const vipassana = FORMATS.find((f) => f.id === 'vipassana')
    expect(vipassana?.cells).toEqual([
      { rung: 'medium', channel: 'offline', eventClass: 'one-off' },
    ])

    const groups = FORMATS.find((f) => f.id === 'groups')
    expect(groups?.cells).toEqual([
      { rung: 'small', channel: 'offline', eventClass: 'regular' },
      { rung: 'small', channel: 'online', eventClass: 'regular' },
    ])

    const bookClub = FORMATS.find((f) => f.id === 'book-club')
    expect(bookClub?.cells).toEqual([
      { rung: 'small', channel: 'hybrid', eventClass: 'regular' },
      { rung: 'small', channel: 'online', eventClass: 'regular' },
    ])

    const individual = FORMATS.find((f) => f.id === 'individual')
    expect(individual?.cells).toEqual([
      { rung: 'one', channel: 'offline', eventClass: 'regular' },
      { rung: 'one', channel: 'online', eventClass: 'regular' },
    ])

    const apprenticeships = FORMATS.find((f) => f.id === 'apprenticeships')
    expect(apprenticeships?.cells).toEqual([
      { rung: 'few', channel: 'offline', eventClass: 'cycle' },
    ])

    const onlineCultureHouse = FORMATS.find((f) => f.id === 'online-culture-house')
    expect(onlineCultureHouse?.cells).toEqual([
      { rung: 'many', channel: 'online', eventClass: 'regular' },
    ])

    const dinnerEnBlanc = FORMATS.find((f) => f.id === 'dinner-en-blanc')
    expect(dinnerEnBlanc?.cells).toEqual([
      { rung: 'large', channel: 'offline', eventClass: 'one-off' },
    ])

    const marathon = FORMATS.find((f) => f.id === 'marathon')
    expect(marathon?.cells).toEqual([
      { rung: 'large', channel: 'online', eventClass: 'cycle' },
    ])

    for (const f of FORMATS) {
      expect(f.id.includes('temple')).toBe(false)
      expect(f.id.includes('ista')).toBe(false)
    }

    const counts = FORMATS.reduce<Record<string, number>>((acc, f) => {
      acc[f.family] = (acc[f.family] || 0) + 1
      return acc
    }, {})

    expect(counts).toEqual({
      retreat: 6,
      'one-to-one': 1,
      table: 7,
      'regular-group': 5,
      learning: 9,
      'online-intensive': 5,
      tour: 3,
      'big-event': 3,
      club: 2,
    })
  })

  it('L04 образцовые данные проходят checkFormats без замечаний', () => {
    expect(checkFormats(FORMATS, FAMILIES)).toEqual([])
  })

  it('L05 пустое или одноязычное поле — ошибка с путём', () => {
    const vipassana = FORMATS.find((f) => f.id === 'vipassana')!

    const emptyAboutEn = cloneFormat(vipassana)
    emptyAboutEn.about.en = ''
    expect(checkFormats([emptyAboutEn], FAMILIES)).toContainEqual({
      id: 'empty',
      where: 'vipassana.about.en',
    })

    const whitespaceNameRu = cloneFormat(vipassana)
    whitespaceNameRu.name.ru = ' '
    expect(checkFormats([whitespaceNameRu], FAMILIES)).toContainEqual({
      id: 'empty',
      where: 'vipassana.name.ru',
    })
  })

  it('L06 клетка вне словаря, неизвестное семейство, повтор id, чужой курс — ошибки', () => {
    const vipassana = FORMATS.find((f) => f.id === 'vipassana')!

    const badCellFormat = cloneFormat(vipassana)
    badCellFormat.cells = [
      {
        rung: 'invalid' as any,
        channel: 'offline',
        eventClass: 'one-off',
      },
    ]
    expect(checkFormats([badCellFormat], FAMILIES)).toContainEqual({
      id: 'cell-axis',
      where: 'vipassana.cells.0',
    })

    const badFamilyFormat = cloneFormat(vipassana)
    badFamilyFormat.family = 'unknown-family' as any
    expect(checkFormats([badFamilyFormat], FAMILIES)).toContainEqual({
      id: 'family',
      where: 'vipassana.family',
    })

    const duplicateFormats = [cloneFormat(vipassana), cloneFormat(vipassana)]
    expect(checkFormats(duplicateFormats, FAMILIES)).toContainEqual({
      id: 'dup-id',
      where: 'vipassana',
    })

    const foreignCourseFamilies = FAMILIES.map((family) =>
      family.id === 'retreat'
        ? {
            ...family,
            course: {
              ru: 'https://x.example/',
              en: 'https://x.example/en/',
            },
          }
        : family
    )
    expect(checkFormats(FORMATS, foreignCourseFamilies)).toContainEqual({
      id: 'course',
      where: 'family.retreat.course',
    })

    const foreignOneToOne = FAMILIES.map((family) =>
      family.id === 'one-to-one' ? { ...family, course: { ru: 'https://x.example/', en: 'https://x.example/en/' } } : family
    )
    expect(checkFormats(FORMATS, foreignOneToOne)).toContainEqual({
      id: 'course',
      where: 'family.one-to-one.course',
    })
  })

  it('L07 formatsIn: фильтр класса и null = все классы', () => {
    const smallOnlineAll = formatsIn('small', 'online', null).map((f) => f.id)
    expect(smallOnlineAll).toContain('groups')
    expect(smallOnlineAll).toContain('weekly-practice-groups')

    const smallOnlineCycle = formatsIn('small', 'online', 'cycle').map((f) => f.id)
    expect(smallOnlineCycle).not.toContain('groups')
    expect(smallOnlineCycle).toContain('detox-groups')
    expect(smallOnlineCycle).toContain('growth-lab')

    const retreatFormat = FORMATS.find((f) => f.id === 'retreat')!
    expect(courseOf(retreatFormat)).toEqual(KNOWN_COURSES[0])

    const groupsFormat = FORMATS.find((f) => f.id === 'groups')!
    expect(courseOf(groupsFormat)).toBeNull()
  })

  it('L11 настоящие данные проходят checkFormats, у каждой ступени 2–3 признака каждого вида', () => {
    expect(checkFormats(FORMATS, FAMILIES)).toEqual([])
    for (const r of RUNGS) {
      expect(r.upSignals.length).toBeGreaterThanOrEqual(2)
      expect(r.upSignals.length).toBeLessThanOrEqual(3)
      expect(r.earlySignals.length).toBeGreaterThanOrEqual(2)
      expect(r.earlySignals.length).toBeLessThanOrEqual(3)
    }
    expect(new Set(FORMATS.map((f) => f.about.ru)).size).toBe(41)
  })

  it('L03b клетки всех 41 формата совпадают со spec', () => {
    const expected: Record<string, string> = {
      'retreat': 'medium·offline·one-off',
      'vipassana': 'medium·offline·one-off',
      'detox-tour': 'small·offline·one-off',
      'yoga-tour': 'small·offline·one-off',
      'field-course': 'medium·offline·one-off',
      'immersion': 'small·offline·one-off',
      'individual': 'one·offline·regular one·online·regular',
      'meeting': 'small·offline·one-off',
      'breakfasts': 'small·offline·regular',
      'salon': 'small·offline·regular',
      'birds-of-a-feather': 'small·offline·one-off',
      'dinner-en-blanc': 'large·offline·one-off',
      'analog-sundays': 'small·offline·regular',
      'cinema-spirituality': 'medium·offline·regular',
      'weekly-practice-groups': 'small·online·regular',
      'monthly-pop-up': 'medium·offline·regular',
      'groups': 'small·offline·regular small·online·regular',
      'detox-groups': 'small·online·cycle',
      'book-club': 'small·hybrid·regular small·online·regular',
      'masterclass': 'small·offline·one-off',
      'training': 'medium·offline·one-off',
      'seminar': 'medium·offline·one-off',
      'courses': 'medium·offline·cycle',
      'apprenticeships': 'few·offline·cycle',
      'bootcamp': 'medium·offline·cycle',
      'online-course': 'many·online·cycle',
      'audio-course': 'many·online·cycle',
      'live-practicum': 'medium·hybrid·cycle',
      'marathon': 'large·online·cycle',
      'growth-lab': 'small·online·cycle',
      'virtual-retreat': 'large·online·one-off',
      'community-detox': 'large·online·cycle',
      'angelic-therapy-lab': 'small·hybrid·cycle',
      'author-tour': 'small·offline·one-off',
      'weekend-tour': 'small·offline·one-off',
      'plein-air': 'small·offline·one-off',
      'festival-camp': 'large·offline·one-off',
      'camp': 'large·offline·one-off',
      'online-conference': 'many·online·one-off',
      'chat-club': 'large·online·regular',
      'online-culture-house': 'many·online·regular',
    }
    const actual = Object.fromEntries(
      FORMATS.map((f) => [f.id, f.cells.map((c) => `${c.rung}·${c.channel}·${c.eventClass}`).join(' ')]),
    )
    expect(actual).toEqual(expected)
  })

  it('L08 parseMyMap: null, мусор, чужая версия — EMPTY_MAP без исключения', () => {
    expect(parseMyMap(null)).toEqual(EMPTY_MAP)
    expect(parseMyMap('{')).toEqual(EMPTY_MAP)
    expect(parseMyMap('[]')).toEqual(EMPTY_MAP)
    expect(parseMyMap(JSON.stringify({ v: 2 }))).toEqual(EMPTY_MAP)
    const fullV2 = JSON.parse(serializeMyMap({ ...EMPTY_MAP, signal: 'люди возвращаются' }, FORMATS))
    expect(parseMyMap(JSON.stringify({ ...fullV2, v: 2 }))).toEqual(EMPTY_MAP)
    expect(parseMyMap(JSON.stringify(fullV2)).signal).toBe('люди возвращаются')
    expect(parseMyMap(null)).not.toBe(EMPTY_MAP)

    const invalidCell = JSON.stringify({
      v: 1,
      now: { rung: 'huge', channel: 'offline', eventClass: 'one-off' },
      next: { formatId: null, formatName: null, text: '', date: '' },
      signal: '',
    })
    expect(parseMyMap(invalidCell)).toEqual(EMPTY_MAP)
  })

  it('L09 пропавший formatId — nextLabel отдаёт сохранённое название', () => {
    const mapWithMarathon: MyMap = {
      now: null,
      next: {
        formatId: 'marathon',
        formatName: null,
        text: '',
        date: '',
      },
      signal: '',
    }

    const serialized = serializeMyMap(mapWithMarathon, FORMATS)
    const parsed = parseMyMap(serialized)
    const formatsWithoutMarathon = FORMATS.filter((f) => f.id !== 'marathon')

    expect(nextLabel(parsed, formatsWithoutMarathon, 'ru')).toBe('Марафон')
    expect(nextLabel(parsed, formatsWithoutMarathon, 'en')).toBe('Marathon')

    const customTextMap: MyMap = {
      now: null,
      next: {
        formatId: null,
        formatName: null,
        text: 'своё',
        date: '',
      },
      signal: '',
    }

    expect(nextLabel(customTextMap, FORMATS, 'ru')).toBe('своё')
    expect(nextLabel(customTextMap, FORMATS, 'en')).toBe('своё')
  })

  it('L10 serialize → parse даёт ту же карту', () => {
    const fullMap: MyMap = {
      now: { rung: 'small', channel: 'offline', eventClass: 'regular' },
      next: {
        formatId: 'groups',
        formatName: null,
        text: 'План регулярных встреч',
        date: '2026-11-15',
      },
      signal: 'Запрос на устойчивый ритм',
    }

    const serialized = serializeMyMap(fullMap, FORMATS)
    const roundtrip = parseMyMap(serialized)

    expect(roundtrip.next.formatName).toEqual({
      ru: 'Группы',
      en: 'Groups',
    })

    expect(roundtrip).toEqual({
      now: { rung: 'small', channel: 'offline', eventClass: 'regular' },
      next: {
        formatId: 'groups',
        formatName: { ru: 'Группы', en: 'Groups' },
        text: 'План регулярных встреч',
        date: '2026-11-15',
      },
      signal: 'Запрос на устойчивый ритм',
    })
  })
})
