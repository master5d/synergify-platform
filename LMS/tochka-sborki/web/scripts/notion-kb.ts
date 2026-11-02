// Запуск: node scripts/notion-kb.ts <check|sync|status|smoke> … (рабочая папка — LMS/tochka-sborki/web)
import { registerHooks } from 'node:module'
// Тот же хук, что scripts/gen-lesson-views.ts:28-35: `.ts` для относительных импортов без расширения.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (/^\.\.?\//.test(specifier) && !/\.[cm]?[jt]sx?$|\.json$/.test(specifier)) {
      try { return nextResolve(`${specifier}.ts`, context) } catch { /* ниже — как есть */ }
    }
    return nextResolve(specifier, context)
  },
})
type Cli = typeof import('../lib/notion-kb/cli')
const { main } = (await import(new URL('../lib/notion-kb/cli.ts', import.meta.url).href)) as Cli
process.exitCode = await main(process.argv.slice(2), process.env)
