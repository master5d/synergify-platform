// packs/tochka-sborki/manifest.ts
// Исполняемый манифест курса «Точка Сборки»: рамка тона, которую обязан держать
// весь контент и словари pack'а (включая гостевые модули). Проверяется гвардом
// lib/content/manifest-guard.test.ts через checkManifest.
// Правила — ТОЛЬКО в обещающих формах (шрам regex-над-прозой, см. lib/authoring/manifest.ts).
import type { ManifestRule } from '../../lib/authoring/manifest'
import { CORE_MANIFEST } from '../../lib/authoring/manifest'

export const MANIFEST: ManifestRule[] = [
  ...CORE_MANIFEST,
]
