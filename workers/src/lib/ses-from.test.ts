// Имя курса в From — из реестра; запятая в «Тишина, в которой слышно» ломала SES (400), вход по почте в академии падал.
import { describe, it, expect } from 'vitest'
import { encodeFromAddress } from './ses'

const decode = (encoded: string) => {
  const b64 = /^=\?UTF-8\?B\?([^?]+)\?= </.exec(encoded)![1]
  return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)))
}

describe('encodeFromAddress', () => {
  it('a course name with a comma becomes one encoded display name, not two addresses', () => {
    const out = encodeFromAddress('Тишина, в которой слышно <noreply@synergify.com>')
    expect(out).toMatch(/^=\?UTF-8\?B\?[A-Za-z0-9+/=]+\?= <noreply@synergify\.com>$/)
    expect(out).not.toContain(',')
    expect(decode(out)).toBe('Тишина, в которой слышно')
  })

  it('names without specials (Cyrillic or ASCII) and bare addresses pass through unchanged', () => {
    expect(encodeFromAddress('Точка Сборки <noreply@synergify.com>')).toBe('Точка Сборки <noreply@synergify.com>')
    expect(encodeFromAddress('Logos Foundry <foundry@mamaev.coach>')).toBe('Logos Foundry <foundry@mamaev.coach>')
    expect(encodeFromAddress('noreply@synergify.com')).toBe('noreply@synergify.com')
  })
})
