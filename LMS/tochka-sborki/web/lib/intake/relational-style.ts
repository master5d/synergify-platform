import type { Answers, ErrorStyle, RelationalStyle } from './types'

// Стиль отношений из анкеты v2 (ритм, реакция на ошибку, опора, внимание) — для бондинга компаньона и устава.
// Вопросы MBTI сняты из анкеты 2026-09-29 (слово владельца; Педагогика — риски, intake LMS#20): подгонка
// подачи под «тип» — meshing-гипотеза learning styles без доказательной базы (Pashler 2008). Старые
// значения profiles.mbti в D1 не мигрируются и не удаляются — код их просто не читает и не пишет.

/**
 * Ветки «сразу готовая правка» больше нет (Педагогика 5; Bastani 2025 PNAS: получавшие готовое на
 * экзамене без ИИ проседают). Старые профили с V_ERR = 'fix_immediately' (D1 не мигрируем) читаются
 * как 'step_hints': сразу показать, где ошибка, и подсказать по шагам — исправляет ученик.
 */
export function normalizeErrorStyle(v: RelationalStyle['errorStyle'] | undefined): ErrorStyle | null {
  if (v === 'fix_immediately') return 'step_hints'
  return v ?? null
}

export function relationalStyle(a: Answers): RelationalStyle {
  const pick = <T extends string>(id: string): T | null => (typeof a[id] === 'string' ? (a[id] as T) : null)
  return {
    rhythm: pick<RelationalStyle['rhythm'] & string>('V_RHYTHM'),
    errorStyle: normalizeErrorStyle(pick<RelationalStyle['errorStyle'] & string>('V_ERR')),
    anchor: pick<RelationalStyle['anchor'] & string>('V_ANCHOR'),
    attention: pick<RelationalStyle['attention'] & string>('V_ATTN'),
  }
}
