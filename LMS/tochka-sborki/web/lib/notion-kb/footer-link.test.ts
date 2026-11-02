import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { notionKbFooterLink } from './footer-link'

describe('notionKbFooterLink', () => {
  it('нет адреса — нет ссылки', () => expect(notionKbFooterLink(null, false, 'ru')).toBeNull())
  it('в зеркале ссылки нет: оно для читателей в России, где Notion закрыт', () => expect(notionKbFooterLink('https://x.notion.site/kb', true, 'ru')).toBeNull())
  it('не https — нет ссылки', () => expect(notionKbFooterLink('javascript:alert(1)', false, 'ru')).toBeNull())
  it('подписи RU и EN', () => {
    expect(notionKbFooterLink('https://x.notion.site/kb', false, 'ru')).toEqual({ href: 'https://x.notion.site/kb', label: 'База знаний в Notion' })
    expect(notionKbFooterLink('https://x.notion.site/kb', false, 'en')!.label).toBe('Knowledge base in Notion')
  })
  it('подвал вызывает хелпер с адресом из COURSE и флагом зеркала и рисует ссылку по его ответу', () => {
    const src = readFileSync(join(process.cwd(), 'components/footer.tsx'), 'utf8')
    expect(src).toMatch(/notionKbFooterLink\(\s*COURSE\.notionKbUrl,\s*IS_MIRROR,\s*locale\s*\)/)
    expect(src).toMatch(/href=\{kb\.href\}/)
    expect(src).toMatch(/\{kb\.label\} ↗/)
  })
})
