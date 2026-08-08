import { COURSE } from '@/lib/course'

/**
 * Заголовок вкладки: части через « — », без повторов.
 *
 * Курс из одного модуля даёт совпадение «модуль == курс» (у «Практики в живой
 * связи» так и вышло), и наивная склейка заикалась: «Слон в комнате — Практика
 * в живой связи — Практика в живой связи». Имя курса всегда последнее.
 */
export function pageTitle(...parts: (string | null | undefined)[]): string {
  const seen = new Set<string>()
  const chain: string[] = []
  for (const part of [...parts, COURSE.shortName]) {
    const value = (part ?? '').trim()
    if (!value) continue
    const key = value.toLocaleLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    chain.push(value)
  }
  return chain.join(' — ')
}
