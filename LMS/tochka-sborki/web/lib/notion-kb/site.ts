import { createHash } from 'node:crypto'
import type { ModuleMeta } from '../content'
import { findOccurrences, plainText } from './concepts'
import { anchorUrl, callout, inlineMd, pageTag, TABLE_OF_CONTENTS } from './md'
import { KEY } from './keys'
import { renderMdx, withUtm } from './render-mdx'
import { STRINGS } from './strings'
import type { Concept, ExtraPage, LinkResolver, Locale, SiteInput, SitePage } from './types'

export { KEY } from './keys'

export function moduleLabel(num: number, title: string): string {
  return `${String(num).padStart(2, '0')} · ${title}`
}

function sitePath(input: SiteInput, key: string): string {
  if (key === KEY.root) return `${input.domain}/`
  const home = key.match(/^en\/home$/)
  if (home) return `${input.domain}/en/`
  const unit = key.match(/^(ru|en)\/u\/([^/]+)\/([^/]+)$/)
  if (unit) return `${input.domain}${unit[1] === 'en' ? '/en' : ''}/lessons/${unit[2]}/${unit[3]}/`
  const module = key.match(/^(ru|en)\/m\/([^/]+)$/)
  if (module) return `${input.domain}${module[1] === 'en' ? '/en' : ''}/lessons/${module[2]}/`
  const page = key.match(/^(ru|en)\/p\/([^/]+)$/)
  if (page) return `${input.domain}${page[1] === 'en' ? '/en' : ''}/${page[2]}/`
  return `${input.domain}/`
}

function href(input: SiteInput, links: LinkResolver, key: string): string {
  return links.page(key) ?? withUtm(sitePath(input, key))
}

function childrenTag(input: SiteInput, links: LinkResolver, key: string, title: string): string {
  return pageTag(href(input, links, key), title)
}

function footer(input: SiteInput, locale: Locale, links: LinkResolver): string {
  const authors = input.config.authorLinks.map((author) => `[${author.label}](${author.url})`).join(' · ')
  return `${STRINGS[locale].invite.replace('{url}', withUtm(sitePath(input, KEY.home(locale))))}\n\n${STRINGS[locale].writeAuthor}: ${authors}`
}

function localeModule(input: SiteInput, locale: Locale, slug: string): ModuleMeta {
  const module = input.modules[locale].find((item) => item.slug === slug)
  if (!module) throw new Error(`модуль ${slug} не найден (${locale})`)
  return module
}

function allUnits(input: SiteInput, locale: Locale): { module: ModuleMeta; unit: { slug: string; title: string }; key: string }[] {
  return input.modules[locale].slice().sort((a, b) => a.module - b.module).flatMap((module) => module.units.map((unit) => ({ module, unit, key: `${module.slug}/${unit.slug}` })))
}

function renderContext(input: SiteInput, locale: Locale, links: LinkResolver, unitKey: string | null, checks: ModuleMeta['checks'] = [], siteKey: string = KEY.root): Parameters<typeof renderMdx>[1] {
  return {
    locale,
    unitKey,
    checks: checks ?? [],
    siteUrl: withUtm(sitePath(input, siteKey)),
    links,
    domain: input.domain,
    concepts: input.concepts,
  }
}

function pageMarkdown(input: SiteInput, locale: Locale, key: string, links: LinkResolver, occurrencesOf: (locale: Locale) => Map<string, string[]>): string {
  const s = STRINGS[locale]
  const homeKey = KEY.home(locale)
  if (key === homeKey) {
    const blocks = [
      callout('👋', `**${s.newHere}** ${input.description[locale]} ${s.homeIntro}\n\n[${s.startFree}](${withUtm(sitePath(input, homeKey === KEY.root ? KEY.root : homeKey))})`),
      `### ${s.onCourse}\n${childrenTag(input, links, KEY.book(locale), s.book)}\n${childrenTag(input, links, KEY.dict(locale), s.dict)}`,
      `### ${s.more}\n${(['cheatsheet', 'exercises', 'roadmap'] as ExtraPage[]).map((name) => childrenTag(input, links, KEY.page(locale, name), input.pageMdx(locale, name).title)).join('\n')}`,
      `### ${s.otherLanguage}\n${locale === 'ru' ? childrenTag(input, links, KEY.home('en'), input.config.title.en) : `[${input.config.title.ru}](${href(input, links, KEY.root)})`}`,
      footerWithoutInvite(input, locale),
    ]
    return blocks.join('\n\n')
  }

  const book = key === KEY.book(locale)
  if (book) {
    const tags = input.modules[locale].slice().sort((a, b) => a.module - b.module).filter((module) => links.page(KEY.module(locale, module.slug)) !== null).map((module) => childrenTag(input, links, KEY.module(locale, module.slug), moduleLabel(module.module, module.title)))
    return `${tags.join('\n')}\n\n${footer(input, locale, links)}`
  }
  if (key === KEY.dict(locale)) return dictionaryMarkdown(input, locale, links)

  const moduleMatch = key.match(/^(ru|en)\/m\/(.+)$/)
  if (moduleMatch) return moduleMarkdown(input, locale, localeModule(input, locale, moduleMatch[2]), links)
  const unitMatch = key.match(/^(ru|en)\/u\/([^/]+)\/([^/]+)$/)
  if (unitMatch) return unitMarkdown(input, locale, unitMatch[2], unitMatch[3], links)
  const conceptMatch = key.match(/^(ru|en)\/c\/(.+)$/)
  if (conceptMatch) return conceptMarkdown(input, locale, conceptMatch[2], links, occurrencesOf)
  const pageMatch = key.match(/^(ru|en)\/p\/(.+)$/)
  if (pageMatch) {
    const name = pageMatch[2] as ExtraPage
    return `${renderMdx(input.pageMdx(locale, name).content, renderContext(input, locale, links, null, [], KEY.page(locale, name)))}\n\n${footer(input, locale, links)}`
  }
  throw new Error(`неизвестный ключ страницы ${key}`)
}

function footerWithoutInvite(input: SiteInput, locale: Locale): string {
  return `${STRINGS[locale].writeAuthor}: ${input.config.authorLinks.map((author) => `[${author.label}](${author.url})`).join(' · ')}`
}

function moduleMarkdown(input: SiteInput, locale: Locale, module: ModuleMeta, links: LinkResolver): string {
  const s = STRINGS[locale]
  const blocks = [`${module.description}`, `${s.duration}: ${module.duration}`]
  if (module.objectives?.length) blocks.push(`### ${s.objectives}\n${module.objectives.map((objective) => `- ${objective.text}`).join('\n')}`)
  blocks.push(`### ${s.units}\n${module.units.map((unit) => childrenTag(input, links, KEY.unit(locale, module.slug, unit.slug), unit.title)).join('\n')}`)
  blocks.push(footer(input, locale, links))
  return blocks.join('\n\n')
}

function unitMarkdown(input: SiteInput, locale: Locale, moduleSlug: string, unitSlug: string, links: LinkResolver): string {
  const module = localeModule(input, locale, moduleSlug)
  const unit = module.units.find((item) => item.slug === unitSlug)
  if (!unit) throw new Error(`юнит ${moduleSlug}/${unitSlug} не найден (${locale})`)
  const currentKey = `${moduleSlug}/${unitSlug}`
  const units = allUnits(input, locale)
  const index = units.findIndex((item) => item.key === currentKey)
  const previous = units[index - 1]
  const next = units[index + 1]
  const previousLink = previous
    ? `← [${moduleLabel(previous.module.module, previous.unit.title)}](${href(input, links, KEY.unit(locale, previous.module.slug, previous.unit.slug))})`
    : ''
  const nextLink = next
    ? `[${moduleLabel(next.module.module, next.unit.title)}](${href(input, links, KEY.unit(locale, next.module.slug, next.unit.slug))}) →`
    : ''
  const nav = [previousLink, nextLink].filter(Boolean).join(' · ')
  const rendered = renderMdx(input.unitMdx(locale, moduleSlug, unitSlug), renderContext(input, locale, links, currentKey, module.checks, KEY.unit(locale, moduleSlug, unitSlug)))
  return [TABLE_OF_CONTENTS, rendered, '---', nav, `[${STRINGS[locale].unitOnSite}](${withUtm(sitePath(input, KEY.unit(locale, moduleSlug, unitSlug)))})`, footer(input, locale, links)].join('\n\n')
}

function dictionaryMarkdown(input: SiteInput, locale: Locale, links: LinkResolver): string {
  const tag = (concept: Concept) => childrenTag(input, links, KEY.concept(locale, concept.id), concept.term[locale])
  const byTerm = (a: Concept, b: Concept) => a.term[locale].localeCompare(b.term[locale], locale)
  const groupOf = (concept: Concept) => {
    const first = concept.term[locale][0] ?? ''
    return /[А-ЯЁ]/i.test(first) ? 'cyr' : /[A-Z]/i.test(first) ? 'lat' : 'other'
  }
  const blocks: string[] = []
  for (const group of locale === 'ru' ? ['cyr', 'lat', 'other'] : ['lat', 'cyr', 'other']) {
    const concepts = input.concepts.filter((concept) => groupOf(concept) === group).sort(byTerm)
    if (group === 'other') {
      if (concepts.length) blocks.push(`### ${STRINGS[locale].otherSymbols}\n${concepts.map(tag).join('\n')}`)
      continue
    }
    const letters = new Map<string, Concept[]>()
    for (const concept of concepts) {
      const letter = concept.term[locale][0].toLocaleUpperCase(locale)
      letters.set(letter, [...(letters.get(letter) ?? []), concept])
    }
    for (const [letter, items] of [...letters].sort(([a], [b]) => a.localeCompare(b, locale))) blocks.push(`### ${letter}\n${items.map(tag).join('\n')}`)
  }
  return `${blocks.join('\n\n')}\n\n${footer(input, locale, links)}`
}

function conceptMarkdown(input: SiteInput, locale: Locale, id: string, links: LinkResolver, occurrencesOf: (locale: Locale) => Map<string, string[]>): string {
  const concept = input.concepts.find((item) => item.id === id)
  if (!concept) throw new Error(`понятие ${id} не найдено`)
  const [sourceModule, sourceUnit] = concept.source.unit.split('/')
  const source = localeModule(input, locale, sourceModule)
  const sourceMeta = source.units.find((unit) => unit.slug === sourceUnit)
  if (!sourceMeta) throw new Error(`понятие ${id}: юнит-источник ${concept.source.unit} не найден (${locale})`)
  const unitKey = KEY.unit(locale, sourceModule, sourceUnit)
  const unitUrl = href(input, links, unitKey)
  const anchor = links.page(unitKey) !== null ? links.anchor(locale, id) : null
  const detail = `**${STRINGS[locale].detail}:** [${moduleLabel(source.module, sourceMeta.title)} → ${STRINGS[locale].qOpen}${concept.source.heading[locale]}${STRINGS[locale].qClose}](${anchor ? anchorUrl(unitUrl, anchor) : unitUrl})`
  const related = concept.related.map((relatedId) => {
    const related = input.concepts.find((item) => item.id === relatedId)
    return related ? `[${related.term[locale]}](${href(input, links, KEY.concept(locale, related.id))})` : null
  }).filter((item): item is string => item !== null)
  const occurrences = (occurrencesOf(locale).get(id) ?? []).filter((key) => key !== concept.source.unit)
  const appears = input.modules[locale].slice().sort((a, b) => a.module - b.module).map((module) => {
    const found = module.units.filter((unit) => occurrences.includes(`${module.slug}/${unit.slug}`))
    return found.length ? `- **${moduleLabel(module.module, module.title)}:** ${found.map((unit) => `[${unit.title}](${href(input, links, KEY.unit(locale, module.slug, unit.slug))})`).join(' · ')}` : null
  }).filter((item): item is string => item !== null)
  const blocks = [`> ${concept.short[locale]}`, detail]
  if (related.length) blocks.push(`**${STRINGS[locale].related}:** ${related.join(' · ')}`)
  if (appears.length) blocks.push(`**${STRINGS[locale].appears}**\n${appears.join('\n')}`)
  blocks.push(footer(input, locale, links))
  return blocks.join('\n\n')
}

export function buildSite(input: SiteInput): SitePage[] {
  const pages: SitePage[] = []
  const occurrenceCache = new Map<Locale, Map<string, string[]>>()
  const occurrencesOf = (locale: Locale): Map<string, string[]> => {
    const cached = occurrenceCache.get(locale)
    if (cached) return cached
    const units = allUnits(input, locale).map((item) => ({ key: item.key, text: plainText(input.unitMdx(locale, item.module.slug, item.unit.slug)) }))
    const found = findOccurrences(input.concepts, locale, units)
    occurrenceCache.set(locale, found)
    return found
  }
  const enabled = (locale: Locale, module: ModuleMeta) => !input.only || module.slug === input.only
  for (const locale of ['ru', 'en'] as const) {
    const modules = input.modules[locale].slice().sort((a, b) => a.module - b.module)
    for (const concept of input.concepts) {
      const [moduleSlug, unitSlug] = concept.source.unit.split('/')
      const module = modules.find((item) => item.slug === moduleSlug)
      if (!module || !module.units.some((unit) => unit.slug === unitSlug)) throw new Error(`понятие ${concept.id}: юнит-источник ${concept.source.unit} не найден (${locale})`)
    }
    const add = (key: string, parentKey: string | null, title: string, stage: SitePage['stage']) => pages.push({ key, parentKey, title, stage, markdown: (links) => pageMarkdown(input, locale, key, links, occurrencesOf) })
    if (locale === 'ru') add(KEY.root, null, input.config.title.ru, 'content')
    else add(KEY.home(locale), KEY.root, input.config.title.en, 'content')
    add(KEY.book(locale), KEY.home(locale), STRINGS[locale].book, 'content')
    for (const module of modules) if (enabled(locale, module)) {
      add(KEY.module(locale, module.slug), KEY.book(locale), moduleLabel(module.module, module.title), 'content')
      for (const unit of module.units) add(KEY.unit(locale, module.slug, unit.slug), KEY.module(locale, module.slug), unit.title, 'content')
    }
    add(KEY.dict(locale), KEY.home(locale), STRINGS[locale].dict, 'content')
    for (const concept of input.concepts) add(KEY.concept(locale, concept.id), KEY.dict(locale), concept.term[locale], 'concept')
    for (const name of ['cheatsheet', 'exercises', 'roadmap'] as ExtraPage[]) add(KEY.page(locale, name), KEY.home(locale), input.pageMdx(locale, name).title, 'content')
  }
  const seen = new Map<string, string>()
  for (const page of pages) {
    const siblingKey = `${page.parentKey ?? 'none'}\0${page.title}`
    if (seen.has(siblingKey)) throw new Error(`повторённый заголовок «${page.title}» у ${page.parentKey}`)
    seen.set(siblingKey, page.key)
  }
  return pages
}

export function fakeResolver(pages: SitePage[]): LinkResolver {
  const keys = new Set(pages.map((page) => page.key))
  return {
    page: (key) => keys.has(key) ? `https://www.notion.so/${createHash('sha1').update(key).digest('hex').slice(0, 32)}` : null,
    anchor: () => null,
  }
}
