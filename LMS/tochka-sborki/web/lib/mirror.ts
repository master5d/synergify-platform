// Режим зеркала курса (spec docs/superpowers/specs/2026-10-11-ts-gitbook-mirror-design.md).
// Зеркало на GitHub Pages — для тех, кому Cloudflare режут: ни одного запроса к API и основному
// домену. Флаг инлайнится на сборке (COURSE_MIRROR=1 → NEXT_PUBLIC_COURSE_MIRROR=1, next.config.ts).
import { COURSE } from './course'
import { PLATFORM_API } from './platform-api'

export const IS_MIRROR = process.env.NEXT_PUBLIC_COURSE_MIRROR === '1'

export const MAIN_SITE = COURSE.domain.replace(/\/$/, '')

// Маршруты, которым нужен сервер: в зеркале вместо них — заглушка со ссылкой на основной сайт.
export const MIRROR_SERVER_ROUTES = [
  'login', 'auth', 'dashboard', 'character', 'dungeon', 'quest-intake',
  'certificate', 'feedback', 'support', 'care', 'alumni', 'admin',
] as const

function stripLocale(path: string): string {
  return path.replace(/^\/en(?=\/|$)/, '') || '/'
}

export function isServerOnlyRoute(path: string): boolean {
  const first = stripLocale(path).split('/').filter(Boolean)[0] ?? ''
  return (MIRROR_SERVER_ROUTES as readonly string[]).includes(first)
}

export function mirrorLocale(path: string): 'ru' | 'en' {
  return /^\/en(\/|$)/.test(path) ? 'en' : 'ru'
}

export function mainSiteUrl(path: string): string {
  return `${MAIN_SITE}${path.startsWith('/') ? path : `/${path}`}`
}

/** URL уходит в платформенный API или на основной домен — в зеркале такой вызов не делается. */
export function isPlatformApiUrl(url: string, origin: string): boolean {
  try {
    const u = new URL(url, origin)
    const blocked = new Set([new URL(MAIN_SITE).origin, new URL(PLATFORM_API).origin])
    if (blocked.has(u.origin)) return true
    return u.origin === origin && /^(?:\/[^/]+)?\/api\//.test(u.pathname)
  } catch {
    return false
  }
}

/** Inline-скрипт: <link rel="canonical"> на тот же путь основного сайта (у статического экспорта один layout). */
export function mirrorCanonicalScript(basePath: string, mainSite: string): string {
  const bp = JSON.stringify(basePath)
  const site = JSON.stringify(mainSite)
  return `(function(){try{var p=location.pathname;var b=${bp};if(b&&p.indexOf(b)===0)p=p.slice(b.length)||'/';` +
    `var l=document.createElement('link');l.rel='canonical';l.href=${site}+p;document.head.appendChild(l);}catch(e){}})();`
}

export const MIRROR_COPY = {
  banner: {
    ru: 'Это зеркало курса для чтения. Вход, прогресс на сервере и сертификат — на основном сайте.',
    en: 'This is a read-only mirror of the course. Sign-in, server progress and the certificate live on the main site.',
  },
  bannerLink: { ru: 'Открыть на ai.synergify.com', en: 'Open on ai.synergify.com' },
  dismiss: { ru: 'Скрыть', en: 'Hide' },
  stubTitle: { ru: 'Это доступно на основном сайте', en: 'This is available on the main site' },
  stubBody: {
    ru: 'Зеркало показывает юниты, шпаргалку и материалы без входа. Для этой страницы нужен сервер курса.',
    en: 'The mirror shows units, the cheatsheet and materials without sign-in. This page needs the course server.',
  },
  stubLink: { ru: 'Перейти на основной сайт', en: 'Go to the main site' },
  stubHome: { ru: 'К программе курса', en: 'Back to the course' },
  formNote: {
    ru: 'Эта форма работает на основном сайте.',
    en: 'This form works on the main site.',
  },
} as const
