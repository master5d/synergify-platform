import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ModuleObjectives, ObjectivesDisclosure } from './module-objectives'

const objectives = [{ id: 'o1', text: 'Назвать потолок' }, { id: 'o2', text: 'Выбрать действие' }, { id: 'o3', text: 'Отличить собеседника' }]

describe('ModuleObjectives', () => {
  it('renders heading and all goals as a list', () => {
    const html = renderToStaticMarkup(<ModuleObjectives objectives={objectives} locale="ru" />)
    expect(html).toContain('Цели модуля')
    expect(html.match(/<li/g)).toHaveLength(3)
  })
  it('renders nothing without goals', () => {
    expect(renderToStaticMarkup(<ModuleObjectives locale="ru" />)).toBe('')
  })
  it('disclosure for the syllabus is a collapsed <details> with EN label', () => {
    const html = renderToStaticMarkup(<ObjectivesDisclosure objectives={objectives} locale="en" />)
    expect(html).toContain('<details')
    expect(html).not.toContain('open')
    expect(html).toContain('Goals')
  })
})
