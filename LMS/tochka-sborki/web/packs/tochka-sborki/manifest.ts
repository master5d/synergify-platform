// packs/tochka-sborki/manifest.ts
// Исполняемый манифест курса «Точка Сборки»: рамка тона, которую обязан держать
// весь контент и словари pack'а (включая гостевые модули). Проверяется гвардом
// lib/content/manifest-guard.test.ts через checkManifest.
// Правила — ТОЛЬКО в обещающих формах (шрам regex-над-прозой, см. lib/authoring/manifest.ts).
import type { ManifestRule } from '../../lib/authoring/manifest'
import { CORE_MANIFEST } from '../../lib/authoring/manifest'

export const MANIFEST: ManifestRule[] = [
  ...CORE_MANIFEST,
  {
    // Страховка обещания рамки входа (dictionary.entryFrame, intake LMS#1): «бесплатно,
    // без встроенных продаж». Матчим только ПРОДАЮЩИЕ конструкции (призыв купить /
    // разблокировать / апгрейднуться внутри курса); отрицания («без встроенных продаж»,
    // «нечего докупать», «no built-in sales») и бытовое «нужно докупить» — легальны
    // (закреплено в manifest.test.ts рядом).
    pattern: 'купи(те)? (доступ|премиум|полную версию|продолжение)|оформи(те)? премиум|разблокиру(й|йте) за \\d|buy (access|premium|the full (course|version))|upgrade to (premium|pro|the full)|unlock (premium|the full (course|version))',
    label: 'встроенная продажа: призыв купить/разблокировать внутри курса',
  },
]
