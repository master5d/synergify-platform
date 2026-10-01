#!/usr/bin/env node
// Hook начала сессии: печатает STATE.md и TODO.md, агент получает их как контекст.
// Claude Code и Codex добавляют текст, который SessionStart-hook печатает в stdout,
// в контекст сессии (см. README.md, раздел «Что прочитает твой агент»).
// AGENTS.md hook НЕ печатает: агент читает его сам, а вторая копия только съела бы контекст
// (так прямо советует документация Claude Code о памяти).
//
// Что делает: только ЧИТАЕТ два файла рядом с собой и печатает их. Ничего не пишет,
// в сеть не ходит, других программ не запускает. Прежде чем одобрить hook — прочитай это.
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LIMIT = 4000 // символов на файл: память должна быть короткой, длинная съедает контекст

function show(name) {
  const path = join(ROOT, name)
  if (!existsSync(path)) {
    console.log(`[${name}] файла нет — создай его (шаблон в стартере курса).`)
    return
  }
  let text = readFileSync(path, 'utf8').trim()
  if (text.length > LIMIT) {
    text = `${text.slice(0, LIMIT)}\n… [обрезано: ${name} длиннее ${LIMIT} символов — пора сократить]`
  }
  console.log(`===== ${name} =====\n${text}\n`)
}

try {
  console.log('Память проекта (hook начала сессии):\n')
  show('STATE.md')
  show('TODO.md')
} catch (err) {
  // Hook не должен ломать запуск агента, но и молчать о сбое не должен.
  console.log(`Hook памяти не смог прочитать файлы: ${err.message}. Прочитай STATE.md и TODO.md сам.`)
}
