import type { Env } from './types'

export interface WebAppButton { text: string; url: string }

// Minimal raw Bot API sendMessage. Optional single web_app inline button.
export async function sendMessage(env: Env, chatId: number, text: string, button?: WebAppButton): Promise<void> {
  const reply_markup = button
    ? { inline_keyboard: [[{ text: button.text, web_app: { url: button.url } }]] }
    : undefined
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup }),
  })
}

// Prompt the user to reply (Telegram shows a reply box pre-targeted at this message).
export async function sendForceReply(env: Env, chatId: number, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: { force_reply: true } }),
  })
}

export interface UrlButton { text: string; url: string }
export interface CallbackButton { text: string; callbackData: string }

// sendMessage with a plain url button (t.me links are not Mini Apps) and an optional callback
// button under it. Returns whether Telegram accepted the message — callers roll back claims on false.
export async function sendLinkMessage(
  env: Env, chatId: number, text: string, link: UrlButton, callback?: CallbackButton,
): Promise<boolean> {
  const rows: unknown[][] = [[{ text: link.text, url: link.url }]]
  if (callback) rows.push([{ text: callback.text, callback_data: callback.callbackData }])
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, reply_markup: { inline_keyboard: rows } }),
      signal: AbortSignal.timeout(10_000),
    })
    return res.ok
  } catch (e) {
    console.error('telegram sendLinkMessage failed', e)
    return false
  }
}
