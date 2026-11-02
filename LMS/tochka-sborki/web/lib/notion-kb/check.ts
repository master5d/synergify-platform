import { toString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'
import { parseMdx } from './md'
import { plainText, validateConcepts } from './concepts'
import { buildSite, fakeResolver } from './site'
import { RenderError } from './render-mdx'
import type { Locale, SiteInput } from './types'

const locales: Locale[] = ['ru', 'en']
const compact = (text: string) => text.replace(/\s+/g, ' ').trim()

function sourceHeadings(src: string): string[] {
  const headings: string[] = []
  visit(parseMdx(src), 'heading', (node) => { headings.push(compact(toString(node))) })
  return headings
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function checkContent(input: SiteInput): string[] {
  const errors = validateConcepts(input.concepts).map((error) => `concepts: ${error}`)
  let missingSource = false
  for (const concept of input.concepts) for (const locale of locales) {
    const [moduleSlug, unitSlug] = concept.source.unit.split('/')
    const module = input.modules[locale].find((item) => item.slug === moduleSlug)
    const exists = module?.units.some((unit) => unit.slug === unitSlug) ?? false
    if (!exists) {
      errors.push(`${concept.id}: юнит-источник ${concept.source.unit} не найден (${locale})`)
      missingSource = true
      continue
    }
    let source: string
    try { source = input.unitMdx(locale, moduleSlug, unitSlug) } catch (error) { errors.push(`${concept.id}: ${message(error)}`); missingSource = true; continue }
    if (!sourceHeadings(source).includes(compact(concept.source.heading[locale]))) errors.push(`${concept.id}: заголовок «${concept.source.heading[locale]}» не найден в ${concept.source.unit} (${locale})`)
    const text = compact(plainText(source))
    if (!text.includes(compact(concept.short[locale]))) errors.push(`${concept.id}: «Коротко» не найдено в ${concept.source.unit} (${locale})`)
    const form = new RegExp(concept.forms[locale].source, concept.forms[locale].flags.replace(/[gy]/g, ''))
    if (!form.test(text)) errors.push(`${concept.id}: формы не встречаются в ${concept.source.unit} (${locale})`)
  }
  if (missingSource) return errors
  let pages: ReturnType<typeof buildSite>
  try { pages = buildSite(input) } catch (error) { errors.push(`buildSite: ${message(error)}`); return errors }
  const links = fakeResolver(pages)
  for (const page of pages) {
    try { page.markdown(links) } catch (error) {
      if (error instanceof RenderError) errors.push(`${page.key}: ${error.message}`)
      else errors.push(`${page.key}: ${message(error)}`)
    }
  }
  return errors
}
