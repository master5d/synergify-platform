import { describe, expect, it } from 'vitest'
import { SECTION_IDS } from '../../lib/retreat-booklet/sections'
import { sectionLabels, issueText } from '../../lib/retreat-booklet/labels'
import { BK_UI } from './ui'

describe('retreat booklet copy', () => {
  it('has a section label in both languages', () => {
    for (const id of SECTION_IDS) {
      expect(sectionLabels('ru')[id]).toBeTruthy()
      expect(sectionLabels('en')[id]).toBeTruthy()
    }
  })

  it('has human text for every engine issue', () => {
    for (const id of ['required-empty', 'no-not-included', 'import-passport-mismatch', 'experience-without-purpose',
      'holiday-overlap', 'promise-words', 'testimonial-without-consent', 'photo-without-rights', 'booking-without-form']) {
      expect(issueText({ id }, 'ru')).not.toContain(id)
      expect(issueText({ id }, 'en')).not.toContain(id)
    }
  })

  it('keeps the UI key set bilingual', () => {
    expect(Object.keys(BK_UI.ru).sort()).toEqual(Object.keys(BK_UI.en).sort())
  })
})
