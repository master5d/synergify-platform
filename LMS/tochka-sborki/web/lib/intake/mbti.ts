import type { Answers, MbtiType, RelationalStyle } from './types'

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
    errorStyle: pick<RelationalStyle['errorStyle'] & string>('V_ERR'),
    anchor: pick<RelationalStyle['anchor'] & string>('V_ANCHOR'),
    attention: pick<RelationalStyle['attention'] & string>('V_ATTN'),
  }
}
