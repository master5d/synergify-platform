import { NotionError } from '../client'
import { notionUrl } from '../md'
import type { ChildBlock, NotionApi } from '../types'

type FakePage = { id: string; parent: string; title: string; markdown: string; inTrash: boolean; headingIds: string[] }
type FakeOptions = { root: string; uncertainCreates?: Set<string>; failAfterCreates?: number }

export class FakeNotion implements NotionApi {
  private readonly pages = new Map<string, FakePage>()
  private readonly uncertain: Set<string>
  private readonly failAfter: number | undefined
  private readonly rootId: string
  private next = 0
  private creates = 0
  readonly log: string[] = []

  constructor(options: FakeOptions) {
    this.rootId = options.root
    this.uncertain = new Set(options.uncertainCreates ?? [])
    this.failAfter = options.failAfterCreates
    this.pages.set(options.root, { id: options.root, parent: '', title: options.root, markdown: '', inTrash: false, headingIds: [] })
  }

  private id(): string {
    const id = this.next.toString(16).padStart(32, '0')
    this.next += 1
    return id
  }

  private page(id: string): FakePage {
    const page = this.pages.get(id)
    if (!page) throw new Error(`unknown fake page ${id}`)
    return page
  }

  private livePage(page: FakePage): boolean {
    if (page.inTrash) return false
    let parent = page.parent
    while (parent) {
      const ancestor = this.page(parent)
      if (ancestor.inTrash) return false
      parent = ancestor.parent
    }
    return true
  }

  private isLiveChild(page: FakePage, parent: string): boolean {
    return page.parent === parent && this.livePage(page)
  }

  private snapshot(page: FakePage) {
    return { id: page.id, parent: page.parent, title: page.title, markdown: page.markdown, inTrash: page.inTrash }
  }

  live() {
    return [...this.pages.values()].filter((page) => page.id !== this.rootId && this.livePage(page)).map((page) => this.snapshot(page))
  }

  get(id: string) {
    return this.snapshot(this.page(id))
  }

  idByTitle(title: string): string {
    const page = [...this.pages.values()].find((item) => item.title === title && this.livePage(item))
    if (!page) throw new Error(`нет живой страницы «${title}»`)
    return page.id
  }

  addManualChild(parentId: string, title: string): string {
    const id = this.id()
    this.pages.set(id, { id, parent: parentId, title, markdown: '', inTrash: false, headingIds: [] })
    return id
  }

  setMarkdown(id: string, markdown: string): void {
    const page = this.page(id)
    page.markdown = markdown
    page.headingIds = this.headingIds(markdown)
  }

  private headingIds(markdown: string): string[] {
    return [...markdown.matchAll(/^#{1,4} /gm)].map(() => this.id())
  }

  async createPage(parentId: string, title: string): Promise<{ id: string }> {
    this.creates += 1
    if (this.failAfter !== undefined && this.creates === this.failAfter + 1) throw new Error(`fake: обрыв после ${this.failAfter} созданий`)
    const id = this.id()
    this.pages.set(id, { id, parent: parentId, title, markdown: '', inTrash: false, headingIds: [] })
    this.log.push(`create ${title}`)
    if (this.uncertain.has(title)) {
      this.uncertain.delete(title)
      throw new NotionError(504, 'uncertain', `fake: uncertain ${title}`)
    }
    return { id }
  }

  async updateTitle(id: string, title: string): Promise<void> {
    this.page(id).title = title
    this.log.push(`title ${id}`)
  }

  async replaceMarkdown(id: string, markdown: string): Promise<void> {
    const page = this.page(id)
    const children = [...this.pages.values()].filter((child) => this.isLiveChild(child, id))
    const missing = children.filter((child) => !markdown.includes(`<page url="${notionUrl(child.id)}"`)).map((child) => child.title)
    if (missing.length) throw new NotionError(400, 'validation_error', `missing children: ${missing.join(', ')}`)
    page.markdown = markdown
    page.headingIds = this.headingIds(markdown)
    this.log.push(`replace ${id}`)
  }

  async getMarkdown(id: string): Promise<{ markdown: string; truncated: boolean }> {
    return { markdown: this.page(id).markdown, truncated: false }
  }

  async trashPage(id: string): Promise<void> {
    this.page(id).inTrash = true
    this.log.push(`trash ${id}`)
  }

  async listChildren(id: string): Promise<ChildBlock[]> {
    const children = [...this.pages.values()].filter((page) => this.isLiveChild(page, id)).map((page) => ({ id: page.id, type: 'child_page', text: page.title }))
    const page = this.page(id)
    const headings = [...page.markdown.matchAll(/^(#{1,4}) (.*)$/gm)].map((match, index) => ({ id: page.headingIds[index], type: `heading_${match[1].length}`, text: match[2] }))
    return [...children, ...headings]
  }

  async getPage(id: string): Promise<{ publicUrl: string | null; inTrash: boolean }> {
    const page = this.page(id)
    return { publicUrl: null, inTrash: page.inTrash }
  }

  async searchPages(): Promise<{ id: string; title: string }[]> {
    return [...this.pages.values()].filter((page) => this.livePage(page)).map((page) => ({ id: page.id, title: page.title }))
  }
}
