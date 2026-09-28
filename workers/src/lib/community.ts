import type { Env } from './types'
import { botCopy, pickLocale, type BotLocale } from './bot-copy'
import { sendLinkMessage } from './telegram-api'

// Слой сообщества (intake LMS#13, spec docs/superpowers/specs/2026-09-28-community-layer.md).
// Сообщество живёт в Telegram-группе владельца; бот платформы только приглашает — один раз,
// в нужный момент. Участники группы, их сообщения и работы здесь не хранятся: пишется лишь
// факт «приглашение отправлено» (community_invites) и отказ ученика (users.community_optout).
// Выключено по умолчанию (COMMUNITY_INVITES_ENABLED="0"); best-effort — никогда не роняет ответ ученику.

export type InvitePlace = string                    // ключ курса (progress.course) или 'academy'
export type InviteTrigger = 'first-lesson' | 'admission'

export interface CommunityPlace {
  /** Куда ведёт приглашение: тема курса в группе или сама группа. '' = места нет, бот молчит. */
  url: string
  /** Как назвать место в тексте приглашения. */
  name: { ru: string; en: string }
}

export const ACADEMY_PLACE = 'academy'

/** Места приглашений. Ссылки курсов сверены тестом с packs/<pack>/course/community.ts
 *  (community.test.ts): поменял в pack'е — поменяй здесь. Пустой url гасит приглашение. */
export const COMMUNITY_INVITES: Record<InvitePlace, CommunityPlace> = {
  // Группу, темы и ссылки Точки Сборки даёт владелец (BACKLOG, «слой сообщества»).
  'tochka-sborki': { url: '', name: { ru: 'сообщество курса «Точка Сборки»', en: 'the Tochka Sborki course community' } },
  // Тема «Тишина» в чате академии — открыта владельцем 2026-09-14 (BACKLOG, «Круг „Тишины“»).
  'living-practice': {
    url: 'https://t.me/kundaliniRUs/7823',
    name: { ru: 'тема «Тишина» в чате академии «Мастерская Перехода»', en: 'the «Тишина» topic in the academy chat "Мастерская Перехода"' },
  },
  // Чат академии «Мастерская Перехода» (BACKLOG, «Круг „Тишины“»).
  [ACADEMY_PLACE]: {
    url: 'https://t.me/kundaliniRUs',
    name: { ru: 'чат академии «Мастерская Перехода»', en: 'the academy chat "Мастерская Перехода"' },
  },
}

const strip = (s: string | undefined) => (s ?? '').replace(/^﻿/, '').trim()

export function invitesEnabled(env: Env): boolean {
  return strip(env.COMMUNITY_INVITES_ENABLED) === '1'
}

export function placeFor(place: InvitePlace): CommunityPlace | null {
  const p = COMMUNITY_INVITES[place]
  return p && p.url ? p : null
}

export interface InviteCandidate {
  telegram_id: string | null
  language: string | null
  nudge_optout: number
  community_optout: number
}

/** Чистая политика: можно ли вообще приглашать этого ученика (без учёта «уже приглашён»). */
export function mayInvite(c: InviteCandidate | null): c is InviteCandidate & { telegram_id: string } {
  if (!c) return false
  if (!c.telegram_id) return false          // бот пишет только тем, кто связал Telegram
  if (c.nudge_optout) return false          // /stop — «бот, молчи»
  if (c.community_optout) return false      // «Не присылать такое»
  return true
}

export function inviteText(locale: BotLocale, trigger: InviteTrigger, place: CommunityPlace): string {
  const copy = botCopy(locale)
  const intro = trigger === 'admission' ? copy.communityInviteAdmission : copy.communityInviteLesson
  return `${intro}\n\n${copy.communityWhere} ${place.name[locale]}.\n${copy.communityNote}`
}

/** Пригласить ученика в место сообщества — не больше одного раза на (ученик, место).
 *  Точка входа из handleComplete / handleAdmission. Не бросает. */
export async function maybeInviteToCommunity(
  env: Env,
  input: { userId: string; place: InvitePlace; trigger: InviteTrigger; nowSec?: number },
): Promise<{ sent: boolean; reason: string }> {
  try {
    return await invite(env, input)
  } catch (e) {
    // Самая вероятная причина при включённом флаге — миграция 0021 не применена. Громко, не молча.
    console.error('community invite failed (migration 0021 applied?)', e)
    return { sent: false, reason: 'error' }
  }
}

async function invite(
  env: Env,
  { userId, place, trigger, nowSec = Math.floor(Date.now() / 1000) }: { userId: string; place: InvitePlace; trigger: InviteTrigger; nowSec?: number },
): Promise<{ sent: boolean; reason: string }> {
  if (!invitesEnabled(env)) return { sent: false, reason: 'disabled' }
  const target = placeFor(place)
  if (!target) return { sent: false, reason: 'no-place' }

  const user = await env.DB.prepare(
    'SELECT telegram_id, language, nudge_optout, community_optout FROM users WHERE id = ?'
  ).bind(userId).first<InviteCandidate>()
  if (!mayInvite(user)) return { sent: false, reason: 'not-eligible' }

  if (trigger === 'first-lesson') {
    const done = await env.DB.prepare(
      'SELECT 1 AS one FROM progress WHERE user_id = ? AND course = ? AND completed_at IS NOT NULL LIMIT 1'
    ).bind(userId, place).first<{ one: number }>()
    if (!done) return { sent: false, reason: 'no-lesson' }
  }

  // Захват до отправки: второй вызов (двойной клик, повторное завершение) видит строку и молчит.
  const claim = await env.DB.prepare(
    'INSERT OR IGNORE INTO community_invites (user_id, place, trigger, sent_at) VALUES (?, ?, ?, ?)'
  ).bind(userId, place, trigger, nowSec).run()
  if (!claim.meta?.changes) return { sent: false, reason: 'already' }

  const locale = pickLocale(user.language)
  const copy = botCopy(locale)
  const ok = await sendLinkMessage(env, Number(user.telegram_id), inviteText(locale, trigger, target),
    { text: copy.communityButton, url: target.url },
    { text: copy.communityOffButton, callbackData: 'community_off' })
  if (!ok) {
    await env.DB.prepare('DELETE FROM community_invites WHERE user_id = ? AND place = ?').bind(userId, place).run()
    return { sent: false, reason: 'send-failed' }
  }
  return { sent: true, reason: 'sent' }
}

/** Ссылки для /community — по запросу ученика, без флага рассылки и без учёта отказа. */
export function communityLinks(locale: BotLocale): { name: string; url: string }[] {
  return Object.values(COMMUNITY_INVITES)
    .filter(p => p.url)
    .map(p => ({ name: p.name[locale], url: p.url }))
}
