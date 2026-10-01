import type { Env } from './types'

const strip = (s: string | undefined) => (s ?? '').replace(/^﻿/, '').trim()

// Зеркало лида в listmonk CRM-список (single opt-in, unconfirmed). D1 users = источник правды.
// best-effort: никогда не роняет вызывающий signup. true = контакт есть в Listmonk (создан или уже был, 409).
// language/source кладутся в attribs подписчика — по ним Listmonk может сегментировать (ru/en).
export async function addCrmContact(
  env: Env,
  lead: { email: string; language?: string; source?: string },
): Promise<boolean> {
  const url = strip(env.LISTMONK_URL)
  const user = strip(env.LISTMONK_API_USER)
  const token = strip(env.LISTMONK_API_TOKEN)
  const listId = Number(strip(env.LISTMONK_CRM_LIST_ID))
  if (!url || !user || !token || !listId) return false
  try {
    const res = await fetch(`${url}/api/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${user}:${token}`,
        'CF-Access-Client-Id': strip(env.CF_ACCESS_CLIENT_ID),
        'CF-Access-Client-Secret': strip(env.CF_ACCESS_CLIENT_SECRET),
      },
      body: JSON.stringify({
        email: lead.email,
        name: '',
        status: 'enabled',
        lists: [listId],
        attribs: {
          ...(lead.language ? { language: lead.language } : {}),
          ...(lead.source ? { source: lead.source } : {}),
        },
        preconfirm_subscriptions: false, // single opt-in: подписка остаётся unconfirmed
      }),
    })
    // 409 = уже существует → noop; прочие non-ok → лог, не бросаем
    if (!res.ok && res.status !== 409) {
      console.error('listmonk contact add non-OK', res.status, await res.text())
      return false
    }
    return true
  } catch (e) {
    console.error('listmonk contact add failed', e)
    return false
  }
}
