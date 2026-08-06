import type { Env } from './types'
import { sendEmailSES } from './ses'

const strip = (s: string | undefined) => (s ?? '').replace(/^﻿/, '').trim()

// Best-effort owner notification for a learner question. Never throws (mirrors crm.ts).
export async function notifyOwnerQuestion(
  env: Env,
  q: { question: string; asker: string | null; locale: string },
): Promise<void> {
  const owner = strip(env.OWNER_EMAIL)
  if (!strip(env.SES_ACCESS_KEY_ID) || !owner) return
  const res = await sendEmailSES(env, {
    from: 'Точка Сборки <noreply@synergify.com>',
    to: owner,
    subject: 'Новый вопрос из Telegram-бота',
    text: `Вопрос от Telegram-пользователя ${q.asker ?? 'unknown'} (locale: ${q.locale}):\n\n${q.question}`,
  })
  if (!res.ok) console.error('owner-notify non-OK', res.status, res.error)
}
