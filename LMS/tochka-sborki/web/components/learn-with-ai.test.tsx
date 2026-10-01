import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LearnWithAI, RESEARCH_URL, RESEARCH_CITE, T } from './learn-with-ai'

// Честное предупреждение (Педагогика 5, intake LMS#20; Bastani et al., PNAS 2025).
describe('LearnWithAI honest caveat', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`shows the caveat with the study reference (${locale})`, () => {
      const html = renderToStaticMarkup(<LearnWithAI prompt="p" bootstrap="b" locale={locale} />)
      expect(html).toContain(T[locale].caveat)
      expect(html).toContain(RESEARCH_CITE)
      expect(html).toContain(RESEARCH_URL)
    })
  }

  it('says «check yourself without AI» in both locales, without scare words', () => {
    expect(T.ru.caveat).toMatch(/кажется, что умеешь больше/)
    expect(T.ru.caveat).toMatch(/проверь себя без ИИ/)
    expect(T.en.caveat).toMatch(/feels like you can do more/)
    expect(T.en.caveat).toMatch(/check yourself without AI/)
    for (const s of [T.ru.caveat, T.en.caveat]) {
      expect(s).not.toMatch(/опасн|вред|опасно|danger|harm/i)
      expect(s.length).toBeLessThan(140)
    }
  })
})
