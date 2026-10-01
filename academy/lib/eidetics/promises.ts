// lib/eidetics/promises.ts
// Манифест обещаний модуля «Эйдетика» (правило из intake LMS#11, по образцу правила про
// сверхспособности в packs/living-practice/manifest.ts движка). Академия движок не тянет —
// механизм (правило-строка + checkPromises) повторён здесь в той же форме ManifestRule.
//
// ШРАМ «regex-над-прозой»: правила ловят только ОБЕЩАЮЩИЕ формы («разовьёте фотографическую
// память», «гарантируем»). Честные отрицания («фотографическая память как навык — миф»,
// «не обещаем эйдетической памяти») обязаны проходить — закреплено в promises.test.ts.
// RU-паттерны без \b: JS \b не работает вокруг кириллицы (см. lib/authoring/dehustle.ts).

export interface PromiseRule { pattern: string; flags?: string; label: string }
export interface PromiseFinding { label: string; match: string }

// Инфинитивы («развить», «натренировать») не берём: «невозможно развить…» — честное отрицание.
// Отрицание прямо перед глаголом («не даст», «не будет») гасится lookbehind'ом.
const PROMISE_VERBS_RU =
  '(?<!не )(?<!ни )(разовь[её]шь|разовь[её]те|обрет[её]шь|обрет[её]те|получишь|получите|натренируешь|натренируете|' +
  'научишься|научитесь|станет|будет|да[её]т|дадут|откро[её]т|включит|пробудит|освоишь|освоите)'

export const EIDETICS_PROMISES: PromiseRule[] = [
  {
    pattern: `${PROMISE_VERBS_RU}[^.!?\\n]{0,40}(фотографическ|эйдетическ)[а-яё]* памят`,
    label: 'обещание: «фотографическая/эйдетическая память» как результат',
  },
  {
    // Только обещающие конструкции: «adults can train eidetic memory» в отрицании легитимно,
    // «you will not get…» гасится тем, что между will и глаголом нет места для not.
    pattern: "(will|you'll) (develop|gain|get|build|achieve|have)[^.!?\\n]{0,30}(photographic|eidetic) memory" +
      '|gives? you (an? )?(photographic|eidetic) memory|(unlock|awaken)s? (your )?(photographic|eidetic) memory',
    label: 'promise: photographic/eidetic memory as an outcome',
  },
  {
    pattern: '(запомнишь|запомните) вс[её]|(remember|memori[sz]e) everything',
    label: 'обещание: «запомните всё»',
  },
  {
    pattern: 'гарантируем|гарантирую|гарантированн|we guarantee|guaranteed',
    label: 'обещание: гарантия результата',
  },
  {
    pattern: '(в|на) \\d+ раз[а]? (лучше|больше|быстрее)|\\d+x (better|more|faster)',
    label: 'обещание: кратный прирост памяти без источника',
  },
]

/** Прогоняет текст по правилам; по находке на сработавшее правило. */
export function checkPromises(text: string, rules: PromiseRule[] = EIDETICS_PROMISES): PromiseFinding[] {
  const findings: PromiseFinding[] = []
  for (const rule of rules) {
    const m = new RegExp(rule.pattern, rule.flags ?? 'i').exec(text)
    if (m) findings.push({ label: rule.label, match: m[0] })
  }
  return findings
}
