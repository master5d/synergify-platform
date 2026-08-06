// lib/authoring/manifest.ts
// Исполняемый манифест курса: декларативные правила-паттерны, которые контент и
// словари pack'а обязаны НЕ матчить. Механизм движка; сами правила живут в
// packs/<slug>/manifest.ts (читаются через стаб lib/manifest.ts → @pack/manifest).
//
// ШРАМ (regex-над-прозой = незамыкаемый класс): правила пишутся ТОЛЬКО в
// ОБЕЩАЮЩИХ формах («гарантируем», «обретёшь сверхспособности»). Легитимные
// отрицания в честной копии («не гарантирует», «сверхспособностей — НЕТ»)
// не должны матчиться — это ответственность автора правил, закреплённая тестами.
// RU-паттерны — без \b: JS \b не работает вокруг кириллицы (см. dehustle.ts).

export interface ManifestRule {
  /** RegExp source (строка — pack'и остаются данными, без RegExp-объектов). */
  pattern: string
  /** RegExp flags; по умолчанию 'i'. */
  flags?: string
  /** Человекочитаемый лейбл правила — попадает в промпты и отчёты гварда. */
  label: string
}

export interface ManifestFinding { label: string; match: string }

/** Прогоняет текст по правилам; возвращает по находке на сработавшее правило. */
export function checkManifest(text: string, rules: ManifestRule[]): ManifestFinding[] {
  const findings: ManifestFinding[] = []
  for (const rule of rules) {
    const m = new RegExp(rule.pattern, rule.flags ?? 'i').exec(text)
    if (m) findings.push({ label: rule.label, match: m[0] })
  }
  return findings
}

/** Общее ядро манифеста всех курсов академии: scarcity + «гарантированный результат».
 *  Pack'и расширяют его своими доменными правилами (packs/<slug>/manifest.ts). */
export const CORE_MANIFEST: ManifestRule[] = [
  {
    pattern: 'только сегодня|only today',
    label: 'scarcity: искусственный дедлайн («только сегодня»)',
  },
  {
    pattern: 'успей|осталось мест|последний шанс|last chance|offer (ends|expires)|hurry up',
    label: 'scarcity: подгоняющий тон («успей», «осталось мест»)',
  },
  {
    pattern: 'скидка (только|сгорит|сгорает)|промокод сгор|\\d+% (off|discount|скидк)',
    label: 'scarcity: discount-хайп (сгорающие скидки, %-off)',
  },
  {
    pattern: 'гарантированный результат|гарантируем результат|guaranteed results?|results? guaranteed',
    label: 'обещание: «гарантированный результат»',
  },
]
