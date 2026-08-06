import type { Env } from '../lib/types'
import { parseUpdate } from '../lib/telegram-update'
import { nextLesson, lessonUrl, homeUrl, supportUrl, storeUrl } from '../lib/course-order'
import { botCopy, pickLocale, type BotLocale } from '../lib/bot-copy'
import { sendMessage, sendForceReply } from '../lib/telegram-api'
import { notifyOwnerQuestion } from '../lib/owner-notify'

async function loadProgress(env: Env, userId: string): Promise<{ completed: Set<string>; viewed: Set<string> }> {
  const { results } = await env.DB.prepare(
    'SELECT lesson_slug, completed_at FROM progress WHERE user_id = ?'
  ).bind(userId).all<{ lesson_slug: string; completed_at: number | null }>()
  const completed = new Set<string>()
  const viewed = new Set<string>()
  for (const r of results ?? []) {
    viewed.add(r.lesson_slug)
    if (r.completed_at) completed.add(r.lesson_slug)
  }
  return { completed, viewed }
}

export async function handleTelegramWebhook(request: Request, env: Env): Promise<Response> {
  // authenticate: Telegram echoes the secret_token set at setWebhook time
  const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (!env.TELEGRAM_WEBHOOK_SECRET || secret !== env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response('Forbidden', { status: 403 })
  }

  let update: unknown
  try { update = await request.json() } catch { return new Response('ok', { status: 200 }) }

  try {
    const intent = parseUpdate(update)
    if (intent.chatId == null) return new Response('ok', { status: 200 })

    let locale: BotLocale = pickLocale(intent.languageCode)
    let user: { id: string; language: string | null; nudge_optout: number } | null = null
    if (intent.fromId) {
      user = await env.DB.prepare('SELECT id, language, nudge_optout FROM users WHERE telegram_id = ?')
        .bind(intent.fromId).first<{ id: string; language: string | null; nudge_optout: number }>()
      if (user?.language) locale = pickLocale(user.language)
    }
    const copy = botCopy(locale)

    if (intent.kind === 'start') {
      await sendMessage(env, intent.chatId, copy.greeting, { text: copy.openCourse, url: homeUrl(locale) })
      if (user && user.nudge_optout) {
        await env.DB.prepare('UPDATE users SET nudge_optout = 0 WHERE id = ?').bind(user.id).run()
        await sendMessage(env, intent.chatId, copy.startResub)
      }
    } else if (intent.kind === 'stop') {
      if (user) {
        await env.DB.prepare('UPDATE users SET nudge_optout = 1 WHERE id = ?').bind(user.id).run()
      }
      await sendMessage(env, intent.chatId, copy.stopAck)
    } else if (intent.kind === 'support') {
      await sendMessage(env, intent.chatId, copy.supportIntro, { text: copy.supportButton, url: supportUrl(locale) })
    } else if (intent.kind === 'store') {
      await sendMessage(env, intent.chatId, copy.storeIntro, { text: copy.storeButton, url: storeUrl(locale) })
    } else if (intent.kind === 'ask') {
      const question = intent.text?.trim()
      if (!question) {
        await sendForceReply(env, intent.chatId, copy.askPrompt)
      } else {
        await env.DB.prepare(
          'INSERT INTO questions (id, user_id, telegram_id, text, locale, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), user?.id ?? null, intent.fromId, question, locale, Math.floor(Date.now() / 1000), 'new').run()
        await notifyOwnerQuestion(env, { question, asker: intent.fromId, locale })
        await sendMessage(env, intent.chatId, copy.askThanks, { text: copy.askButton, url: homeUrl(locale) })
      }
    } else if (intent.kind === 'continue') {
      if (!user) {
        await sendMessage(env, intent.chatId, copy.openFirst, { text: copy.openCourse, url: homeUrl(locale) })
      } else {
        const { completed, viewed } = await loadProgress(env, user.id)
        const next = nextLesson(completed, viewed)
        if (!next) {
          await sendMessage(env, intent.chatId, copy.finished)
        } else {
          await sendMessage(env, intent.chatId, copy.continueIntro, { text: copy.continueLabel, url: lessonUrl(next.slug, locale) })
        }
      }
    } else {
      await sendMessage(env, intent.chatId, copy.hint, { text: copy.openCourse, url: homeUrl(locale) })
    }

    return new Response('ok', { status: 200 })
  } catch (e) {
    console.error('telegram webhook error', e)
    return new Response('ok', { status: 200 })
  }
}
