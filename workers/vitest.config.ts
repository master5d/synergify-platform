import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Алиас @pack/* объявлен только в tsconfig соседнего приложения
// (LMS/tochka-sborki/web/tsconfig.json), а пути TypeScript в рантайме не действуют —
// vitest их не читает. Из-за этого intake.test.ts и gemini.test.ts не исполнялись
// вовсе: падали на импорте ещё до сбора тестов, и «зелёный» прогон воркера
// молча не включал их. Здесь алиас продублирован для рантайма.
// `_active` — гитигнорируемый симлинк на активный course-pack; в свежем клоне
// или worktree его надо создать, иначе тесты снова упадут на импорте.
const pack = fileURLToPath(new URL('../LMS/tochka-sborki/web/packs/_active/', import.meta.url))

export default defineConfig({
  resolve: {
    alias: [{ find: /^@pack\/(.*)$/, replacement: pack + '$1' }],
  },
  test: {
    environment: 'node',
    globals: false,
  },
})
