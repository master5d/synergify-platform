import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { encodeLink, fromBase64Url, toBase64Url } from '../retreat-calc/link'
import type { RetreatPassport } from './passport'
import { decodeToolLink, encodeToolLink, type ToolLink } from './tool-link'

const pickX = (raw: unknown) => {
  const o = (raw ?? {}) as Record<string, unknown>
  return typeof o.x === 'number' ? { x: o.x } : {}
}
const hashOf = (obj: unknown) => `#data=${toBase64Url(JSON.stringify(obj))}`

describe('ссылка инструмента', () => {
  it('круг encode → decode', () => {
    const link: ToolLink<{ x?: number }> = { v: 1, retreat: { start: '2027-05-10', guests: 20 }, tool: { x: 3 } }
    expect(decodeToolLink(encodeToolLink(link), pickX, 'ru')).toEqual({ ok: true, kind: 'tool', link })
  })
  it('одни данные — одна ссылка, порядок ключей не важен', () => {
    const a = encodeToolLink({ v: 1, retreat: { guests: 20, start: '2027-05-10' }, tool: { x: 1 } })
    const b = encodeToolLink({ tool: { x: 1 }, retreat: { start: '2027-05-10', guests: 20 }, v: 1 })
    expect(a).toBe(b)
  })
  it('ссылка калькулятора v1 понимается как calc', () => {
    const text = readFileSync(join(__dirname, '..', 'retreat-calc', 'fixtures', 'link-v1.json'), 'utf8')
    const d = decodeToolLink(encodeLink(JSON.parse(text)), pickX, 'ru')
    expect(d.ok && d.kind).toBe('calc')
  })
  it('чужая версия, мусор и не JSON — сообщение на языке страницы', () => {
    const v2 = decodeToolLink(hashOf({ v: 2, retreat: {}, tool: {} }), pickX, 'en')
    expect(v2).toEqual({ ok: false, error: 'data version 2 is not supported (expected 1)' })
    expect(decodeToolLink('#data=@@@', pickX, 'ru').ok).toBe(false)
    expect(decodeToolLink(`#data=${toBase64Url('не json')}`, pickX, 'ru')).toEqual({ ok: false, error: 'данные в ссылке повреждены' })
    expect(decodeToolLink('', pickX, 'ru').ok).toBe(false)
  })
  it('лишние ключи паспорта не попадают в ссылку и при записи', () => {
    const retreat = { start: '2027-05-10', phone: '+1 555', guests_list: ['A'] } as unknown as RetreatPassport
    const hash = encodeToolLink({ v: 1, retreat, tool: {} })
    const json = fromBase64Url(hash.slice('#data='.length))
    expect(json).not.toMatch(/phone|555|guests_list/)
  })
  it('данные гостей, подложенные в ссылку, отбрасываются', () => {
    const d = decodeToolLink(hashOf({
      v: 1, arrivals: [{ guest: 'A' }],
      retreat: { start: '2027-05-10', phone: '+1 555', guests_list: ['A'] },
      tool: { x: 2, guest: 'A' },
    }), pickX, 'ru')
    expect(d).toEqual({ ok: true, kind: 'tool', link: { v: 1, retreat: { start: '2027-05-10' }, tool: { x: 2 } } })
  })
})
