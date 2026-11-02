import type { ChildBlock, NotionApi } from './types'

export const NOTION_VERSION = '2026-03-11'
const BASE_URL = 'https://api.notion.com/v1'
const MAX_ATTEMPTS = 5
const RETRY_DELAYS = [1000, 2000, 4000, 8000]
const BLOCK_LIMIT_MESSAGE = 'Notion: лимит блоков Free (restricted_resource). В «RAM» появился второй участник? Запись остановлена'

export class NotionError extends Error {
  status: number
  code: string
  blockLimit: boolean

  constructor(status: number, code: string, message: string, blockLimit = false) {
    super(message)
    this.name = 'NotionError'
    this.status = status
    this.code = code
    this.blockLimit = blockLimit
  }
}

type ClientOptions = {
  token: string
  fetchImpl?: typeof fetch
  sleep?(ms: number): Promise<void>
  now?(): number
  timeoutMs?: number
}

type ErrorBody = {
  status?: number
  code?: string
  message?: string
  additional_data?: { block_limit?: string }
}

export function createNotionClient(opts: ClientOptions): NotionApi {
  const fetchImpl = opts.fetchImpl ?? fetch
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  const now = opts.now ?? Date.now
  const timeoutMs = opts.timeoutMs ?? 30_000
  let lastStart: number | null = null

  const redact = (message: string) => message.split(opts.token).join('***')

  const makeError = (status: number, code: string, message: string, blockLimit = false) =>
    new NotionError(status, code, redact(message), blockLimit)

  const throttle = async () => {
    if (lastStart !== null) {
      const wait = 334 - (now() - lastStart)
      if (wait > 0) await sleep(wait)
    }
    lastStart = now()
  }

  const parseBody = async (response: Response): Promise<unknown> => {
    const text = await response.text()
    if (!text) return {}
    try {
      return JSON.parse(text)
    } catch {
      return null
    }
  }

  const retryAfter = (response: Response) => {
    const value = response.headers.get('Retry-After')
    if (value !== null && /^\d+(?:\.\d+)?$/.test(value.trim())) {
      return Math.min(Number(value) * 1000, 60000)
    }
    return null
  }

  const errorFromResponse = (status: number, body: unknown) => {
    const errorBody = body !== null && typeof body === 'object' ? body as ErrorBody : {}
    const code = typeof errorBody.code === 'string' ? errorBody.code : 'http_error'
    if (status === 403 && code === 'restricted_resource' && errorBody.additional_data?.block_limit === 'block_creation') {
      return makeError(status, code, BLOCK_LIMIT_MESSAGE, true)
    }
    if (code === 'http_error' || typeof errorBody.message !== 'string') {
      return makeError(status, 'http_error', `Notion ${status} http_error`)
    }
    return makeError(status, code, `Notion ${status} ${code}: ${errorBody.message}`)
  }

  const request = async (path: string, method: string, body: unknown, idempotent: boolean): Promise<unknown> => {
    let lastNetworkError: unknown
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      await throttle()
      const headers = new Headers({
        Authorization: `Bearer ${opts.token}`,
        'Notion-Version': NOTION_VERSION,
      })
      if (body !== undefined) headers.set('Content-Type', 'application/json')
      try {
        const response = await fetchImpl(`${BASE_URL}${path}`, {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: AbortSignal.timeout(timeoutMs),
        })
        const parsed = await parseBody(response)
        if (response.ok) return parsed

        const retryable = response.status === 429 || response.status === 529 || (idempotent && [500, 502, 503, 504].includes(response.status))
        if (retryable && attempt < MAX_ATTEMPTS - 1) {
          const wait = response.status === 429 ? retryAfter(response) ?? RETRY_DELAYS[attempt] : RETRY_DELAYS[attempt]
          await sleep(wait)
          continue
        }
        if (!idempotent && method === 'POST' && response.status !== 429 && response.status !== 529) {
          throw makeError(response.status, response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504 ? 'uncertain' : errorFromResponse(response.status, parsed).code, `Notion ${response.status} uncertain`)
        }
        throw errorFromResponse(response.status, parsed)
      } catch (error) {
        if (error instanceof NotionError) throw error
        lastNetworkError = error
        if (!idempotent) throw makeError(0, 'uncertain', 'Notion 0 uncertain')
        if (attempt < MAX_ATTEMPTS - 1) {
          await sleep(RETRY_DELAYS[attempt])
          continue
        }
      }
    }
    if (idempotent) throw makeError(0, 'network', 'Notion 0 network')
    throw lastNetworkError instanceof NotionError ? lastNetworkError : makeError(0, 'uncertain', 'Notion 0 uncertain')
  }

  const titleBody = (title: string) => ({ title: { title: [{ type: 'text', text: { content: title } }] } })

  return {
    async createPage(parentId, title) {
      const result = await request('/pages', 'POST', { parent: { type: 'page_id', page_id: parentId }, properties: titleBody(title) }, false) as { id: string }
      return { id: result.id }
    },
    async updateTitle(id, title) {
      await request(`/pages/${encodeURIComponent(id)}`, 'PATCH', { properties: titleBody(title) }, true)
    },
    async replaceMarkdown(id, md) {
      await request(`/pages/${encodeURIComponent(id)}/markdown`, 'PATCH', { type: 'replace_content', replace_content: { new_str: md }, markdown_version: 'v2' }, true)
    },
    async getMarkdown(id) {
      return await request(`/pages/${encodeURIComponent(id)}/markdown?markdown_version=v2`, 'GET', undefined, true) as { markdown: string; truncated: boolean }
    },
    async trashPage(id) {
      await request(`/pages/${encodeURIComponent(id)}`, 'PATCH', { in_trash: true }, true)
    },
    async listChildren(id) {
      const blocks: ChildBlock[] = []
      let cursor: string | null = null
      do {
        const suffix = cursor === null ? '?page_size=100' : `?page_size=100&start_cursor=${encodeURIComponent(cursor)}`
        const page = await request(`/blocks/${encodeURIComponent(id)}/children${suffix}`, 'GET', undefined, true) as { results?: Array<Record<string, unknown>>; has_more?: boolean; next_cursor?: string | null }
        for (const block of page.results ?? []) {
          const type = typeof block.type === 'string' ? block.type : ''
          const data = block[type] as { title?: string; rich_text?: Array<{ plain_text?: string }> } | undefined
          const text = type === 'child_page' ? data?.title ?? '' : type.startsWith('heading_') ? (data?.rich_text ?? []).map((item) => item.plain_text ?? '').join('') : ''
          blocks.push({ id: String(block.id ?? ''), type, text })
        }
        cursor = page.has_more ? page.next_cursor ?? null : null
      } while (cursor !== null)
      return blocks
    },
    async getPage(id) {
      const page = await request(`/pages/${encodeURIComponent(id)}`, 'GET', undefined, true) as { public_url?: string | null; in_trash?: boolean }
      return { publicUrl: page.public_url ?? null, inTrash: page.in_trash === true }
    },
    async searchPages() {
      const result = await request('/search', 'POST', { filter: { property: 'object', value: 'page' }, page_size: 100 }, true) as { results?: Array<{ id: string; properties?: { title?: { title?: Array<{ plain_text?: string }> } } }> }
      return (result.results ?? []).map((page) => ({ id: page.id, title: (page.properties?.title?.title ?? []).map((item) => item.plain_text ?? '').join('') }))
    },
  }
}
