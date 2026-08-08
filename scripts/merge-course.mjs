#!/usr/bin/env node
// Складывает экспорт курса (движок, собранный с COURSE_BASE_PATH) в экспорт
// оболочки школы, чтобы домен обслуживался одним проектом: витрина в корне,
// курс в подпути. Паттерн обкатан в лабе на связке блог → хаб (модель B).
//
//   node scripts/merge-course.mjs <pack-slug> <sub-path>
//   пример: node scripts/merge-course.mjs living-practice praktika
//
// ⚠ Как это устроено у Next: при `basePath` экспорт кладёт страницы в КОРЕНЬ out/,
// а префикс проставляет только внутри ссылок и ассетов. Поэтому весь каталог
// целиком садится в <sub-path>/ оболочки — иначе ссылки укажут в пустоту.
// Локали курса живут внутри его подпути (RU — /<sub>/, EN — /<sub>/en/):
// у курса своя маршрутизация, оболочка на неё не влияет.
import { cp, access, rm, readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const [pack, subPathRaw] = process.argv.slice(2)

if (!pack || !subPathRaw) {
  console.error('merge-course: нужны два аргумента — <pack-slug> <sub-path>')
  process.exit(1)
}
const subPath = subPathRaw.replace(/^\/+|\/+$/g, '')

const courseOut = join(ROOT, 'LMS', 'tochka-sborki', 'web', 'out')
const shellOut = join(ROOT, 'academy', 'out')
const target = join(shellOut, subPath)

const exists = async (p) => { try { await access(p); return true } catch { return false } }

for (const [label, dir] of [['курса', courseOut], ['оболочки', shellOut]]) {
  if (!(await exists(dir))) {
    console.error(`merge-course: нет сборки ${label} (${dir}) — сначала собери оба приложения`)
    process.exit(1)
  }
}

// Проверяем, что движок собран ИМЕННО с этим префиксом: иначе ссылки внутри
// курса поведут в корень домена и переезд молча сломается. Дешёвая проверка —
// главная страница курса обязана ссылаться на /<subPath>/.
const home = await readFile(join(courseOut, 'index.html'), 'utf8')
if (!home.includes(`"/${subPath}/`)) {
  console.error(
    `merge-course: сборка курса не содержит ссылок на "/${subPath}/" — ` +
    `движок собран без COURSE_BASE_PATH=/${subPath}`,
  )
  process.exit(1)
}

// Оболочка могла нести свою версию этого пути (старый дубль курса) — сносим,
// иначе поверх ляжет мешанина двух источников.
if (await exists(target)) {
  await rm(target, { recursive: true, force: true })
  console.log(`merge-course: убран прежний ${subPath}/ из оболочки`)
}

await cp(courseOut, target, { recursive: true })
console.log(`merge-course: экспорт курса "${pack}" → оболочка/${subPath}/`)

// Служебные файлы оболочки не должны быть перекрыты копией из курса.
for (const stray of ['_redirects', '_headers']) {
  const p = join(target, stray)
  if (await exists(p)) {
    await rm(p, { force: true })
    console.log(`merge-course: убран ${subPath}/${stray} (правила деплоя — у оболочки)`)
  }
}

console.log('merge-course: готово')
