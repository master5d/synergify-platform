# Зеркало «Точки Сборки» на GitHub Pages (`ts-gitbook`) — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** собрать из того же кода курса зеркало для чтения на `https://master5d.github.io/ts-gitbook/`, которое не делает ни одного запроса в Cloudflare и пересобирается на каждый push в `main`.

**Architecture:** флаг сборки `COURSE_MIRROR=1` → `NEXT_PUBLIC_COURSE_MIRROR`; одна точка правды `lib/mirror.ts`. Два слоя: (1) в зеркале `fetch` к `/api/*` и `ai.synergify.com` получает мгновенный 503 — сеть не трогается; (2) явные ветки там, где отказ ломает работу: защиты уроков, прогресс, кнопка входа, формы, серверные страницы (заглушка через `MirrorShell` в корневом layout — `usePathname` работает на этапе статической сборки). Деплой — задача `deploy-mirror` в `deploy.yml`, push `out/` в ветку `gh-pages` репо `master5d/ts-gitbook` по deploy key.

**Tech Stack:** Next.js 16 (`output: 'export'`, `basePath`), React, TypeScript, Vitest (среда `node`, `react-dom/server` для статического рендера), GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-11-ts-gitbook-mirror-design.md`

Рабочая папка всех команд, если не сказано иное: `LMS/tochka-sborki/web/` в worktree `C:\telo\Efforts\On\lms-engine\.worktrees\mirror` (ветка `feat/ts-gitbook-mirror`). Перед тестами: `node scripts/select-pack.mjs tochka-sborki`.

## Global Constraints

- Адрес зеркала: `https://master5d.github.io/ts-gitbook/`; `COURSE_BASE_PATH=/ts-gitbook`; репо `master5d/ts-gitbook`, ветка `gh-pages`.
- Без `COURSE_MIRROR` поведение основной сборки не меняется: каждая ветка зеркала — `IS_MIRROR ? … : <прежнее>`.
- Основной сайт — `COURSE.domain` (`https://ai.synergify.com`), не хардкод (инвариант `lib/course.ts`).
- Компоненты с хуками: ветку зеркала делать **обёрткой** (`X = IS_MIRROR ? <Mirror…/> : <XLive …/>`), не ранним `return` до хуков.
- Тексты зеркала — в `lib/mirror.ts` (`MIRROR_COPY`, RU+EN), не в словарях pack'ов (у living-practice свой словарь).
- Контент RU и EN — одним коммитом; после правки юнита — `node scripts/gen-lesson-views.ts tochka-sborki <модуль> --paraphrase`, коммитить views только правленых юнитов.
- Глоссарий: «Hook», «Skills», «промпт», «шлюз к моделям», «юнит», «модуль», «AI»; не «урок», не «запрос».
- Git: только поимённо (`git add <файл>`), не `-A`/`.` в рабочем дереве.
- Готовность задачи: её тесты + полный `npm test` + `npx tsc --noEmit` и `COURSE_PACK=living-practice npx tsc --noEmit` (после — `node scripts/select-pack.mjs tochka-sborki`).
- Секреты не в argv/логах: ключ deploy — только пайпом в `gh secret set`.

## Review Focus

1. Сырая ссылка `<a href="/…">` или `window.location` без `pagePath` на открытой странице → уводит на чужой корень `master5d.github.io/` (404). Статические ссылки ловит `check-mirror` (Task 7); динамические — нет, ревьюеру смотреть диффы на `window.location`.
2. Скрипт третьей стороны, заблокированный в РФ, вешает загрузку (`telegram.org/js/telegram-web-app.js` с `beforeInteractive`) → в зеркале не подключать; `check-mirror` проверяет отсутствие `telegram.org` в HTML (Task 5, Task 7).
3. `localStorage` бросает (приватный режим Safari) → прогресс и плашка не должны ронять страницу (тест в Task 4 и Task 5).
4. Прямая ссылка на серверный маршрут с `/en/` (`/en/dashboard/`) → заглушка на английском, ссылка на `ai.synergify.com/en/dashboard/` (тест в Task 5).
5. Ссылка «на основной сайт» и canonical не должны нести префикс `/ts-gitbook` (тесты `mainSiteUrl` и `mirrorCanonicalScript` в Task 1).

---

### Task 1: `lib/mirror.ts` — флаг, адреса, маршруты, тексты

**Files:**
- Create: `lib/mirror.ts`
- Modify: `next.config.ts` (блок `env`)
- Test: `lib/mirror.test.ts`

**Interfaces:**
- Produces:
  - `IS_MIRROR: boolean`
  - `MAIN_SITE: string` (без завершающего `/`)
  - `MIRROR_SERVER_ROUTES: readonly string[]`
  - `isServerOnlyRoute(path: string): boolean` — `path` как из `usePathname()` (без basePath)
  - `mainSiteUrl(path: string): string`
  - `isPlatformApiUrl(url: string, origin: string): boolean`
  - `mirrorCanonicalScript(basePath: string, mainSite: string): string`
  - `MIRROR_COPY: Record<'banner' | 'bannerLink' | 'dismiss' | 'stubTitle' | 'stubBody' | 'stubLink' | 'stubHome' | 'formNote', { ru: string; en: string }>`
  - `mirrorLocale(path: string): 'ru' | 'en'`

- [ ] **Step 1: Write the failing test** — `lib/mirror.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import {
  IS_MIRROR, MAIN_SITE, isServerOnlyRoute, mainSiteUrl, isPlatformApiUrl,
  mirrorCanonicalScript, mirrorLocale, MIRROR_COPY,
} from './mirror'

describe('lib/mirror', () => {
  it('без COURSE_MIRROR зеркало выключено', () => {
    expect(IS_MIRROR).toBe(false)
  })
  it('основной сайт — из COURSE.domain, без слэша в конце', () => {
    expect(MAIN_SITE).toBe('https://ai.synergify.com')
  })
  it.each([
    ['/login/', true], ['/en/login/', true], ['/auth/verify/', true], ['/dashboard/', true],
    ['/en/dashboard/', true], ['/character/', true], ['/dungeon/', true], ['/quest-intake/', true],
    ['/certificate/', true], ['/certificate/verify/', true], ['/feedback/', true], ['/support/', true],
    ['/care/', true], ['/alumni/', true], ['/admin/leads/', true],
    ['/', false], ['/en/', false], ['/lessons/01-introduction/u1-activation/', false],
    ['/cheatsheet/', false], ['/ama/', false], ['/try/', false], ['/roadmap/', false], ['/careers/', false],
  ])('isServerOnlyRoute(%s) = %s', (path, expected) => {
    expect(isServerOnlyRoute(path)).toBe(expected)
  })
  it('mainSiteUrl ведёт на тот же путь основного сайта', () => {
    expect(mainSiteUrl('/en/dashboard/')).toBe('https://ai.synergify.com/en/dashboard/')
    expect(mainSiteUrl('login/')).toBe('https://ai.synergify.com/login/')
  })
  it.each([
    ['/api/auth/me', true],
    ['/ts-gitbook/api/progress/list', true],
    ['https://ai.synergify.com/api/academy/me', true],
    ['https://ai.synergify.com/lessons/x/', true],
    ['/lessons/01-introduction/u1-activation/', false],
    ['/ts-gitbook/_next/static/chunk.js', false],
    ['https://cdnjs.cloudflare.com/x.js', false],
  ])('isPlatformApiUrl(%s) = %s', (url, expected) => {
    expect(isPlatformApiUrl(url, 'https://master5d.github.io')).toBe(expected)
  })
  it('canonical-скрипт снимает basePath и ставит основной домен', () => {
    const js = mirrorCanonicalScript('/ts-gitbook', 'https://ai.synergify.com')
    const head = { children: [] as { rel: string; href: string }[] }
    const doc = {
      createElement: () => ({ rel: '', href: '' }),
      head: { appendChild: (el: { rel: string; href: string }) => head.children.push(el) },
    }
    new Function('location', 'document', js)({ pathname: '/ts-gitbook/en/lessons/x/' }, doc)
    expect(head.children).toEqual([{ rel: 'canonical', href: 'https://ai.synergify.com/en/lessons/x/' }])
  })
  it('язык по пути', () => {
    expect(mirrorLocale('/en/lessons/x/')).toBe('en')
    expect(mirrorLocale('/en')).toBe('en')
    expect(mirrorLocale('/lessons/x/')).toBe('ru')
  })
  it('у каждого текста есть RU и EN', () => {
    for (const [key, copy] of Object.entries(MIRROR_COPY)) {
      expect(copy.ru, key).toBeTruthy()
      expect(copy.en, key).toBeTruthy()
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/mirror.test.ts`
Expected: FAIL — `Cannot find module './mirror'`.

- [ ] **Step 3: Write minimal implementation** — `lib/mirror.ts`

```ts
// Режим зеркала курса (spec docs/superpowers/specs/2026-10-11-ts-gitbook-mirror-design.md).
// Зеркало на GitHub Pages — для тех, кому Cloudflare режут: ни одного запроса к API и основному
// домену. Флаг инлайнится на сборке (COURSE_MIRROR=1 → NEXT_PUBLIC_COURSE_MIRROR=1, next.config.ts).
import { COURSE } from './course'
import { PLATFORM_API } from './platform-api'

export const IS_MIRROR = process.env.NEXT_PUBLIC_COURSE_MIRROR === '1'

export const MAIN_SITE = COURSE.domain.replace(/\/$/, '')

// Маршруты, которым нужен сервер: в зеркале вместо них — заглушка со ссылкой на основной сайт.
export const MIRROR_SERVER_ROUTES = [
  'login', 'auth', 'dashboard', 'character', 'dungeon', 'quest-intake',
  'certificate', 'feedback', 'support', 'care', 'alumni', 'admin',
] as const

function stripLocale(path: string): string {
  return path.replace(/^\/en(?=\/|$)/, '') || '/'
}

export function isServerOnlyRoute(path: string): boolean {
  const first = stripLocale(path).split('/').filter(Boolean)[0] ?? ''
  return (MIRROR_SERVER_ROUTES as readonly string[]).includes(first)
}

export function mirrorLocale(path: string): 'ru' | 'en' {
  return /^\/en(\/|$)/.test(path) ? 'en' : 'ru'
}

export function mainSiteUrl(path: string): string {
  return `${MAIN_SITE}${path.startsWith('/') ? path : `/${path}`}`
}

/** URL уходит в платформенный API или на основной домен — в зеркале такой вызов не делается. */
export function isPlatformApiUrl(url: string, origin: string): boolean {
  try {
    const u = new URL(url, origin)
    const blocked = new Set([new URL(MAIN_SITE).origin, new URL(PLATFORM_API).origin])
    if (blocked.has(u.origin)) return true
    return u.origin === origin && /^(?:\/[^/]+)?\/api\//.test(u.pathname)
  } catch {
    return false
  }
}

/** Inline-скрипт: <link rel="canonical"> на тот же путь основного сайта (у статического экспорта один layout). */
export function mirrorCanonicalScript(basePath: string, mainSite: string): string {
  const bp = JSON.stringify(basePath)
  const site = JSON.stringify(mainSite)
  return `(function(){try{var p=location.pathname;var b=${bp};if(b&&p.indexOf(b)===0)p=p.slice(b.length)||'/';` +
    `var l=document.createElement('link');l.rel='canonical';l.href=${site}+p;document.head.appendChild(l);}catch(e){}})();`
}

export const MIRROR_COPY = {
  banner: {
    ru: 'Это зеркало курса для чтения. Вход, прогресс на сервере и сертификат — на основном сайте.',
    en: 'This is a read-only mirror of the course. Sign-in, server progress and the certificate live on the main site.',
  },
  bannerLink: { ru: 'Открыть на ai.synergify.com', en: 'Open on ai.synergify.com' },
  dismiss: { ru: 'Скрыть', en: 'Hide' },
  stubTitle: { ru: 'Это доступно на основном сайте', en: 'This is available on the main site' },
  stubBody: {
    ru: 'Зеркало показывает юниты, шпаргалку и материалы без входа. Для этой страницы нужен сервер курса.',
    en: 'The mirror shows units, the cheatsheet and materials without sign-in. This page needs the course server.',
  },
  stubLink: { ru: 'Перейти на основной сайт', en: 'Go to the main site' },
  stubHome: { ru: 'К программе курса', en: 'Back to the course' },
  formNote: {
    ru: 'Эта форма работает на основном сайте.',
    en: 'This form works on the main site.',
  },
} as const
```

And in `next.config.ts`, inside `env: { … }`, after `NEXT_PUBLIC_COURSE_BASE_PATH: BASE_PATH,` add:

```ts
    // Режим зеркала (GitHub Pages): COURSE_MIRROR=1 → lib/mirror.ts IS_MIRROR.
    NEXT_PUBLIC_COURSE_MIRROR: process.env.COURSE_MIRROR === '1' ? '1' : '',
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/mirror.test.ts`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/mirror.ts LMS/tochka-sborki/web/lib/mirror.test.ts LMS/tochka-sborki/web/next.config.ts
git commit -m "feat(mirror): lib/mirror — флаг COURSE_MIRROR, адреса основного сайта, серверные маршруты, тексты"
```

---

### Task 2: заглушка `fetch` в зеркале

**Files:**
- Create: `lib/mirror-fetch.ts`
- Test: `lib/mirror-fetch.test.ts`

**Interfaces:**
- Consumes: `isPlatformApiUrl(url, origin)` из Task 1
- Produces: `installMirrorFetchGuard(win: MirrorWindow): void`, `type MirrorWindow = { fetch: typeof fetch; location: { origin: string } }`

- [ ] **Step 1: Write the failing test** — `lib/mirror-fetch.test.ts`

```ts
import { describe, it, expect, vi } from 'vitest'
import { installMirrorFetchGuard } from './mirror-fetch'

function fakeWindow() {
  const real = vi.fn(async () => new Response('ok', { status: 200 }))
  const win = { fetch: real as unknown as typeof fetch, location: { origin: 'https://master5d.github.io' } }
  return { win, real }
}

describe('installMirrorFetchGuard', () => {
  it.each(['/api/auth/me', 'https://ai.synergify.com/api/progress/list', '/ts-gitbook/api/intake/me'])(
    '%s → 503 без сети', async (url) => {
      const { win, real } = fakeWindow()
      installMirrorFetchGuard(win)
      const res = await win.fetch(url, { credentials: 'include' })
      expect(res.status).toBe(503)
      expect(real).not.toHaveBeenCalled()
    })
  it('Request и URL тоже перехватываются', async () => {
    const { win, real } = fakeWindow()
    installMirrorFetchGuard(win)
    expect((await win.fetch(new URL('https://ai.synergify.com/api/x'))).status).toBe(503)
    expect((await win.fetch(new Request('https://ai.synergify.com/api/y'))).status).toBe(503)
    expect(real).not.toHaveBeenCalled()
  })
  it('остальное идёт в настоящий fetch', async () => {
    const { win, real } = fakeWindow()
    installMirrorFetchGuard(win)
    const res = await win.fetch('/ts-gitbook/lessons/x/index.txt')
    expect(res.status).toBe(200)
    expect(real).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/mirror-fetch.test.ts`
Expected: FAIL — `Cannot find module './mirror-fetch'`.

- [ ] **Step 3: Write minimal implementation** — `lib/mirror-fetch.ts`

```ts
// Первый слой зеркала: вызов к API или основному домену получает мгновенный 503, сеть не трогается.
// Почти все вызывающие уже понимают отказ (!r.ok / catch) и деградируют; где отказ ломает работу —
// явные ветки IS_MIRROR (защиты, прогресс, nav, формы). Ставится в components/mirror-shell.tsx.
import { isPlatformApiUrl } from './mirror'

export type MirrorWindow = { fetch: typeof fetch; location: { origin: string } }

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

export function installMirrorFetchGuard(win: MirrorWindow): void {
  const original = win.fetch.bind(win)
  win.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (isPlatformApiUrl(urlOf(input), win.location.origin)) {
      return Promise.resolve(new Response(null, { status: 503, statusText: 'mirror' }))
    }
    return original(input, init)
  }) as typeof fetch
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/mirror-fetch.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/mirror-fetch.ts LMS/tochka-sborki/web/lib/mirror-fetch.test.ts
git commit -m "feat(mirror): заглушка fetch — API и основной домен получают 503 без сети"
```

---

### Task 3: защиты уроков пропускают в зеркале

**Files:**
- Modify: `components/auth-guard.tsx`, `components/intake-guard.tsx`, `components/mobile-gate.tsx`, `components/admission-guard.tsx`
- Test: `lib/mirror-guards.mirror.test.tsx`, `lib/mirror-guards.main.test.tsx`

**Interfaces:**
- Consumes: `IS_MIRROR` из Task 1
- Produces: те же экспорты `AuthGuard`, `IntakeGuard`, `MobileGate`, `AdmissionGuard` (сигнатуры не меняются); прежние реализации переименованы в `AuthGuardLive`, `IntakeGuardLive`, `MobileGateLive`, `AdmissionGuardLive` (не экспортируются).

- [ ] **Step 1: Write the failing tests**

`lib/mirror-guards.mirror.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/lib/mirror', async (orig) => ({ ...(await orig<typeof import('@/lib/mirror')>()), IS_MIRROR: true }))

import { AuthGuard } from '../components/auth-guard'
import { IntakeGuard } from '../components/intake-guard'
import { MobileGate } from '../components/mobile-gate'
import { AdmissionGuard } from '../components/admission-guard'

describe('защиты в зеркале', () => {
  it.each([
    ['AuthGuard', AuthGuard], ['IntakeGuard', IntakeGuard], ['MobileGate', MobileGate], ['AdmissionGuard', AdmissionGuard],
  ] as const)('%s сразу отдаёт содержимое', (_name, Guard) => {
    const html = renderToStaticMarkup(<Guard locale="ru"><p>UNIT-BODY</p></Guard>)
    expect(html).toBe('<p>UNIT-BODY</p>')
  })
})
```

`lib/mirror-guards.main.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AuthGuard } from '../components/auth-guard'
import { IntakeGuard } from '../components/intake-guard'

// Основная сборка: без сессии содержимое не отдаётся до проверки (эффекты в статическом рендере не идут).
describe('защиты в основной сборке', () => {
  it('AuthGuard прячет содержимое до проверки', () => {
    expect(renderToStaticMarkup(<AuthGuard locale="ru"><p>UNIT-BODY</p></AuthGuard>)).not.toContain('UNIT-BODY')
  })
  it('IntakeGuard прячет содержимое до проверки', () => {
    expect(renderToStaticMarkup(<IntakeGuard locale="ru"><p>UNIT-BODY</p></IntakeGuard>)).not.toContain('UNIT-BODY')
  })
})
```

- [ ] **Step 2: Run tests to verify the mirror test fails**

Run: `npx vitest run lib/mirror-guards.mirror.test.tsx lib/mirror-guards.main.test.tsx`
Expected: mirror test FAIL for AuthGuard/IntakeGuard/AdmissionGuard (содержимое не отдано); main test PASS.

- [ ] **Step 3: Implement — wrapper pattern in each of the four files**

`components/auth-guard.tsx`: rename `export function AuthGuard(` → `function AuthGuardLive(`, add import and wrapper:

```tsx
import { IS_MIRROR } from '@/lib/mirror'

// Зеркало (GitHub Pages): входа нет, юниты открыты — см. lib/mirror.ts.
export function AuthGuard(props: { children: React.ReactNode; locale?: Locale }) {
  if (IS_MIRROR) return <>{props.children}</>
  return <AuthGuardLive {...props} />
}
```

`components/intake-guard.tsx`: same — `export function IntakeGuard(` → `function IntakeGuardLive(`, plus:

```tsx
import { IS_MIRROR } from '@/lib/mirror'

export function IntakeGuard(props: { children: React.ReactNode; locale?: Locale }) {
  if (IS_MIRROR) return <>{props.children}</>
  return <IntakeGuardLive {...props} />
}
```

`components/mobile-gate.tsx`: `export function MobileGate(` → `function MobileGateLive(`, plus:

```tsx
import { IS_MIRROR } from '@/lib/mirror'

export function MobileGate(props: Props) {
  if (IS_MIRROR) return <>{props.children}</>
  return <MobileGateLive {...props} />
}
```

`components/admission-guard.tsx`: `export function AdmissionGuard(` → `function AdmissionGuardLive(`, plus:

```tsx
import { IS_MIRROR } from '@/lib/mirror'

export function AdmissionGuard(props: { children: React.ReactNode; locale?: Locale }) {
  if (IS_MIRROR) return <>{props.children}</>
  return <AdmissionGuardLive {...props} />
}
```

(Wrappers have no hooks, so the early return is legal; the Live components keep their hooks unconditional.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/mirror-guards.mirror.test.tsx lib/mirror-guards.main.test.tsx`
Expected: PASS (both files).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/components/auth-guard.tsx LMS/tochka-sborki/web/components/intake-guard.tsx LMS/tochka-sborki/web/components/mobile-gate.tsx LMS/tochka-sborki/web/components/admission-guard.tsx LMS/tochka-sborki/web/lib/mirror-guards.mirror.test.tsx LMS/tochka-sborki/web/lib/mirror-guards.main.test.tsx
git commit -m "feat(mirror): защиты уроков (вход, intake, мобильный гейт, допуск) пропускают в зеркале"
```

---

### Task 4: прогресс в зеркале — только браузер

**Files:**
- Create: `lib/mirror-progress.ts`
- Modify: `components/progress-provider.tsx`
- Test: `lib/mirror-progress.test.ts`

**Interfaces:**
- Consumes: `IS_MIRROR` (Task 1)
- Produces:
  - `MIRROR_PROGRESS_KEY = 'mirror_lesson_progress'`
  - `type LessonStateMap = Record<string, 'viewed' | 'completed'>`
  - `parseLessonProgress(raw: string | null): LessonStateMap`
  - `nextLessonState(map: LessonStateMap, slug: string, to: 'viewed' | 'completed'): LessonStateMap`
  - `loadLessonProgress(storage: Pick<Storage, 'getItem'> | null): LessonStateMap`
  - `saveLessonProgress(storage: Pick<Storage, 'setItem'> | null, map: LessonStateMap): void`
  - `ProgressProvider` / `useProgress` — прежний интерфейс; прежняя реализация → `LiveProgressProvider` (не экспортируется).

(Прогресс по юнитам в UI уже живёт в `localStorage` через `lib/unit-progress.ts` — его не трогаем. `ProgressProvider` отвечает за уровень «страница модуля / сайдбар».)

- [ ] **Step 1: Write the failing test** — `lib/mirror-progress.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import {
  MIRROR_PROGRESS_KEY, parseLessonProgress, nextLessonState, loadLessonProgress, saveLessonProgress,
} from './mirror-progress'

describe('mirror-progress', () => {
  it('разбирает валидное и чинит мусор', () => {
    expect(parseLessonProgress('{"a":"viewed","b":"completed"}')).toEqual({ a: 'viewed', b: 'completed' })
    expect(parseLessonProgress('{"a":"weird","b":1}')).toEqual({})
    expect(parseLessonProgress('[1,2]')).toEqual({})
    expect(parseLessonProgress('{oops')).toEqual({})
    expect(parseLessonProgress(null)).toEqual({})
  })
  it('viewed не понижает completed, completed — всегда', () => {
    expect(nextLessonState({ a: 'completed' }, 'a', 'viewed')).toEqual({ a: 'completed' })
    expect(nextLessonState({}, 'a', 'viewed')).toEqual({ a: 'viewed' })
    expect(nextLessonState({ a: 'viewed' }, 'a', 'completed')).toEqual({ a: 'completed' })
  })
  it('хранилище бросает — не падаем', () => {
    const throwing = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('denied') } }
    expect(loadLessonProgress(throwing)).toEqual({})
    expect(() => saveLessonProgress(throwing, { a: 'viewed' })).not.toThrow()
    expect(loadLessonProgress(null)).toEqual({})
  })
  it('пишет и читает под своим ключом', () => {
    const store = new Map<string, string>()
    const s = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v) } }
    saveLessonProgress(s, { 'x/y': 'completed' })
    expect([...store.keys()]).toEqual([MIRROR_PROGRESS_KEY])
    expect(loadLessonProgress(s)).toEqual({ 'x/y': 'completed' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/mirror-progress.test.ts`
Expected: FAIL — `Cannot find module './mirror-progress'`.

- [ ] **Step 3: Implement**

`lib/mirror-progress.ts`:

```ts
// Прогресс страниц курса в зеркале — только браузер (spec п. 2). Ключ свой, не пересекается с RPG-ключами.
export const MIRROR_PROGRESS_KEY = 'mirror_lesson_progress'

export type LessonStateMap = Record<string, 'viewed' | 'completed'>

export function parseLessonProgress(raw: string | null): LessonStateMap {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: LessonStateMap = {}
    for (const [slug, state] of Object.entries(parsed as Record<string, unknown>)) {
      if (state === 'viewed' || state === 'completed') out[slug] = state
    }
    return out
  } catch {
    return {}
  }
}

export function nextLessonState(map: LessonStateMap, slug: string, to: 'viewed' | 'completed'): LessonStateMap {
  if (to === 'viewed' && map[slug]) return map
  return { ...map, [slug]: to }
}

export function loadLessonProgress(storage: Pick<Storage, 'getItem'> | null): LessonStateMap {
  try {
    return parseLessonProgress(storage?.getItem(MIRROR_PROGRESS_KEY) ?? null)
  } catch {
    return {}
  }
}

export function saveLessonProgress(storage: Pick<Storage, 'setItem'> | null, map: LessonStateMap): void {
  try {
    storage?.setItem(MIRROR_PROGRESS_KEY, JSON.stringify(map))
  } catch {
    // приватный режим / квота — прогресс просто не сохранится
  }
}
```

`components/progress-provider.tsx`: rename `export function ProgressProvider(` → `function LiveProgressProvider(`; add imports and at the end of the file:

```tsx
import { IS_MIRROR } from '@/lib/mirror'
import { loadLessonProgress, nextLessonState, saveLessonProgress, type LessonStateMap } from '@/lib/mirror-progress'

function browserStorage(): Storage | null {
  try { return typeof window === 'undefined' ? null : window.localStorage } catch { return null }
}

function MirrorProgressProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<LessonStateMap>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setMap(loadLessonProgress(browserStorage()))
    setLoaded(true)
  }, [])

  const update = useCallback((slug: string, to: 'viewed' | 'completed') => {
    setMap(prev => {
      const next = nextLessonState(prev, slug, to)
      if (next !== prev) saveLessonProgress(browserStorage(), next)
      return next
    })
  }, [])

  const markViewed = useCallback(async (slug: string) => { update(slug, 'viewed') }, [update])
  const markCompleted = useCallback(async (slug: string) => { update(slug, 'completed') }, [update])
  const getState = useCallback((slug: string): ProgressState => map[slug] ?? 'none', [map])

  return (
    <ProgressContext.Provider value={{ getState, markViewed, markCompleted, loaded, authed: false }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  return IS_MIRROR
    ? <MirrorProgressProvider>{children}</MirrorProgressProvider>
    : <LiveProgressProvider>{children}</LiveProgressProvider>
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/mirror-progress.test.ts`
Expected: PASS. Then `npx tsc --noEmit` — без ошибок.

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/mirror-progress.ts LMS/tochka-sborki/web/lib/mirror-progress.test.ts LMS/tochka-sborki/web/components/progress-provider.tsx
git commit -m "feat(mirror): прогресс страниц в зеркале — localStorage, без /api/progress"
```

---

### Task 5: оболочка зеркала — плашка, заглушка серверных страниц, layout, SEO

**Files:**
- Create: `components/mirror-shell.tsx`, `components/mirror-stub.tsx`
- Modify: `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`
- Test: `lib/mirror-shell.mirror.test.tsx`, `lib/mirror-shell.main.test.tsx`

**Interfaces:**
- Consumes: Task 1 (`IS_MIRROR`, `isServerOnlyRoute`, `mainSiteUrl`, `mirrorLocale`, `MIRROR_COPY`, `mirrorCanonicalScript`, `MAIN_SITE`), Task 2 (`installMirrorFetchGuard`), `BASE_PATH` из `lib/base-path.ts`
- Produces:
  - `MirrorShell({ children })` — client
  - `MirrorStub({ pathname, locale })`, `MirrorFormNote({ pathname, locale })` — разметка с `data-mirror-stub` / `data-mirror-form-note`
  - плашка с атрибутом `data-mirror-banner` (на неё опирается Task 7)

- [ ] **Step 1: Write the failing tests**

`lib/mirror-shell.mirror.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

let currentPath = '/'
vi.mock('next/navigation', () => ({ usePathname: () => currentPath }))
vi.mock('@/lib/mirror', async (orig) => ({ ...(await orig<typeof import('@/lib/mirror')>()), IS_MIRROR: true }))

import { MirrorShell } from '../components/mirror-shell'

const render = (path: string) => {
  currentPath = path
  return renderToStaticMarkup(<MirrorShell><main>PAGE-BODY</main></MirrorShell>)
}

describe('MirrorShell в зеркале', () => {
  beforeEach(() => { currentPath = '/' })
  it('юнит: плашка + содержимое', () => {
    const html = render('/lessons/01-introduction/u1-activation/')
    expect(html).toContain('data-mirror-banner')
    expect(html).toContain('PAGE-BODY')
    expect(html).toContain('https://ai.synergify.com/lessons/01-introduction/u1-activation/')
  })
  it('серверный маршрут: заглушка вместо содержимого', () => {
    const html = render('/login/')
    expect(html).toContain('data-mirror-stub')
    expect(html).not.toContain('PAGE-BODY')
    expect(html).toContain('href="https://ai.synergify.com/login/"')
    expect(html).toContain('Это доступно на основном сайте')
  })
  it('английский серверный маршрут — заглушка на английском', () => {
    const html = render('/en/dashboard/')
    expect(html).toContain('This is available on the main site')
    expect(html).toContain('href="https://ai.synergify.com/en/dashboard/"')
  })
})
```

`lib/mirror-shell.main.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({ usePathname: () => '/login/' }))

import { MirrorShell } from '../components/mirror-shell'

describe('MirrorShell в основной сборке', () => {
  it('ничего не добавляет и ничего не прячет', () => {
    expect(renderToStaticMarkup(<MirrorShell><main>PAGE-BODY</main></MirrorShell>)).toBe('<main>PAGE-BODY</main>')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/mirror-shell.mirror.test.tsx lib/mirror-shell.main.test.tsx`
Expected: FAIL — `Cannot find module '../components/mirror-shell'`.

- [ ] **Step 3: Implement components**

`components/mirror-stub.tsx`:

```tsx
import Link from 'next/link'
import { MIRROR_COPY, mainSiteUrl } from '@/lib/mirror'

type Locale = 'ru' | 'en'

export function MirrorStub({ pathname, locale }: { pathname: string; locale: Locale }) {
  return (
    <main data-mirror-stub style={{ maxWidth: 640, margin: '4rem auto', padding: '0 1rem', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: '1.5rem' }}>{MIRROR_COPY.stubTitle[locale]}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>{MIRROR_COPY.stubBody[locale]}</p>
      <p><a href={mainSiteUrl(pathname)}>{MIRROR_COPY.stubLink[locale]}</a></p>
      <p><Link href={locale === 'en' ? '/en/roadmap/' : '/roadmap/'}>{MIRROR_COPY.stubHome[locale]}</Link></p>
    </main>
  )
}

export function MirrorFormNote({ pathname, locale }: { pathname: string; locale: Locale }) {
  return (
    <p data-mirror-form-note style={{ color: 'var(--text-secondary)' }}>
      {MIRROR_COPY.formNote[locale]}{' '}
      <a href={mainSiteUrl(pathname)}>{MIRROR_COPY.bannerLink[locale]}</a>
    </p>
  )
}
```

`components/mirror-shell.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { IS_MIRROR, MIRROR_COPY, isServerOnlyRoute, mainSiteUrl, mirrorLocale } from '@/lib/mirror'
import { installMirrorFetchGuard } from '@/lib/mirror-fetch'
import { MirrorStub } from './mirror-stub'

// Ставится при загрузке модуля — раньше любых эффектов страницы.
if (IS_MIRROR && typeof window !== 'undefined') installMirrorFetchGuard(window)

const DISMISS_KEY = 'mirror_banner_dismissed'

function MirrorBanner({ pathname, locale }: { pathname: string; locale: 'ru' | 'en' }) {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    try { setHidden(localStorage.getItem(DISMISS_KEY) === '1') } catch { /* приватный режим */ }
  }, [])
  if (hidden) return null
  return (
    <div data-mirror-banner role="note" style={{
      padding: '0.5rem 1rem', fontSize: '0.85rem', textAlign: 'center',
      background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)',
    }}>
      {MIRROR_COPY.banner[locale]}{' '}
      <a href={mainSiteUrl(pathname)}>{MIRROR_COPY.bannerLink[locale]}</a>{' '}
      <button type="button" onClick={() => {
        setHidden(true)
        try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* приватный режим */ }
      }} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
        {MIRROR_COPY.dismiss[locale]}
      </button>
    </div>
  )
}

export function MirrorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/'
  if (!IS_MIRROR) return <>{children}</>
  const locale = mirrorLocale(pathname)
  return (
    <>
      <MirrorBanner pathname={pathname} locale={locale} />
      {isServerOnlyRoute(pathname) ? <MirrorStub pathname={pathname} locale={locale} /> : children}
    </>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/mirror-shell.mirror.test.tsx lib/mirror-shell.main.test.tsx`
Expected: PASS.

- [ ] **Step 5: Wire into layout, robots, sitemap**

`app/layout.tsx`:
1. Imports: `import { MirrorShell } from '@/components/mirror-shell'`, `import { IS_MIRROR, MAIN_SITE, mirrorCanonicalScript } from '@/lib/mirror'`, `import { BASE_PATH } from '@/lib/base-path'`.
2. In `metadata`, after `openGraph: …,` add: `...(IS_MIRROR ? { robots: { index: false, follow: false } } : {}),`
3. In `<head>`: replace the Telegram `<Script …/>` line with
   ```tsx
   {/* telegram.org в РФ режут — в зеркале скрипт не грузим, иначе beforeInteractive вешает страницу. */}
   {!IS_MIRROR && <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />}
   {IS_MIRROR && <script dangerouslySetInnerHTML={{ __html: mirrorCanonicalScript(BASE_PATH, MAIN_SITE) }} />}
   ```
4. In `<body>`: `<TelegramAuthBridge />` → `{!IS_MIRROR && <TelegramAuthBridge />}`; `{children}` → `<MirrorShell>{children}</MirrorShell>`.

`app/robots.ts` — first line of `robots()`:

```ts
  // Зеркало: robots.txt в подпути краулеры не читают — настоящая защита от дубля — meta noindex в layout.
  if (IS_MIRROR) return { rules: { userAgent: '*', disallow: '/' } }
```
(plus `import { IS_MIRROR } from '@/lib/mirror'`).

`app/sitemap.ts` — first line of the default export function: `if (IS_MIRROR) return []` (plus the import).

- [ ] **Step 6: Run full checks**

Run: `npm test` → all green; `npx tsc --noEmit` → no errors.
Then a mirror build smoke: `COURSE_MIRROR=1 COURSE_BASE_PATH=/ts-gitbook npm run build` (PowerShell: `$env:COURSE_MIRROR='1'; $env:COURSE_BASE_PATH='/ts-gitbook'; npm run build`) → build succeeds; `grep -c "data-mirror-stub" out/login/index.html` → `1`; `grep -c "data-mirror-banner" out/lessons/01-introduction/u1-activation/index.html` → `1`; `grep -c "telegram.org" out/index.html` → `0`. Then restore the normal build env (unset both variables).

- [ ] **Step 7: Commit**

```bash
git add LMS/tochka-sborki/web/components/mirror-shell.tsx LMS/tochka-sborki/web/components/mirror-stub.tsx LMS/tochka-sborki/web/app/layout.tsx LMS/tochka-sborki/web/app/robots.ts LMS/tochka-sborki/web/app/sitemap.ts LMS/tochka-sborki/web/lib/mirror-shell.mirror.test.tsx LMS/tochka-sborki/web/lib/mirror-shell.main.test.tsx
git commit -m "feat(mirror): оболочка — плашка, заглушка серверных страниц, noindex+canonical, без telegram-скрипта"
```

---

### Task 6: открытые страницы — nav, формы и гвард покрытия API

**Files:**
- Modify: `components/nav.tsx`, `components/capture-form.tsx`, `components/module-survey.tsx`
- Create: `lib/mirror-coverage.test.ts`

**Interfaces:**
- Consumes: `IS_MIRROR` (Task 1), `MirrorFormNote` (Task 5)
- Produces: `CaptureForm`, `ModuleSurvey` — прежние сигнатуры; реализации → `CaptureFormLive`, `ModuleSurveyLive`.

- [ ] **Step 1: Write the failing coverage guard** — `lib/mirror-coverage.test.ts`

```ts
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
  'components/care/care-form.tsx': { kind: 'route-stubbed' },
  'lib/login-flow.ts': { kind: 'route-stubbed' },
  'lib/auth-check.ts': { kind: 'fails-soft', why: 'зовёт только AuthGuard, а он в зеркале не проверяет' },
  'lib/platform-api.ts': { kind: 'fails-soft', why: 'объявление адреса, сам вызовов не делает' },
  'components/hero-secondary-cta.tsx': { kind: 'fails-soft', why: '/api/auth/me → 503 → показывает CTA для гостя' },
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
```

- [ ] **Step 2: Run to verify it fails, reconcile the inventory**

Run: `npx vitest run lib/mirror-coverage.test.ts`
Expected: FAIL on «branch-файлы … ветвятся» for `nav.tsx`, `capture-form.tsx`, `module-survey.tsx` (ветки ещё нет). If the first test lists files «не разобраны» or «больше не трогают» — the inventory drifted since 2026-10-11: open each listed file, classify it by the rules in the test header (for `fails-soft`, read the call site and confirm it handles `!r.ok`/`catch`; if it doesn't — make it `branch`), and edit `SURFACES` accordingly.

- [ ] **Step 3: Implement the three branches**

`components/nav.tsx`: add `import { IS_MIRROR } from '@/lib/mirror'`. In the JSX, the auth block is the ternary that starts with `{email ? (` and ends after the login `<Link …>{t.nav.login}</Link>` branch. Wrap the whole ternary:

```tsx
        {/* Зеркало: входа нет — ни e-mail, ни кнопки «Войти». */}
        {!IS_MIRROR && (email ? (
          /* …existing email branch unchanged… */
        ) : (
          /* …existing login-link branch unchanged… */
        ))}
```

and in the first `useEffect`, guard the network call: `if (!IS_MIRROR) fetch('/api/auth/me', …)…` (keep the `.then/.catch` chain inside the `if`).

`components/capture-form.tsx`: rename `export function CaptureForm(` → `function CaptureFormLive(`; add:

```tsx
import { usePathname } from 'next/navigation'
import { IS_MIRROR } from '@/lib/mirror'
import { MirrorFormNote } from './mirror-stub'

export function CaptureForm(props: { config: CaptureFormConfig; locale?: Locale }) {
  const pathname = usePathname() || '/'
  if (IS_MIRROR) return <MirrorFormNote pathname={pathname} locale={props.locale === 'en' ? 'en' : 'ru'} />
  return <CaptureFormLive {...props} />
}
```

`components/module-survey.tsx`: rename `export function ModuleSurvey(` → `function ModuleSurveyLive(`; add:

```tsx
import { usePathname } from 'next/navigation'
import { IS_MIRROR } from '@/lib/mirror'
import { MirrorFormNote } from './mirror-stub'

export function ModuleSurvey(props: { module: string; locale?: Locale }) {
  const pathname = usePathname() || '/'
  if (IS_MIRROR) return <MirrorFormNote pathname={pathname} locale={props.locale === 'en' ? 'en' : 'ru'} />
  return <ModuleSurveyLive {...props} />
}
```

(`usePathname` is called unconditionally before the branch, so hook order is stable.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/mirror-coverage.test.ts` → PASS; `npm test` → all green; `npx tsc --noEmit` → no errors.

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/components/nav.tsx LMS/tochka-sborki/web/components/capture-form.tsx LMS/tochka-sborki/web/components/module-survey.tsx LMS/tochka-sborki/web/lib/mirror-coverage.test.ts
git commit -m "feat(mirror): nav без входа, формы — ссылка на основной сайт; гвард: каждый файл с API разобран для зеркала"
```

---

### Task 7: проверка готовой сборки зеркала

**Files:**
- Create: `scripts/check-mirror.mjs`
- Modify: `package.json` (script `check:mirror`)
- Test: `lib/check-mirror.test.ts`

**Interfaces:**
- Consumes: маркеры `data-mirror-banner`, `data-mirror-stub` (Task 5), `MIRROR_SERVER_ROUTES` (Task 1, список повторён в скрипте — `.mjs` не импортирует TS)
- Produces: `checkMirror(outDir: string, basePath: string): string[]` (список нарушений, пустой — чисто); CLI `node scripts/check-mirror.mjs <outDir> <basePath>` → exit 1 при нарушениях

- [ ] **Step 1: Write the failing test** — `lib/check-mirror.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
// @ts-expect-error — .mjs без типов
import { checkMirror } from '../scripts/check-mirror.mjs'

const GOOD_HEAD = '<meta name="robots" content="noindex, nofollow"/>'
const page = (body: string, head = GOOD_HEAD) => `<html><head>${head}</head><body><div data-mirror-banner></div>${body}</body></html>`

function fixture(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'mirror-'))
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(join(dir, rel, '..'), { recursive: true })
    writeFileSync(join(dir, rel), content)
  }
  return dir
}

describe('checkMirror', () => {
  it('чистая сборка — нарушений нет', () => {
    const dir = fixture({
      'index.html': page('<a href="/ts-gitbook/roadmap/">x</a><script src="/ts-gitbook/_next/a.js"></script>'),
      'login/index.html': page('<main data-mirror-stub></main>'),
    })
    expect(checkMirror(dir, '/ts-gitbook')).toEqual([])
  })
  it('ловит ссылку без префикса, нет noindex, нет плашки, telegram, sitemap, серверную страницу без заглушки', () => {
    const dir = fixture({
      'index.html': page('<a href="/roadmap/">x</a><script src="https://telegram.org/js/telegram-web-app.js"></script>', ''),
      'cheatsheet/index.html': '<html><head>' + GOOD_HEAD + '</head><body>no banner</body></html>',
      'dashboard/index.html': page('<main>secret</main>'),
      'sitemap.xml': '<urlset/>',
    })
    const issues = checkMirror(dir, '/ts-gitbook').join('\n')
    expect(issues).toMatch(/index\.html: ссылка без префикса: \/roadmap\//)
    expect(issues).toMatch(/index\.html: нет noindex/)
    expect(issues).toMatch(/cheatsheet\/index\.html: нет плашки зеркала/)
    expect(issues).toMatch(/index\.html: telegram\.org/)
    expect(issues).toMatch(/sitemap\.xml/)
    expect(issues).toMatch(/dashboard\/index\.html: серверная страница без заглушки/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/check-mirror.test.ts`
Expected: FAIL — cannot find `../scripts/check-mirror.mjs`.

- [ ] **Step 3: Implement** — `scripts/check-mirror.mjs`

```js
#!/usr/bin/env node
// Проверка готовой сборки зеркала (spec «Проверка» п. 2). Использование: node scripts/check-mirror.mjs out /ts-gitbook
// Exit 0 — чисто, 1 — нарушения (печатаются), 2 — неверный вызов.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// Повтор lib/mirror.ts MIRROR_SERVER_ROUTES (.mjs не импортирует TS) — держать в синхроне.
const SERVER_ROUTES = ['login', 'auth', 'dashboard', 'character', 'dungeon', 'quest-intake',
  'certificate', 'feedback', 'support', 'care', 'alumni', 'admin']

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? htmlFiles(p) : name.endsWith('.html') ? [p] : []
  })
}

export function checkMirror(outDir, basePath) {
  const issues = []
  if (existsSync(join(outDir, 'sitemap.xml'))) issues.push('sitemap.xml: в зеркале публиковаться не должен')
  for (const file of htmlFiles(outDir)) {
    const rel = relative(outDir, file).split(sep).join('/')
    const html = readFileSync(file, 'utf8')
    if (!/<meta name="robots" content="noindex/.test(html)) issues.push(`${rel}: нет noindex`)
    if (/telegram\.org/.test(html)) issues.push(`${rel}: telegram.org (в РФ режут, вешает загрузку)`)
    const isNotFound = rel === '404.html' || rel.startsWith('_not-found')
    if (!isNotFound && !html.includes('data-mirror-banner')) issues.push(`${rel}: нет плашки зеркала`)
    const first = rel.replace(/^en\//, '').split('/')[0]
    if (SERVER_ROUTES.includes(first) && !html.includes('data-mirror-stub')) {
      issues.push(`${rel}: серверная страница без заглушки`)
    }
    for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
      const url = m[1]
      if (url.startsWith('//')) continue
      if (!url.startsWith(`${basePath}/`) && url !== basePath) issues.push(`${rel}: ссылка без префикса: ${url}`)
    }
  }
  return issues
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [outDir, basePath] = process.argv.slice(2)
  if (!outDir || !basePath) { console.error('usage: check-mirror.mjs <outDir> <basePath>'); process.exit(2) }
  const issues = checkMirror(outDir, basePath)
  if (issues.length) {
    console.error(`check-mirror: ${issues.length} нарушений`)
    for (const i of issues.slice(0, 200)) console.error('  ' + i)
    process.exit(1)
  }
  console.log('check-mirror: чисто')
}
```

`package.json` → `"scripts"`: add `"check:mirror": "node scripts/check-mirror.mjs out /ts-gitbook"`.

- [ ] **Step 4: Run tests, then the real build**

Run: `npx vitest run lib/check-mirror.test.ts` → PASS.
Then: mirror build (Task 5 Step 6 env) and `npm run check:mirror` → `check-mirror: чисто`, exit 0. Every reported issue is a real defect: fix the source (e.g., a raw `href="/…"` → `pagePath(…)` or `next/link`), not the checker. Restore the normal env after.

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/scripts/check-mirror.mjs LMS/tochka-sborki/web/lib/check-mirror.test.ts LMS/tochka-sborki/web/package.json
git commit -m "feat(mirror): check-mirror — префикс ссылок, noindex, плашка, заглушки, без telegram и sitemap"
```

---

### Task 8: ссылка на зеркало с основного сайта (u3, блок «Россия»)

**Files:**
- Modify: `packs/tochka-sborki/content/ru/03-stack-selection/u3-behind-gfw.mdx`, `packs/tochka-sborki/content/en/03-stack-selection/u3-behind-gfw.mdx`
- Regenerate: `packs/tochka-sborki/views/{ru,en}/03-stack-selection/u3-behind-gfw.json`

**Interfaces:** none (content).

- [ ] **Step 1: Edit RU** — right after the paragraph that ends with «если юнит открылся не целиком, причина та же.» insert a new paragraph:

```markdown
Если курс открывается не целиком, попробуй зеркало на GitHub: [master5d.github.io/ts-gitbook](https://master5d.github.io/ts-gitbook/) — те же юниты для чтения, без входа и сертификата.
```

- [ ] **Step 2: Edit EN** — right after the paragraph that ends with «if a unit opened only partly, that's the same cause.» insert:

```markdown
If the course doesn't load fully, try the mirror on GitHub: [master5d.github.io/ts-gitbook](https://master5d.github.io/ts-gitbook/) — the same units, read-only, without sign-in or the certificate.
```

- [ ] **Step 3: Regenerate views and verify**

Run: `node scripts/gen-lesson-views.ts tochka-sborki 03-stack-selection --paraphrase` → rc 0. Keep only `views/{ru,en}/03-stack-selection/u3-behind-gfw.json` changes: `git restore` any other modified view file, delete any new untracked `u5-migrate.json`. Then `npm test` → all green (glossary, links, mdx-compile).

- [ ] **Step 4: Commit**

```bash
git add LMS/tochka-sborki/web/packs/tochka-sborki/content/ru/03-stack-selection/u3-behind-gfw.mdx LMS/tochka-sborki/web/packs/tochka-sborki/content/en/03-stack-selection/u3-behind-gfw.mdx LMS/tochka-sborki/web/packs/tochka-sborki/views/ru/03-stack-selection/u3-behind-gfw.json LMS/tochka-sborki/web/packs/tochka-sborki/views/en/03-stack-selection/u3-behind-gfw.json
git commit -m "content(03/u3): ссылка на зеркало курса на GitHub Pages для тех, у кого курс грузится не целиком"
```

---

### Task 9: публикация — репо `ts-gitbook`, ключ, задача `deploy-mirror`, первый деплой

> Шаги 1 и 4–6 делает **контроллер** (нужен `gh` владельца и внешние действия), не субагент.

**Files:**
- Modify: `.github/workflows/deploy.yml` (repo root)

**Interfaces:**
- Consumes: Task 5–7 (`npm run build` с флагами, `scripts/check-mirror.mjs`)
- Produces: задача `deploy-mirror`; секрет `TS_GITBOOK_DEPLOY_KEY` в `master5d/synergify-platform`; репо `master5d/ts-gitbook` с Pages из `gh-pages`.

- [ ] **Step 1 (controller): create the repo and the key** (temp dir = session scratchpad; the key never printed)

```bash
gh repo create master5d/ts-gitbook --public --add-readme \
  --description "Зеркало курса «Точка Сборки» для чтения. Основной сайт: https://ai.synergify.com"
K="$SCRATCH/ts_gitbook_key"
ssh-keygen -q -t ed25519 -N "" -C "synergify-platform deploy-mirror" -f "$K"
gh repo deploy-key add "$K.pub" -R master5d/ts-gitbook --allow-write --title "synergify-platform deploy-mirror"
gh secret set TS_GITBOOK_DEPLOY_KEY -R master5d/synergify-platform < "$K"
rm -f "$K" "$K.pub"
gh secret list -R master5d/synergify-platform | grep -c TS_GITBOOK_DEPLOY_KEY   # → 1
```

- [ ] **Step 2: Add the job** — in `.github/workflows/deploy.yml`, after the `deploy-web` job, add:

```yaml
  # ── master5d.github.io/ts-gitbook (зеркало для чтения, spec 2026-10-11) ──
  deploy-mirror:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: LMS/tochka-sborki/web/package-lock.json
      - name: Install
        working-directory: LMS/tochka-sborki/web
        run: npm ci
      - name: Test
        working-directory: LMS/tochka-sborki/web
        run: npm test
      - name: Build (mirror)
        working-directory: LMS/tochka-sborki/web
        env:
          COURSE_MIRROR: '1'
          COURSE_BASE_PATH: /ts-gitbook
        run: npm run build
      - name: Check mirror
        working-directory: LMS/tochka-sborki/web
        run: npm run check:mirror
      - name: Publish to master5d/ts-gitbook (gh-pages)
        working-directory: LMS/tochka-sborki/web/out
        env:
          DEPLOY_KEY: ${{ secrets.TS_GITBOOK_DEPLOY_KEY }}
        run: |
          set -euo pipefail
          touch .nojekyll
          install -m 700 -d ~/.ssh
          printf '%s\n' "$DEPLOY_KEY" > ~/.ssh/ts_gitbook
          chmod 600 ~/.ssh/ts_gitbook
          # Ключ хоста GitHub — опубликованный, не ssh-keyscan (без доверия первому ответу).
          echo 'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl' > ~/.ssh/known_hosts
          # Свежий репо из одной сборки: все файлы — артефакт, поэтому add всего каталога здесь уместен.
          git init -q -b gh-pages
          git config user.name "synergify-deploy"
          git config user.email "synergify-deploy@users.noreply.github.com"
          git add --all
          git commit -q -m "mirror: ${GITHUB_SHA}"
          GIT_SSH_COMMAND="ssh -i ~/.ssh/ts_gitbook -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes" \
            git push --force git@github.com:master5d/ts-gitbook.git gh-pages
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci(mirror): deploy-mirror — сборка зеркала, check-mirror, push в master5d/ts-gitbook gh-pages"
```

- [ ] **Step 4 (controller): ship and enable Pages** — after the branch review passes and the owner says «да» to push:

```bash
git push origin HEAD:main
# дождаться deploy-mirror = success (gh run list -R master5d/synergify-platform)
gh api -X POST repos/master5d/ts-gitbook/pages -f "source[branch]=gh-pages" -f "source[path]=/"
gh api repos/master5d/ts-gitbook/pages --jq '.html_url + " " + .status'
```

- [ ] **Step 5 (controller): live check**

```bash
for u in "" "lessons/01-introduction/u1-activation/" "en/lessons/01-introduction/u1-activation/" "cheatsheet/" "login/"; do
  curl -s -m 20 -o /tmp/m.html -w "%{http_code} $u\n" "https://master5d.github.io/ts-gitbook/$u"
  grep -c -E "data-mirror-banner|data-mirror-stub" /tmp/m.html
done
```
Expected: `200` for each; banner on content pages; `data-mirror-stub` on `login/`. Then a check-host probe from ru1/ru2/ru3 for `https://master5d.github.io/ts-gitbook/lessons/01-introduction/u1-activation/` → 200.

- [ ] **Step 6 (controller): main site unaffected** — `curl -s https://ai.synergify.com/ | grep -c data-mirror-banner` → `0`; `deploy-web` for the same commit = success.
