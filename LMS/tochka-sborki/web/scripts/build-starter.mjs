#!/usr/bin/env node
// Собирает стартер студента из pack'а в скачиваемый архив public/downloads/<archive>.
//
// Источник — packs/<pack>/starter.json + каталог starter/ рядом с ним; шаблоны курса
// подтягиваются из LMS/<курс>/my-templates/ по списку `include`, а не копируются в репо
// второй раз. Архив НЕ хранится в git (public/downloads/ в .gitignore): он собирается на
// prebuild, поэтому не может разъехаться с исходником. Сборка детерминирована —
// фиксированная дата, сортировка, LF в тексте: тот же исходник → тот же архив.
// Pack без starter.json стартера не получает.
//
// Использование: node scripts/build-starter.mjs   (npm prebuild/pretest; npm run starter)
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve, relative, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { deflateRawSync, inflateRawSync } from 'node:zlib'

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Файлы, которых в архиве быть не должно, даже если лежат в исходнике. */
export const JUNK = [/(^|\/)\.DS_Store$/, /(^|\/)Thumbs\.db$/, /(^|\/)desktop\.ini$/, /\.log$/, /(^|\/)node_modules\//, /(^|\/)\.env(\.|$)/]

const TEXT_EXT = /\.(md|mjs|js|json|txt|toml|ya?ml)$|(^|\/)\.gitignore$/

export function readStarterManifest(packDir) {
  const p = join(packDir, 'starter.json')
  if (!existsSync(p)) return null
  return JSON.parse(readFileSync(p, 'utf8'))
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

function renamed(rel, rename) {
  for (const [from, to] of Object.entries(rename ?? {})) {
    if (from.endsWith('/') ? rel.startsWith(from) : rel === from) return to + rel.slice(from.length)
  }
  return rel
}

/**
 * Список файлов стартера: [{ path, data }] — path внутри архива (без корневой папки),
 * data — Buffer. Текст нормализуется в LF и проверяется на BOM.
 */
export function collectStarterFiles(packDir, manifest = readStarterManifest(packDir)) {
  if (!manifest) throw new Error(`build-starter: в ${packDir} нет starter.json`)
  const files = new Map()
  const add = (path, abs) => {
    if (JUNK.some((re) => re.test(path))) return
    if (files.has(path)) throw new Error(`build-starter: файл ${path} объявлен дважды`)
    let data = readFileSync(abs)
    if (TEXT_EXT.test(path)) {
      if (data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) throw new Error(`build-starter: ${abs} с BOM`)
      data = Buffer.from(data.toString('utf8').replace(/\r\n/g, '\n'), 'utf8')
    }
    files.set(path, data)
  }

  const src = join(packDir, manifest.source)
  for (const abs of walk(src)) {
    const rel = relative(src, abs).split(sep).join('/')
    add(renamed(rel, manifest.rename), abs)
  }
  for (const inc of manifest.include ?? []) {
    const from = resolve(packDir, inc.from)
    for (const name of inc.files) {
      const abs = join(from, name)
      if (!existsSync(abs)) throw new Error(`build-starter: нет файла ${abs} (include в starter.json)`)
      add(`${inc.to}/${name}`, abs)
    }
  }
  return [...files.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([path, data]) => ({ path, data }))
}

// ---- ZIP (deflate), без зависимостей ----

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

export function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

// Фиксированная дата записей (DOS-формат): 2026-01-01 00:00 — архив воспроизводим.
const DOS_TIME = 0
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1

/** entries: [{ name, data, executable? }] → Buffer zip-архива. */
export function buildZip(entries) {
  const locals = []
  const centrals = []
  let offset = 0
  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8')
    const comp = deflateRawSync(e.data, { level: 9 })
    const crc = crc32(e.data)
    const mode = e.executable ? 0o100755 : 0o100644

    const lh = Buffer.alloc(30)
    lh.writeUInt32LE(0x04034b50, 0)
    lh.writeUInt16LE(20, 4)
    lh.writeUInt16LE(0x0800, 6) // UTF-8 имена
    lh.writeUInt16LE(8, 8) // deflate
    lh.writeUInt16LE(DOS_TIME, 10)
    lh.writeUInt16LE(DOS_DATE, 12)
    lh.writeUInt32LE(crc, 14)
    lh.writeUInt32LE(comp.length, 18)
    lh.writeUInt32LE(e.data.length, 22)
    lh.writeUInt16LE(name.length, 26)
    lh.writeUInt16LE(0, 28)
    locals.push(lh, name, comp)

    const ch = Buffer.alloc(46)
    ch.writeUInt32LE(0x02014b50, 0)
    ch.writeUInt16LE((3 << 8) | 20, 4) // made by: UNIX — чтобы сохранился режим файла
    ch.writeUInt16LE(20, 6)
    ch.writeUInt16LE(0x0800, 8)
    ch.writeUInt16LE(8, 10)
    ch.writeUInt16LE(DOS_TIME, 12)
    ch.writeUInt16LE(DOS_DATE, 14)
    ch.writeUInt32LE(crc, 16)
    ch.writeUInt32LE(comp.length, 20)
    ch.writeUInt32LE(e.data.length, 24)
    ch.writeUInt16LE(name.length, 28)
    ch.writeUInt16LE(0, 30)
    ch.writeUInt16LE(0, 32)
    ch.writeUInt16LE(0, 34)
    ch.writeUInt16LE(0, 36)
    ch.writeUInt32LE((mode << 16) >>> 0, 38)
    ch.writeUInt32LE(offset, 42)
    centrals.push(ch, name)

    offset += lh.length + name.length + comp.length
  }
  const central = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(central.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, central, end])
}

/** Обратное чтение (для тестов): Buffer zip → [{ name, data, mode }] по центральному каталогу. */
export function readZip(buf) {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  if (eocd < 0) throw new Error('readZip: нет конца центрального каталога')
  const count = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)
  const out = []
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('readZip: битый центральный каталог')
    const method = buf.readUInt16LE(p + 10)
    const crc = buf.readUInt32LE(p + 16)
    const compSize = buf.readUInt32LE(p + 20)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const mode = buf.readUInt32LE(p + 38) >>> 16
    const local = buf.readUInt32LE(p + 42)
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen)
    const lNameLen = buf.readUInt16LE(local + 26)
    const lExtraLen = buf.readUInt16LE(local + 28)
    const start = local + 30 + lNameLen + lExtraLen
    const raw = buf.subarray(start, start + compSize)
    const data = method === 8 ? inflateRawSync(raw) : Buffer.from(raw)
    if (crc32(data) !== crc) throw new Error(`readZip: CRC не сходится у ${name}`)
    out.push({ name, data, mode })
    p += 46 + nameLen + extraLen + commentLen
  }
  return out
}

/** Полная сборка: pack → { archive, buffer, files }. */
export function buildStarter(packDir) {
  const manifest = readStarterManifest(packDir)
  if (!manifest) return null
  const files = collectStarterFiles(packDir, manifest)
  const exec = new Set(manifest.executable ?? [])
  const buffer = buildZip(files.map((f) => ({ name: `${manifest.root}/${f.path}`, data: f.data, executable: exec.has(f.path) })))
  return { manifest, archive: manifest.archive, buffer, files }
}

// ---- CLI ----
// Собирает стартеры ВСЕХ pack'ов, у которых есть starter.json, а не только активного:
// public/ общий для всех курсов (чужое из out/ убирает prune-public.mjs), а гвард
// lib/public-ownership.test.ts требует, чтобы объявленный pack'ом файл существовал при
// любом COURSE_PACK.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const packsDir = join(WEB, 'packs')
  const slugs = readdirSync(packsDir).filter((n) => !n.startsWith('_') && statSync(join(packsDir, n)).isDirectory())
  let built = 0
  const seen = new Map()
  for (const slug of slugs) {
    const res = buildStarter(join(packsDir, slug))
    if (!res) continue
    if (seen.has(res.archive)) {
      console.error(`build-starter: архив ${res.archive} объявлен двумя pack'ами (${seen.get(res.archive)}, ${slug})`)
      process.exit(1)
    }
    seen.set(res.archive, slug)
    const outDir = join(WEB, 'public', 'downloads')
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, res.archive), res.buffer)
    built++
    console.log(`build-starter: ${slug} → public/downloads/${res.archive} (${res.files.length} файлов, ${res.buffer.length} байт)`)
  }
  if (!built) console.log("build-starter: ни у одного pack'а нет starter.json — стартер не собирается")
}
