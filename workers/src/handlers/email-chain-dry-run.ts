// GET /api/admin/email-chains/dry-run?at=<unix|ISO> — «кому что ушло бы сегодня» по учебным цепочкам.
// Тот же путь, что cron (dryRunEmailChains в email-chain-cron.ts), без записи и без Listmonk.
// Авторизация (requireOwner) — в роутере, как у /api/admin/stats.
import type { Env } from '../lib/types'
import { dryRunEmailChains } from './email-chain-cron'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

/** at: пусто → сейчас; только цифры → unix-секунды; иначе ISO-дата. null = не разобрать. */
export function parseAt(raw: string | null, nowSec: number): number | null {
  const v = (raw ?? '').trim()
  if (!v) return nowSec
  if (/^\d+$/.test(v)) return Number(v)
  const ms = Date.parse(v)
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null
}

export async function handleEmailChainDryRun(
  env: Env, url: URL, nowSec: number = Math.floor(Date.now() / 1000),
): Promise<Response> {
  const at = parseAt(url.searchParams.get('at'), nowSec)
  if (at == null) return json({ error: 'at: unix seconds or ISO date' }, 400)
  return json(await dryRunEmailChains(env, at))
}
