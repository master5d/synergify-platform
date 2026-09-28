// GET/POST /api/email/unsubscribe?u=<userId>&s=<sig> — отписка от УЧЕБНЫХ писем (users.email_optout).
// GET только показывает страницу с кнопкой: сканеры ссылок в почте ходят GET'ом и не должны отписывать.
// POST (кнопка на странице или one-click RFC 8058 от почтовика, тело `List-Unsubscribe=One-Click`)
// ставит флаг. Маркетинговые списки Listmonk не трогаются.
import type { Env } from '../lib/types'
import { verifyUnsubscribe } from '../lib/email-unsubscribe'
import { pickLocale } from '../lib/bot-copy'

const COPY = {
  ru: {
    title: 'Отписка от учебных писем',
    ask: 'Больше не присылать письма-напоминания и письма о прогрессе в курсе «Точка Сборки»?',
    button: 'Отписаться',
    done: 'Готово: учебные письма больше не придут. Вход в курс и ваш прогресс остаются на месте.',
  },
  en: {
    title: 'Unsubscribe from course emails',
    ask: 'Stop sending reminder and progress emails for the Tochka Sborki course?',
    button: 'Unsubscribe',
    done: "Done: you won't get course emails anymore. Your access and progress stay as they are.",
  },
}

function page(lang: 'ru' | 'en', body: string): Response {
  const c = COPY[lang]
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${c.title}</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:48px auto;padding:0 16px;line-height:1.55;color:#1a1a1a">
<h1 style="font-size:20px">${c.title}</h1>${body}</body></html>`
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}

export async function handleEmailUnsubscribe(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const userId = url.searchParams.get('u') ?? ''
  const sig = url.searchParams.get('s') ?? ''
  if (!(await verifyUnsubscribe(userId, sig, env.WORKER_JWT_SECRET))) {
    return new Response('Invalid link', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  const user = await env.DB.prepare('SELECT language FROM users WHERE id = ?').bind(userId).first<{ language: string | null }>()
  const lang = pickLocale(user?.language)
  const c = COPY[lang]

  if (request.method === 'POST') {
    await env.DB.prepare('UPDATE users SET email_optout = 1 WHERE id = ?').bind(userId).run()
    console.log('email-unsubscribe: opted out')
    return page(lang, `<p>${c.done}</p>`)
  }

  // u и s уже проверены подписью; всё равно экранируем для атрибута.
  const action = `?u=${encodeURIComponent(userId)}&amp;s=${encodeURIComponent(sig)}`
  return page(lang, `<p>${c.ask}</p>
<form method="post" action="${action}"><button type="submit" style="font-size:16px;padding:10px 20px;cursor:pointer">${c.button}</button></form>`)
}
