import { describe, expect, it } from 'vitest'
import { SECTION_IDS } from '../../lib/retreat-booklet/sections'
import { sectionLabels } from '../../lib/retreat-booklet/labels'
import { BK_UI } from './ui'

const keys = (o: object): string[] => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v).map((x) => `${k}.${x}`) : [k])).sort()

describe('подписи буклета', () => {
  it('у каждого раздела есть название RU и EN', () => {
    for (const id of SECTION_IDS) {
      expect(sectionLabels('ru')[id], id).toBeTruthy()
      expect(sectionLabels('en')[id], id).toBeTruthy()
    }
  })
  it('RU и EN имеют одинаковый набор подписей', () => {
    expect(keys(BK_UI.en)).toEqual(keys(BK_UI.ru))
  })
  it('lead говорит, что всё остаётся в браузере', () => {
    expect(BK_UI.ru.lead).toContain('Всё остаётся в этом браузере.')
    expect(BK_UI.en.lead).toContain('Everything stays in this browser.')
  })
})
