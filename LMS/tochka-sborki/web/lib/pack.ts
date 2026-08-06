// Канонический резолвер course-pack (семя COURSE_PACK, Ф1 S1).
// Все fs-потребители данных курса (content-loader, skins-тесты — по мере переезда
// в S2/S3) обязаны ходить через PACK_DIR, а не строить пути сами.
import { join } from 'node:path'

export const PACK_SLUG = process.env.COURSE_PACK ?? 'tochka-sborki'

/** Абсолютный путь каталога активного pack'а (от корня web-аппа). */
export const PACK_DIR = join(process.cwd(), 'packs', PACK_SLUG)
