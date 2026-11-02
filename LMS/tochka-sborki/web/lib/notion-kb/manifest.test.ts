import { describe, it, expect } from 'vitest'
import { encodeManifest, decodeManifest, EMPTY_MANIFEST, type Manifest } from './manifest'

describe('manifest', () => {
  it('туда и обратно, блоки кода ≤ 1800 знаков', () => {
    const m: Manifest = { v: 1, anchors: { 'ru/state-md': 'blk-1' }, pages: Object.fromEntries(Array.from({ length: 300 }, (_, i) => [`ru/u/m${i}/u${i}`, { id: `id-${i}`, p: 'ru/book', th: 'a'.repeat(16), ch: 'b'.repeat(16) }])) }
    const md = encodeManifest(m)
    for (const line of md.split('\n')) expect(line.length).toBeLessThanOrEqual(1800)
    expect(decodeManifest(md)).toEqual(m)
  })
  it('пустая страница — пустой манифест', () => expect(decodeManifest('')).toEqual(EMPTY_MANIFEST))
  it('кривой JSON или чужая версия — ошибка со словом «манифест»', () => {
    expect(() => decodeManifest('```\n{x\n```')).toThrow(/манифест/)
    expect(() => decodeManifest('```\n{"v":2,"pages":{},"anchors":{}}\n```')).toThrow(/манифест/)
  })
})
