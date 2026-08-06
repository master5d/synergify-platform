#!/usr/bin/env node
// Sovereign manifesto prompt-emitter for the S.A.S.H.A academy (v2, Хогвартс-рамка).
// Prints a prompt for the OWNER's agent (no live LLM call anywhere): run it,
// paste the output into your agent, then paste the resulting manifesto into
// academy/lib/dictionaries.ts (academy.positioning, both locales).
// Raw material = owner notes from academy/_notes/*.md (gitignored, репо public).
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const registry = JSON.parse(readFileSync(join(repoRoot, 'LMS', 'registry.json'), 'utf8'))
const { name, fullName } = registry.academy
const courses = registry.courses
  .map((c) => `- ${c.name.ru} / ${c.name.en} (${c.status})`)
  .join('\n')

const notesDir = join(repoRoot, 'academy', '_notes')
let notesBlock = '(заметок пока нет — пиши из рамки ниже)'
if (existsSync(notesDir)) {
  const files = readdirSync(notesDir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .sort()
  if (files.length > 0) {
    notesBlock = files
      .map((f) => `--- ЗАМЕТКА ${f} ---\n${readFileSync(join(notesDir, f), 'utf8').trim()}`)
      .join('\n\n')
  }
}

console.log(`You are drafting the public manifesto for ${name} — ${fullName.en}.

CONTEXT
Academy: ${name} (${fullName.ru})
Courses today:
${courses}
Frame: закрытая школа скрытых способностей — «виртуальный Хогвартс» для тех, кто
хочет вскрыть в себе большее. Это ОТДЕЛЬНЫЙ продукт от открытого курса «Точка
Сборки»: попасть в академию невозможно, не пройдя курс (admission — заслуженный,
server-verified). Точка Сборки — для всех; академия — для готовых идти глубже.

OWNER RAW NOTES (первоисточник голоса и смысла; verbatim, не редактированы)
${notesBlock}

TASK
Write the academy manifesto in TWO languages (Russian first, then English): 3-5
short paragraphs each, first person plural, warm and specific. Голос и образы
бери ИЗ ЗАМЕТОК владельца; рамка выше — только каркас. Противоречия между
заметками решай в пользу более поздней (дата в имени файла).

HARD CONSTRAINTS
- No urgency or scarcity (no countdowns, no "limited", no "only today").
- No testimonials, credentials-flexing, or grand titles.
- Мистический образ школы — можно; апроприация конкретной живой традиции — нет.
- Никаких обещаний сверхспособностей или результатов, которые нельзя сдержать;
  «скрытые способности» подаём как работу и раскрытие, не как товар.
- Anti-dependency sacred: школа растит самостоятельных, не адептов гуру.
- Plain language over guru language — тайна в образе, не в тумане слов.

PLACEMENT
Paste the final paragraphs into academy/lib/dictionaries.ts → academy.positioning
(the ru array and the en array), replacing the current copy. Keep
academy.metaTitle / academy.metaDescription in sync if the framing shifts.`)
