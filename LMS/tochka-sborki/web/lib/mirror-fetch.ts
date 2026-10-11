// Первый слой зеркала: вызов к API или основному домену получает мгновенный 503, сеть не трогается.
// Почти все вызывающие уже понимают отказ (!r.ok / catch) и деградируют; где отказ ломает работу —
// явные ветки IS_MIRROR (защиты, прогресс, nav, формы). Ставится в components/mirror-shell.tsx.
import { isPlatformApiUrl } from './mirror'

export type MirrorWindow = { fetch: typeof fetch; location: { origin: string } }

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

export function installMirrorFetchGuard(win: MirrorWindow): void {
  const original = win.fetch.bind(win)
  win.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (isPlatformApiUrl(urlOf(input), win.location.origin)) {
      return Promise.resolve(new Response(null, { status: 503, statusText: 'mirror' }))
    }
    return original(input, init)
  }) as typeof fetch
}
