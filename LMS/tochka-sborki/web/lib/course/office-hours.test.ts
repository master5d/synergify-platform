import { describe, it, expect } from 'vitest'
import { resolveOfficeHours, getOfficeHours, OFFICE_HOURS } from './office-hours'

describe('office-hours', () => {
  for (const loc of ['ru', 'en'] as const) {
    it(`resolves all VM strings non-empty (${loc})`, () => {
      const vm = getOfficeHours(loc)
      expect(vm.eyebrow.trim().length).toBeGreaterThan(0)
      expect(vm.heading.trim().length).toBeGreaterThan(0)
      expect(vm.intro.trim().length).toBeGreaterThan(0)
      expect(vm.ama.ctaLabel.trim().length).toBeGreaterThan(0)
      expect(vm.ama.cadenceNote.trim().length).toBeGreaterThan(0)
      expect(vm.oneToOne.ctaLabel.trim().length).toBeGreaterThan(0)
      expect(vm.oneToOne.blurb.trim().length).toBeGreaterThan(0)
      expect(vm.honestNote.trim().length).toBeGreaterThan(0)
    })

    it(`1:1 points at the mentor site (${loc})`, () => {
      expect(getOfficeHours(loc).oneToOne.url).toBe('https://mentor.mamaev.coach')
    })
  }

  // Зажжено 2026-08-02: регистрация живёт на своей странице /ama/, а не во внешнем
  // сервисе. Гвард сторожит не «темноту», а сам факт живой ссылки и её локализацию.
  it('AMA ships live and points at our own registration page', () => {
    expect(OFFICE_HOURS.amaRegisterUrl).toBe('/ama/')
    expect(getOfficeHours('ru').ama.available).toBe(true)
    expect(getOfficeHours('ru').ama.registerUrl).toBe('/ama/')
  })

  it('localises the internal path for EN', () => {
    expect(getOfficeHours('en').ama.registerUrl).toBe('/en/ama/')
  })

  it('leaves an external register url untouched in both locales', () => {
    const ext = 'https://luma.example/ama'
    expect(resolveOfficeHours({ ...OFFICE_HOURS, amaRegisterUrl: ext }, 'ru').ama.registerUrl).toBe(ext)
    expect(resolveOfficeHours({ ...OFFICE_HOURS, amaRegisterUrl: ext }, 'en').ama.registerUrl).toBe(ext)
  })

  it('still goes dark if the url is cleared', () => {
    expect(resolveOfficeHours({ ...OFFICE_HOURS, amaRegisterUrl: '' }, 'ru').ama.available).toBe(false)
  })

  it('AMA lights up when a register url is configured', () => {
    const vm = resolveOfficeHours({ ...OFFICE_HOURS, amaRegisterUrl: 'https://luma.example/ama' }, 'ru')
    expect(vm.ama.available).toBe(true)
    expect(vm.ama.registerUrl).toBe('https://luma.example/ama')
  })

  it('whitespace-only register url stays dark', () => {
    const vm = resolveOfficeHours({ ...OFFICE_HOURS, amaRegisterUrl: '   ' }, 'en')
    expect(vm.ama.available).toBe(false)
  })

  it('is de-hustled — no scarcity/countdown framing', () => {
    const banned = /(осталось|мест\b|countdown|limited|spots|hurry|только сегодня|last chance)/i
    for (const loc of ['ru', 'en'] as const) {
      const vm = getOfficeHours(loc)
      const strings = [vm.eyebrow, vm.heading, vm.intro, vm.ama.ctaLabel, vm.ama.cadenceNote, vm.oneToOne.ctaLabel, vm.oneToOne.blurb, vm.honestNote]
      for (const s of strings) expect(banned.test(s), `scarcity framing: ${s}`).toBe(false)
    }
  })

  it('honest note states free + optional', () => {
    expect(getOfficeHours('ru').honestNote).toMatch(/бесплат/i)
    expect(getOfficeHours('ru').honestNote).toMatch(/опционал/i)
    expect(getOfficeHours('en').honestNote).toMatch(/free/i)
    expect(getOfficeHours('en').honestNote).toMatch(/optional/i)
  })
})
