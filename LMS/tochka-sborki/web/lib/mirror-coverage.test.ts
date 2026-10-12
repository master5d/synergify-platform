// Каждый файл, который ходит в API, обязан быть разобран для зеркала (spec п. 4): иначе новый компонент
// с API тихо попадёт в зеркало. Категории:
//  branch        — в файле есть ветка IS_MIRROR (обязан импортировать lib/mirror);
//  route-stubbed — файл работает только на серверных маршрутах (lib/mirror MIRROR_SERVER_ROUTES), их закрывает MirrorShell;
//  not-rendered  — в зеркале не монтируется (layout);
//  fails-soft    — на 503 от заглушки fetch деградирует сам; причина обязательна.
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = join(__dirname, '..')
const API = /PLATFORM_API|['"`]\/api\//

type Kind = 'branch' | 'route-stubbed' | 'not-rendered' | 'fails-soft'
const SURFACES: Record<string, { kind: Kind; why?: string }> = {
  'components/admission-guard.tsx': { kind: 'branch' },
  'components/intake-guard.tsx': { kind: 'branch' },
  'components/mobile-gate.tsx': { kind: 'branch' },
  'components/progress-provider.tsx': { kind: 'branch' },
  'components/nav.tsx': { kind: 'branch' },
  'components/capture-form.tsx': { kind: 'branch' },
  'components/module-survey.tsx': { kind: 'branch' },
  'components/telegram/telegram-auth-bridge.tsx': { kind: 'not-rendered' },
  'app/auth/verify/verify-client.tsx': { kind: 'route-stubbed' },
  'app/character/profile-client.tsx': { kind: 'route-stubbed' },
  'app/dashboard/dashboard-client.tsx': { kind: 'route-stubbed' },
  'app/dungeon/dungeon-client.tsx': { kind: 'route-stubbed' },
  'components/alumni-client.tsx': { kind: 'route-stubbed' },
  'components/feedback-form.tsx': { kind: 'route-stubbed' },
  'components/intake/intake-wizard.tsx': { kind: 'route-stubbed' },
  'components/login-form.tsx': { kind: 'route-stubbed' },
  'components/pages/certificate-page.tsx': { kind: 'route-stubbed' },
  'components/pages/certificate-verify-page.tsx': { kind: 'route-stubbed' },
  'components/support/support-form.tsx': { kind: 'route-stubbed' },
  'components/character-sheet.tsx': { kind: 'route-stubbed' },
  'lib/login-flow.ts': { kind: 'route-stubbed' },
  'lib/auth-check.ts': { kind: 'fails-soft', why: 'зовёт только AuthGuard, а он в зеркале не проверяет' },
  'lib/mirror.ts': { kind: 'fails-soft', why: 'сам зеркало: PLATFORM_API только в блок-листе fetch, вызовов не делает' },
  'lib/platform-api.ts': { kind: 'fails-soft', why: 'объявление адреса, сам вызовов не делает' },
  'components/hero-secondary-cta.tsx': { kind: 'branch' },
  'components/role-play.tsx': { kind: 'fails-soft', why: '/api/intake/me → 503 → сценарий без персонализации' },
  'components/unit-wizard.tsx': { kind: 'fails-soft', why: '/api/intake/me → 503 → юнит без персонализации; прогресс юнитов — localStorage' },
  'components/intake/unit-route-step.tsx': { kind: 'fails-soft', why: 'маршрут задачи → 503 → шаг не показывается' },
  'lib/progress-sync.ts': { kind: 'fails-soft', why: 'fire-and-forget в try/catch' },
  'lib/spaced-review.ts': { kind: 'fails-soft', why: 'syncAnswer при authed=false ничего не шлёт (в зеркале authed всегда false)' },
  'lib/interest-example/client.ts': { kind: 'fails-soft', why: 'отказ → общий пример' },
  'lib/intake/task-route-content.ts': { kind: 'fails-soft', why: 'отказ → без маршрута задачи' },
  'lib/care.ts': { kind: 'fails-soft', why: 'вызовы — только с /care/ (заглушка); футер берёт лишь тексты' },
  'lib/graduate-retro.ts': { kind: 'fails-soft', why: '/api/auth/me → 503 → блок не показывается (только вошедшему)' },
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return name === 'node_modules' ? [] : walk(p)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) ? [p] : []
  })
}

const actual = ['app', 'components', 'lib']
  .flatMap((d) => walk(join(ROOT, d)))
  .map((p) => relative(ROOT, p).split(sep).join('/'))
  .filter((rel) => !rel.startsWith('app/admin/') && !rel.startsWith('app/en/admin/'))
  .filter((rel) => API.test(readFileSync(join(ROOT, rel), 'utf8')))
  .sort()

describe('зеркало: каждый файл с API разобран', () => {
  it('новых неразобранных файлов нет, разобранные существуют', () => {
    const known = Object.keys(SURFACES).sort()
    expect(actual.filter((f) => !known.includes(f)), 'не разобраны для зеркала').toEqual([])
    expect(known.filter((f) => !actual.includes(f)), 'в списке, но API больше не трогают').toEqual([])
  })
  it('branch-файлы действительно ветвятся по IS_MIRROR', () => {
    for (const [file, s] of Object.entries(SURFACES)) {
      if (s.kind !== 'branch') continue
      expect(readFileSync(join(ROOT, file), 'utf8'), file).toMatch(/IS_MIRROR/)
    }
  })
  it('у fails-soft есть причина', () => {
    for (const [file, s] of Object.entries(SURFACES)) {
      if (s.kind === 'fails-soft') expect(s.why, file).toBeTruthy()
    }
  })
})
