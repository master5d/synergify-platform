import type { Env } from './types'

const strip = (s: string | undefined) => (s ?? '').replace(/^﻿/, '').trim()

// Зеркало лида в listmonk CRM-список (single opt-in, unconfirmed). D1 users = источник правды.
// best-effort: никогда не роняет вызывающий signup.
export async function addCrmContact(
  env: Env,
  lead: { email: string; language?: string; source?: string },
): Promise<void> {
  const url = strip(env.LISTMONK_URL)
  const user = strip(env.LISTMONK_API_USER)
  const token = strip(env.LISTMONK_API_TOKEN)
  const listId = Number(strip(env.LISTMONK_CRM_LIST_ID))
  if (!url || !user || !token || !listId) return
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
        preconfirm_subscriptions: false, // single opt-in: подписка остаётся unconfirmed
      }),
    })
    // 409 = уже существует → noop; прочие non-ok → лог, не бросаем
    if (!res.ok && res.status !== 409) console.error('listmonk contact add non-OK', res.status, await res.text())
  } catch (e) {
    console.error('listmonk contact add failed', e)
  }
}
