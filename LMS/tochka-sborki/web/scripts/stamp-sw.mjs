#!/usr/bin/env node
// Подставляет префикс курса в сервис-воркер ПОСЛЕ экспорта: sw.js — статический
// файл из public/, его не касаются ни basePath, ни инлайн env. Без этого шага
// курс в подпути кешировал бы шелл чужого корня.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = (process.env.COURSE_BASE_PATH ?? '').replace(/\/$/, '')
const target = join(WEB, 'out', 'sw.js')

if (!existsSync(target)) {
  console.error('stamp-sw: out/sw.js не найден — сначала next build')
  process.exit(1)
}

const src = readFileSync(target, 'utf8')
if (!src.includes('__COURSE_BASE_PATH__')) {
  console.error('stamp-sw: плейсхолдер __COURSE_BASE_PATH__ отсутствует в sw.js')
  process.exit(1)
}
writeFileSync(target, src.replaceAll('__COURSE_BASE_PATH__', BASE), 'utf8')
console.log(`stamp-sw: префикс "${BASE || '(корень)'}" проставлен`)
