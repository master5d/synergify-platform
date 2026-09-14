// База сайта курса для ссылки из письма (вариант A, intake LMS#16). Страница входа присылает
// `return_to` = origin + basePath своего курса; воркер принимает ТОЛЬКО точное совпадение с адресом
// курса из LMS/registry.json (источник правды о курсах), иначе — Точка Сборки. Open-redirect через
// письмо невозможен: произвольный адрес в ссылку не попадает. Имя курса для письма — оттуда же.
import registry from '../../../LMS/registry.json'

export interface RegistryCourse { slug: string; name: { ru: string; en: string }; url: string }

const COURSES = (registry as { courses: RegistryCourse[] }).courses
const trim = (u: string) => u.replace(/\/+$/, '')
const DEFAULT_COURSE = COURSES.find((c) => c.slug === 'tochka-sborki') ?? COURSES[0]

export function resolveReturnBase(raw: unknown): { base: string; course: RegistryCourse } {
  if (typeof raw === 'string' && raw.length < 300) {
    const hit = COURSES.find((c) => trim(c.url) === trim(raw))
    if (hit) return { base: trim(hit.url), course: hit }
  }
  return { base: trim(DEFAULT_COURSE.url), course: DEFAULT_COURSE }
}

/** Префикс курса в пути (`/praktika`) для Google-входа: только `/slug` из латиницы/цифр/дефиса. */
export function safeBasePath(raw: string | null): string {
  return raw && /^\/[a-z0-9-]{1,40}$/.test(raw) ? raw : ''
}
