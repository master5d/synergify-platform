import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { STRINGS } from './strings'
import { PACK_SLUG, PACK_DIR } from '../pack'

describe('STRINGS', () => {
  it('RU и EN — один набор ключей', () => expect(Object.keys(STRINGS.en).sort()).toEqual(Object.keys(STRINGS.ru).sort()))
})
describe.runIf(PACK_SLUG === 'tochka-sborki')('служебные строки — по канону glossary.ts', () => {
  it('ни одного запрещённого варианта', async () => {
    const { GLOSSARY } = await import(pathToFileURL(join(PACK_DIR, 'glossary.ts')).href)
    const hits: string[] = []
    for (const l of ['ru', 'en'] as const) for (const [k, v] of Object.entries(STRINGS[l])) for (const e of GLOSSARY)
      for (const rx of e.banned[l]) if (new RegExp(rx.source, rx.flags.replace('g', '')).test(v) && !(e.allow ?? []).some((a: string) => v.includes(a))) hits.push(`${l}.${k}: ${e.term}`)
    expect(hits).toEqual([])
  })
})
