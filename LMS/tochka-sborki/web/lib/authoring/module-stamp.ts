// lib/authoring/module-stamp.ts
// Контракт _module.json — паспорт гостевого модуля. Пишется скаффолдером в
// content/ru/<NN-slug>/_module.json (RU-канон, одной локали достаточно).
// Модули БЕЗ штампа легальны — это авторские модули владельца.
// manifest_ack: true = мастер подтвердил, что принял рамку манифеста курса.

export interface ModuleStamp {
  slug: string
  author: { name: string; contact?: string }
  /** YYYY-MM-DD */
  created: string
  manifest_ack: true
}

const MODULE_SLUG = /^\d{2}-[a-z0-9-]+$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

/** Возвращает [] когда JSON валиден по контракту ModuleStamp, иначе ошибки. */
export function validateStamp(json: unknown): string[] {
  const errors: string[] = []
  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    return ['_module.json must be a JSON object']
  }
  const s = json as Record<string, unknown>

  if (typeof s.slug !== 'string' || !MODULE_SLUG.test(s.slug)) {
    errors.push(`slug "${String(s.slug)}" must match NN-slug (e.g. 02-astrologia)`)
  }

  const author = s.author as Record<string, unknown> | undefined
  if (typeof author !== 'object' || author === null || Array.isArray(author)) {
    errors.push('author must be an object { name, contact? }')
  } else {
    if (typeof author.name !== 'string' || author.name.trim().length === 0) {
      errors.push('author.name must be a non-empty string')
    }
    if (author.contact !== undefined && typeof author.contact !== 'string') {
      errors.push('author.contact, when present, must be a string')
    }
  }

  if (typeof s.created !== 'string' || !DATE.test(s.created)) {
    errors.push('created must be a YYYY-MM-DD date string')
  }
  if (s.manifest_ack !== true) {
    errors.push('manifest_ack must be exactly true — the author accepts the course manifest')
  }
  return errors
}
