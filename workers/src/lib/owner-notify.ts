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

// Служба заботы (/api/care): то же письмо владельцу, но с результатом — приёмник должен знать,
// дошло ли обращение хоть куда-то (журнал или почта), чтобы не сказать человеку «получили» впустую.
export async function notifyOwnerCare(
  env: Env,
  msg: { subject: string; text: string },
): Promise<boolean> {
  const owner = strip(env.OWNER_EMAIL)
  if (!strip(env.SES_ACCESS_KEY_ID) || !owner) {
    console.error('care: owner notify skipped — SES_ACCESS_KEY_ID/OWNER_EMAIL not configured')
    return false
  }
  const res = await sendEmailSES(env, {
    from: 'Служба заботы <noreply@synergify.com>',
    to: owner,
    subject: msg.subject,
    text: msg.text,
  })
  if (!res.ok) console.error('care: owner-notify non-OK', res.status, res.error)
  return res.ok
}
