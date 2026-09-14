import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SelfCheck } from './self-check'
import { bindSelfCheck } from './self-check-bound'

const item = { id: 'c1', unit: 'u1', objective: 'o1', question: 'Что делать при стоп-сигнале?', options: ['Остановиться', 'Углубиться'], answer: 0, explain: 'Остановиться и вернуться.' }

describe('SelfCheck render', () => {
  it('renders question, options as radios and the label, but not the answer yet', () => {
    const html = renderToStaticMarkup(<SelfCheck item={item} locale="ru" />)
    expect(html).toContain('Проверь себя')
    expect(html).toContain('Что делать при стоп-сигнале?')
    expect(html.match(/type="radio"/g)).toHaveLength(2)
    expect(html).toContain('<fieldset')
    expect(html).toContain('aria-live="polite"')
    expect(html).not.toContain('Остановиться и вернуться.')
  })
  it('EN label', () => {
    expect(renderToStaticMarkup(<SelfCheck item={item} locale="en" />)).toContain('Check yourself')
  })
  it('bindSelfCheck resolves by id and renders nothing for an unknown id', () => {
    const Bound = bindSelfCheck([item], 'ru')
    expect(renderToStaticMarkup(<Bound id="c1" />)).toContain('Что делать при стоп-сигнале?')
    expect(renderToStaticMarkup(<Bound id="c9" />)).toBe('')
  })
})
