import { describe, it, expect, afterEach } from 'vitest'
import { getTelegramWebApp, isInsideTelegram } from './webapp'

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window
})

function setWindow(value: unknown) {
  ;(globalThis as Record<string, unknown>).window = value
}

describe('getTelegramWebApp', () => {
  it('returns null when window is undefined', () => {
    expect(getTelegramWebApp()).toBeNull()
  })

  it('returns null when Telegram is absent', () => {
    setWindow({})
    expect(getTelegramWebApp()).toBeNull()
  })

  it('returns the WebApp object when present', () => {
    const webApp = { initData: 'auth_date=1&hash=x', ready() {}, expand() {} }
    setWindow({ Telegram: { WebApp: webApp } })
    expect(getTelegramWebApp()).toBe(webApp)
  })
})

describe('isInsideTelegram', () => {
  it('is false without a WebApp', () => {
    setWindow({})
    expect(isInsideTelegram()).toBe(false)
  })

  it('is false when initData is empty', () => {
    setWindow({ Telegram: { WebApp: { initData: '', ready() {}, expand() {} } } })
    expect(isInsideTelegram()).toBe(false)
  })

  it('is true when initData is present', () => {
    setWindow({ Telegram: { WebApp: { initData: 'auth_date=1&hash=x', ready() {}, expand() {} } } })
    expect(isInsideTelegram()).toBe(true)
  })
})
