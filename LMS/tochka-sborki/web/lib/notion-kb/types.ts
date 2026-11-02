import type { ModuleMeta } from '../content'

export type Locale = 'ru' | 'en'

export type Bi = {
  ru: string
  en: string
}

export type ExtraPage = 'cheatsheet' | 'exercises' | 'roadmap'

export type Concept = {
  id: string
  term: Bi
  forms: { ru: RegExp; en: RegExp }
  short: Bi
  source: { unit: string; heading: Bi }
  related: string[]
}

export type KbConfig = {
  servicePageId: string | null
  title: Bi
  authorLinks: { label: string; url: string }[]
}

export type SiteInput = {
  domain: string
  description: Bi
  config: KbConfig
  modules: Record<Locale, ModuleMeta[]>
  unitMdx(l: Locale, m: string, u: string): string
  pageMdx(l: Locale, name: ExtraPage): { title: string; content: string }
  concepts: Concept[]
  only?: string
}

export type LinkResolver = {
  page(key: string): string | null
  anchor(l: Locale, conceptId: string): string | null
}

export type SitePage = {
  key: string
  parentKey: string | null
  title: string
  stage: 'content' | 'concept'
  markdown(links: LinkResolver): string
}

export type ChildBlock = {
  id: string
  type: string
  text: string
}

export interface NotionApi {
  createPage(parentId: string, title: string): Promise<{ id: string }>
  updateTitle(id: string, title: string): Promise<void>
  replaceMarkdown(id: string, md: string): Promise<void>
  getMarkdown(id: string): Promise<{ markdown: string; truncated: boolean }>
  trashPage(id: string): Promise<void>
  listChildren(id: string): Promise<ChildBlock[]>
  getPage(id: string): Promise<{ publicUrl: string | null; inTrash: boolean }>
  searchPages(): Promise<{ id: string; title: string }[]>
}
