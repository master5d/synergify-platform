<h1 align="center">synergify-platform</h1>
<p align="center"><b>Multi-course LMS engine, course packs, platform API, and storefronts for the Synergify learning platform — one monorepo, one deploy.</b></p>

```bash
cd LMS/tochka-sborki/web && npm install && npm run dev
```

<p align="center">
  <a href="https://github.com/master5d/synergify-platform/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/master5d/synergify-platform/deploy.yml" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
</p>

---

## What it does

`synergify-platform` runs the Synergify learning platform end to end:

- **LMS engine** (`LMS/tochka-sborki/web/`) — a Next.js 16 static-export site that builds
  whichever course pack is selected via `COURSE_PACK`.
- **Course packs** (`LMS/tochka-sborki/web/packs/`) — the actual courses, as data with zero
  engine code: [**Tochka Sborki**](https://ai.synergify.com) ("a course on vibe coding") and
  [**The Silence Where You Can Hear**](https://academy.synergify.com/praktika) ("eight steps of
  attention practice"), per `LMS/registry.json`.
- **Platform API** (`workers/`) — one Cloudflare Worker serving auth, progress, admission,
  feedback, CRM, Telegram, and checkout across every course domain.
- **Academy storefront** (`academy/`) — the school shell at academy.synergify.com.
- **Home** (`synergify/`) — the synergify.com umbrella site.
- **LLM service** (`llm-service/`) — a narrow Hono service that fronts the platform's LLM calls,
  keeping direct model access out of the edge worker.

Each course pack declares its own lesson layout, engine features, and auth gates; the engine
gates surfaces by flag, never by course name — enforced by a set of guard tests
(`lib/boundary.test.ts`, `lib/pack-resolution.test.ts`, `lib/course-features.test.ts`, and more).

## CI

`.github/workflows/deploy.yml` runs on pushes to `main` that touch the engine, the academy, the
workers, or the course registry (and on manual dispatch): builds and deploys the LMS engine,
the academy shell, and the platform-API worker, plus a build+test matrix across every other
course pack with a cross-check that no pack ships another pack's branding.

## Stack

TypeScript throughout. Next.js 16 (React 19) for the engine and academy shell. Cloudflare
Workers (`wrangler`) for the platform API. Hono for the LLM service. Vitest for tests. MIT
licensed ([`LICENSE`](LICENSE)).

## Internal notes

Engineering details — module layout, session/auth design, LLM-service routing, local
verification quirks — live in [`docs/README-internal.md`](docs/README-internal.md).
