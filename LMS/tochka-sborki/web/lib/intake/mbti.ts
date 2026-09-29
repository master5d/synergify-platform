import type { Answers, ErrorStyle, MbtiType, RelationalStyle } from './types'

// MBTI собирается анкетой, но НЕ основание адаптации обучения (Педагогика — риски, intake LMS#20):
// подгонка подачи под «тип» — meshing-гипотеза learning styles без доказательной базы (Pashler 2008).
// Промпт компаньона и устав агента MBTI не читают; тест — lib/learn-prompt.test.ts.

/**
 * Ветки «сразу готовая правка» больше нет (Педагогика 5; Bastani 2025 PNAS: получавшие готовое на
 * экзамене без ИИ проседают). Старые профили с V_ERR = 'fix_immediately' (D1 не мигрируем) читаются
 * как 'step_hints': сразу показать, где ошибка, и подсказать по шагам — исправляет ученик.
 */
export function normalizeErrorStyle(v: RelationalStyle['errorStyle'] | undefined): ErrorStyle | null {
  if (v === 'fix_immediately') return 'step_hints'
  return v ?? null
}

const SIXTEEN = new Set([
  'INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP',
])

export function deriveMbti(a: Answers): MbtiType | null {
  const sr = a['V_MBTI_SR']
  if (typeof sr === 'string' && SIXTEEN.has(sr)) return sr
  const ei = a['V_MBTI_EI'], sn = a['V_MBTI_SN'], tf = a['V_MBTI_TF'], jp = a['V_MBTI_JP']
  if (typeof ei === 'string' && typeof sn === 'string' && typeof tf === 'string' && typeof jp === 'string') {
    const t = `${ei}${sn}${tf}${jp}`
    return SIXTEEN.has(t) ? t : null
  }
  return null
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
