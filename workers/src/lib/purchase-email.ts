import type { Env } from './types'
import type { Product } from './products'
import { sendEmailSES } from './ses'

const strip = (s: string | undefined) => (s ?? '').replace(/^﻿/, '').trim()

// Best-effort asset delivery email (mirrors owner-notify.ts). Never throws; returns whether it sent.
export async function sendPurchaseEmail(
  env: Env,
  p: { email: string; product: Product; assetUrl: string; locale: 'ru' | 'en' },
): Promise<boolean> {
  if (!strip(env.SES_ACCESS_KEY_ID)) return false

  const name = p.product.name[p.locale]
  const subject = p.locale === 'en' ? `Your download: ${name}` : `Твоя ссылка на скачивание: ${name}`
  const text = p.locale === 'en'
    ? `Thank you for your purchase — ${name}.\n\nDownload it here:\n${p.assetUrl}\n\nThis is a sale by the creator (a sole proprietor), not a nonprofit donation.`
    : `Спасибо за покупку — ${name}.\n\nСкачать можно здесь:\n${p.assetUrl}\n\nЭто покупка у автора (ИП), а не пожертвование в нонпрофит.`

  const res = await sendEmailSES(env, { from: 'Точка Сборки <noreply@synergify.com>', to: p.email, subject, text })
  if (!res.ok) { console.error('purchase-email non-OK', res.status, res.error); return false }
  return true
}
