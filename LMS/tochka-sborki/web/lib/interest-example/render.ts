// lib/interest-example/render.ts — текст примера → абзацы с инлайн-кодом. Без MDX: пример приходит
// строкой (из pack'а или от воркера), и HTML из него не собирается — только текст и <code>.
import { paragraphsOf } from './guard'

export interface Segment { code: boolean; text: string }

export function exampleParagraphs(text: string): Segment[][] {
  return paragraphsOf(text).map(p =>
    p.split(/(`[^`\n]+`)/).filter(Boolean).map(s =>
      s.startsWith('`') && s.endsWith('`') && s.length > 2
        ? { code: true, text: s.slice(1, -1) }
        : { code: false, text: s }))
}
