// Секондари-навигация как данные (BACKLOG «Путь ссылка на урок → вход», мобильное меню).
// Один список пунктов кормит и десктопную полосу (.nav-secondary-links), и мобильное
// меню-бургер: бургер не должен показывать больше того, что пак включает на десктопе.
// COURSE.features решает движок (вызывающая сторона передаёт флаги как данные) — этот
// файл имени курса не знает, только форму флагов.
import type { Dictionary } from '@/lib/dictionaries'

export type Locale = 'ru' | 'en'

export interface NavLink {
  key: string
  href: string
  label: string
  /** Декоративный глиф после подписи (например ◆ у сертификата) — скрыт от чтения экрана. */
  deco?: string
}

export interface SecondaryNavLinksInput {
  locale: Locale
  email: string | null
  features: { rpg: boolean; certificate: boolean }
  nav: Dictionary['nav']
  /** Подпись «Квест-лога» уже пропущена через plain()-переопределение вызывающей стороной. */
  questLogLabel: string
}

export function secondaryNavLinks({ locale, email, features, nav, questLogLabel }: SecondaryNavLinksInput): NavLink[] {
  const p = (path: string) => `${locale === 'en' ? '/en' : ''}${path}`
  const links: NavLink[] = []
  if (features.rpg && email) {
    links.push({ key: 'questLog', href: p('/dashboard/'), label: questLogLabel })
    links.push({ key: 'profile', href: p('/character/'), label: nav.profile })
    links.push({ key: 'synergems', href: p('/alumni/'), label: nav.synergems })
  }
  links.push({ key: 'syllabus', href: p('/syllabus/'), label: nav.syllabus })
  links.push({ key: 'roadmap', href: p('/roadmap/'), label: nav.roadmap })
  links.push({ key: 'cheatsheet', href: p('/cheatsheet/'), label: nav.cheatsheet })
  links.push({ key: 'feedback', href: p('/feedback/'), label: nav.feedback })
  links.push({ key: 'support', href: p('/support/'), label: nav.support })
  if (features.certificate) links.push({ key: 'certificate', href: p('/certificate/'), label: nav.certificate, deco: '◆' })
  return links
}

// --- вход и переключатель языка с возвратом (intake LMS#16-смежный смок-аудит) ---
//
// «→ Войти» и EN/RU в шапке теряли `redirect`: со страницы урока попадаешь на вход
// без контекста, а переключение языка НА странице входа сбрасывает ?redirect= —
// после входа ученика возвращает не туда. `redirect` при этом должен быть только
// внутренним путём (basePath пака в нём уже учтён вызывающей стороной через pagePath):
// без этого поле стало бы open-redirect (?redirect=https://evil).

/** Внутренний путь: один ведущий `/`, без протокола и без `//`/`\`-трюков протокол-относительной ссылки. */
const SAFE_INTERNAL_PATH = /^\/(?!\/)(?!\\)[^\s\\]*$/

export function sanitizeInternalPath(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string' || raw === '') return null
  if (!SAFE_INTERNAL_PATH.test(raw)) return null
  if (raw.includes('://')) return null
  return raw
}

/** Добавляет `?redirect=<путь>` к href — только если путь прошёл sanitizeInternalPath. */
export function withRedirectParam(href: string, redirect: string | null | undefined): string {
  const safe = sanitizeInternalPath(redirect)
  if (!safe) return href
  const sep = href.includes('?') ? '&' : '?'
  return `${href}${sep}redirect=${encodeURIComponent(safe)}`
}
