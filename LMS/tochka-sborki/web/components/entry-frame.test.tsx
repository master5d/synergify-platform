import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { EntryFrame } from './entry-frame'
import { getDictionary } from '@/lib/dictionaries'

// Рамка входа — данные pack'а: есть поле entryFrame → блок рендерится, нет → пусто.
describe('EntryFrame', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: renders pack strings or nothing`, () => {
      const frame = getDictionary(locale).entryFrame
      const html = renderToStaticMarkup(<EntryFrame locale={locale} />)
      if (!frame) {
        expect(html).toBe('')
        return
      }
      expect(html).toContain('data-entry-frame')
      expect(html).toContain(`aria-label="${frame.label}"`)
      expect(html).toContain(frame.promise)
      expect(html).toContain(frame.positioning.replace(/'/g, '&#x27;'))
    })
  }
})
