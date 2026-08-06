import { describe, it, expect } from 'vitest'
import { validateStamp } from './module-stamp'

const valid = {
  slug: '02-astrologia-vnutrennego-neba',
  author: { name: 'Наташа', contact: 'natasha@example.com' },
  created: '2026-08-06',
  manifest_ack: true,
}

describe('validateStamp', () => {
  it('accepts a complete stamp', () => {
    expect(validateStamp(valid)).toEqual([])
  })

  it('accepts a stamp without optional contact', () => {
    const { author, ...rest } = valid
    expect(validateStamp({ ...rest, author: { name: author.name } })).toEqual([])
  })

  it('rejects non-objects outright', () => {
    expect(validateStamp('nope')).toEqual(['_module.json must be a JSON object'])
    expect(validateStamp(null)).toEqual(['_module.json must be a JSON object'])
  })

  it('rejects bad slug, bad date, missing author name', () => {
    const errors = validateStamp({ slug: 'astro', author: { name: '' }, created: '06.08.2026', manifest_ack: true })
    expect(errors.some(e => /slug "astro"/.test(e))).toBe(true)
    expect(errors.some(e => /author\.name/.test(e))).toBe(true)
    expect(errors.some(e => /YYYY-MM-DD/.test(e))).toBe(true)
  })

  it('rejects manifest_ack that is not exactly true', () => {
    expect(validateStamp({ ...valid, manifest_ack: 'yes' }).some(e => /manifest_ack/.test(e))).toBe(true)
    expect(validateStamp({ ...valid, manifest_ack: false }).some(e => /manifest_ack/.test(e))).toBe(true)
  })
})
