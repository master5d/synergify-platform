import { describe, it, expect } from 'vitest'
import { communityUrl, resolveCommunityEntry, resolveCommunityUnit, getCommunityEntry } from './community'
import { COMMUNITY } from './course/community'
import type { CommunityData } from './community-types'
import { PACK_SLUG } from './pack'

const bi = (ru: string, en: string) => ({ ru, en })
const base = (over: Partial<CommunityData> = {}): CommunityData => ({
  enabled: true,
  groupUrl: 'https://t.me/group',
  courseTopicUrl: 'https://t.me/group/10',
  moduleTopics: { '04-prompt-engineering': 'https://t.me/group/44' },
  recordings: { '04-prompt-engineering/u1': [{ title: bi('Встреча 1', 'Session 1'), url: 'https://youtu.be/x', date: '2026-09-20' }] },
  copy: {
    heading: bi('Сообщество', 'Community'), intro: bi('Интро', 'Intro'), cta: bi('Открыть', 'Open'),
    shareHeading: bi('Покажи', 'Show'), shareBody: bi('Выложи', 'Post'), shareCta: bi('В ветку', 'To thread'),
    recordingsHeading: bi('Записи', 'Recordings'), note: bi('', ''),
  },
  ...over,
})

describe('community resolvers', () => {
  it('entry leads to the course topic, falls back to the group', () => {
    expect(communityUrl(base())).toBe('https://t.me/group/10')
    expect(communityUrl(base({ courseTopicUrl: '' }))).toBe('https://t.me/group')
  })

  it('disabled flag or empty links render nothing', () => {
    expect(resolveCommunityEntry(base({ enabled: false }), 'ru')).toBeNull()
    expect(resolveCommunityEntry(base({ groupUrl: '', courseTopicUrl: '' }), 'ru')).toBeNull()
    expect(resolveCommunityUnit(base({ enabled: false }), '04-prompt-engineering', 'u1', true, 'ru')).toBeNull()
  })

  it('rejects non-https links (no javascript:/http: from pack data)', () => {
    expect(communityUrl(base({ courseTopicUrl: 'javascript:alert(1)', groupUrl: '' }))).toBeNull()
    const vm = resolveCommunityUnit(base({ moduleTopics: { m: 'http://t.me/x' }, recordings: {} }), 'm', 'u', true, 'ru')
    expect(vm).toBeNull()
  })

  it('entry is bilingual', () => {
    expect(resolveCommunityEntry(base(), 'ru')!.cta).toBe('Открыть')
    expect(resolveCommunityEntry(base(), 'en')!.cta).toBe('Open')
  })

  it('share block only on the last unit of a module that has a thread', () => {
    const d = base({ recordings: {} })
    expect(resolveCommunityUnit(d, '04-prompt-engineering', 'u3', true, 'en')!.share).toEqual(
      { heading: 'Show', body: 'Post', cta: 'To thread', url: 'https://t.me/group/44' })
    expect(resolveCommunityUnit(d, '04-prompt-engineering', 'u2', false, 'en')).toBeNull()
    expect(resolveCommunityUnit(d, '05-context-memory', 'u9', true, 'en')).toBeNull()
  })

  it('recordings attach to their lesson only', () => {
    const vm = resolveCommunityUnit(base(), '04-prompt-engineering', 'u1', false, 'ru')!
    expect(vm.share).toBeNull()
    expect(vm.recordings).toEqual({ heading: 'Записи', items: [{ title: 'Встреча 1', url: 'https://youtu.be/x', date: '2026-09-20' }] })
    expect(resolveCommunityUnit(base(), '04-prompt-engineering', 'u2', false, 'ru')).toBeNull()
  })
})

describe('community pack data', () => {
  it('copy is filled in both locales for every surface the pack can show', () => {
    const c = COMMUNITY.copy
    for (const loc of ['ru', 'en'] as const) {
      for (const k of ['heading', 'intro', 'cta', 'recordingsHeading'] as const) expect(c[k][loc].trim(), `${k}.${loc}`).not.toBe('')
      if (Object.keys(COMMUNITY.moduleTopics).length) {
        for (const k of ['shareHeading', 'shareBody', 'shareCta'] as const) expect(c[k][loc].trim(), `${k}.${loc}`).not.toBe('')
      }
    }
  })

  it('recording dates are ISO days', () => {
    for (const list of Object.values(COMMUNITY.recordings)) for (const r of list) expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  // Точка Сборки: тема курса в чате «Мастерская Перехода» (владелец 2026-09-28); веток модулей нет — все ведут в неё.
  it.runIf(PACK_SLUG === 'tochka-sborki')('tochka-sborki: enabled, every module leads to the one course topic', () => {
    expect(COMMUNITY.enabled).toBe(true)
    expect(getCommunityEntry('ru')!.url).toBe('https://t.me/kundaliniRUs/7755')
    expect(new Set(Object.values(COMMUNITY.moduleTopics))).toEqual(new Set(['https://t.me/kundaliniRUs/7755']))
    expect(Object.keys(COMMUNITY.moduleTopics)).toContain('00-kickstart')
  })

  // «Тишина»: тема «Тишина» в чате академии (владелец 2026-09-14) + оговорки u8; ветки модулей нет намеренно.
  it.runIf(PACK_SLUG === 'living-practice')('living-practice: leads to the «Тишина» topic with the crisis caveat', () => {
    const ru = getCommunityEntry('ru')!
    expect(ru.url).toBe('https://t.me/kundaliniRUs/7823')
    expect(ru.note).toMatch(/не терапевтическая группа/)
    expect(ru.note).toMatch(/кризис/)
    expect(getCommunityEntry('en')!.note).toMatch(/not a therapy group/)
    expect(COMMUNITY.moduleTopics).toEqual({})
  })
})
