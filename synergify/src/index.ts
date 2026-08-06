import { PAGE_HTML } from './page'

// Public constants — listmonk public subscription API (no secrets; Гейт №0: CORS
// отсутствует у listmonk, поэтому воркер обязан проксировать подписку).
const LISTMONK_URL = 'https://mail.mamaev.coach/api/public/subscription'
// RU/EN маршрутизация: два публичных списка listmonk — кампании идут на языке юзера.
const LIST_UUID_RU = 'cf27c05a-a3e2-4ba4-94b8-17a485b8ea95'
const LIST_UUID_EN = '9c837884-ddcb-44be-8df6-db98d589b3f7'

// BIMI-логотип: SVG Tiny PS (единственный профиль, который принимает BIMI/Gmail).
// Три восходящих штриха на индиго = синергия/рост. <title> обязателен, квадрат, без скриптов.
const BIMI_LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny-ps" ' +
  'viewBox="0 0 512 512" width="512" height="512">' +
  '<title>Synergify</title>' +
  '<rect x="0" y="0" width="512" height="512" rx="96" fill="#4f46e5"/>' +
  '<rect x="120" y="288" width="64" height="104" rx="20" fill="#ffffff"/>' +
  '<rect x="224" y="216" width="64" height="176" rx="20" fill="#ffffff"/>' +
  '<rect x="328" y="128" width="64" height="264" rx="20" fill="#ffffff"/>' +
  '</svg>'

// Блог-форма на mamaev.coach ходит на этот же эндпоинт кросс-доменно.
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': 'https://mamaev.coach',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  })
}

type SubscribeBody = { email?: unknown; website?: unknown; lang?: unknown }

// Fail-closed к RU: всё, что не строго "en" (мусор, отсутствие, "EN") → RU-список.
function resolveListUuid(lang: unknown): string {
  return lang === 'en' ? LIST_UUID_EN : LIST_UUID_RU
}

type SubscribeOutcome = 'ok' | 'already' | 'honeypot' | 'invalid_email' | 'upstream_error'

// Общая логика honeypot/валидации/форварда — общая для JSON- и form-путей.
async function subscribeCore(body: SubscribeBody): Promise<SubscribeOutcome> {
  // Honeypot: боты заполняют скрытое поле — молча съедаем без форварда.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return 'honeypot'
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email.includes('@') || email.length > 254) {
    return 'invalid_email'
  }

  let upstream: Response
  let upstreamText = ''
  try {
    upstream = await fetch(LISTMONK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: '', list_uuids: [resolveListUuid(body.lang)] }),
    })
    upstreamText = await upstream.text()
  } catch {
    return 'upstream_error'
  }

  // listmonk отвечает 409/"already subscribed"-стилем на дубликат — для UX это успех.
  if (upstream.status === 409 || /already/i.test(upstreamText)) return 'already'
  if (upstream.ok) return 'ok'
  return 'upstream_error'
}

async function handleSubscribe(request: Request): Promise<Response> {
  const contentType = request.headers.get('Content-Type') || ''

  // Нативный no-JS фолбэк: браузерный form-encoded сабмит → 303-редирект на страницу,
  // статус в query-параметре ?subscribed=… (страница показывает сообщение).
  if (contentType.includes('application/x-www-form-urlencoded')) {
    let body: SubscribeBody
    try {
      const form = await request.formData()
      body = { email: form.get('email'), website: form.get('website'), lang: form.get('lang') }
    } catch {
      body = {}
    }
    const outcome = await subscribeCore(body)
    const param: Record<SubscribeOutcome, string> = {
      ok: '1',
      honeypot: '1', // бота не отличаем — тот же «успех»
      already: 'already',
      invalid_email: 'invalid',
      upstream_error: 'error',
    }
    return new Response(null, {
      status: 303,
      headers: { Location: `/?subscribed=${param[outcome]}` },
    })
  }

  // JSON-путь (fetch со страницы и блог-форма mamaev.coach).
  let body: SubscribeBody
  try {
    body = (await request.json()) as SubscribeBody
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400)
  }
  const outcome = await subscribeCore(body)
  switch (outcome) {
    case 'honeypot':
      return json({ ok: true })
    case 'ok':
      return json({ ok: true })
    case 'already':
      return json({ ok: true, already: true })
    case 'invalid_email':
      return json({ ok: false, error: 'invalid_email' }, 400)
    case 'upstream_error':
      return json({ ok: false, error: 'upstream_error' }, 502)
  }
}

export default {
  async fetch(request: Request, _env: unknown, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    if (request.method === 'OPTIONS' && path === '/api/subscribe') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (request.method === 'GET' && (path === '/' || path === '/index.html')) {
      return new Response(PAGE_HTML, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'Content-Security-Policy':
            "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'",
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      })
    }

    if (request.method === 'POST' && path === '/api/subscribe') {
      return handleSubscribe(request)
    }

    // BIMI-логотип (SVG Tiny PS) — ссылка из default._bimi.mail.synergify.com.
    if (request.method === 'GET' && path === '/bimi-logo.svg') {
      return new Response(BIMI_LOGO_SVG, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    }

    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  },
}
