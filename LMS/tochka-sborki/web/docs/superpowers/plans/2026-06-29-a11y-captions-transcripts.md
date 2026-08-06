# A11y Captions/Transcripts Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an owner-media-gated accessibility layer for video — caption tracks on self-hosted `<video>` and a universal transcript disclosure on both video surfaces — shipping dark (zero visual change) until the owner supplies caption/transcript content.

**Architecture:** Pure resolver lib (`lib/a11y/media.ts`) decides what to render; a shared server-renderable `<MediaTranscript>` disclosure renders transcript text or `null`; `ShowcaseVideo` gains a `<track>` (file source only) + transcript, `VideoCheckpoint` gains a transcript prop. All new data slots default `null`/absent → dark.

**Tech Stack:** Next.js 16 (App Router, `output: 'export'`), React, TypeScript, Vitest (`environment: node`), Tailwind v4. No new dependencies.

## Global Constraints

- Single app: `LMS/tochka-sborki/web/`. All paths below are relative to that directory. Run all commands from there.
- `lms_target: engine`.
- **Dark-ship invariant:** every new data slot defaults `null`/absent → zero visible change for the current videoless site. Never seed real caption/transcript content — the owner supplies it.
- Captions (`<track kind="captions">`) attach ONLY to a self-hosted `<video>` (the `file` source). Embeds (YouTube/Vimeo) → no track (platform-native captions).
- Bilingual copy uses the `Bi` shape `{ ru: string; en: string }`. Showcase data is `Bi`; lesson MDX (`VideoCheckpoint`) is already per-locale so its transcript is a plain `string`.
- No new dependencies. Follow existing idioms (inline-style components, `var(--…)` tokens, `Bi` keyed data, source-reading drift-guard tests like `lib/a11y/keyboard.test.ts`).
- Test command: full suite `npm test` (= `vitest run`); single file `npx vitest run <path>`.
- Commit messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Commit with gpgsign disabled is fine (`git -c commit.gpgsign=false commit`). Git runs from the repo root `C:\telo\Efforts\Ongoing\mc_hub` — prefix the app path in `git add`.

---

### Task 1: `lib/a11y/media.ts` — pure resolver logic

**Files:**
- Create: `lib/a11y/media.ts`
- Test: `lib/a11y/media.test.ts`

**Interfaces:**
- Consumes: nothing (leaf module).
- Produces:
  - `export interface Bi { ru: string; en: string }`
  - `export interface CaptionTrack { src: string; srclang: 'ru' | 'en'; label: string }`
  - `export function resolveCaptionTrack(sourceKind: 'embed' | 'file', vtt: string | null, locale: 'ru' | 'en'): CaptionTrack | null`
  - `export function resolveTranscript(transcript: Bi | null, locale: 'ru' | 'en'): string | null`

- [ ] **Step 1: Write the failing test**

Create `lib/a11y/media.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { resolveCaptionTrack, resolveTranscript } from './media'

describe('resolveCaptionTrack', () => {
  it('returns null for embed sources regardless of vtt (platform-native captions)', () => {
    expect(resolveCaptionTrack('embed', '/captions/x-ru.vtt', 'ru')).toBeNull()
    expect(resolveCaptionTrack('embed', null, 'en')).toBeNull()
  })
  it('returns null for file sources when no vtt is supplied', () => {
    expect(resolveCaptionTrack('file', null, 'ru')).toBeNull()
  })
  it('returns a track for file + vtt with the active-locale srclang and src', () => {
    expect(resolveCaptionTrack('file', '/captions/x-ru.vtt', 'ru')).toEqual({
      src: '/captions/x-ru.vtt', srclang: 'ru', label: 'Русские субтитры',
    })
    expect(resolveCaptionTrack('file', '/captions/x-en.vtt', 'en')).toEqual({
      src: '/captions/x-en.vtt', srclang: 'en', label: 'Captions',
    })
  })
})

describe('resolveTranscript', () => {
  it('returns null when transcript is absent', () => {
    expect(resolveTranscript(null, 'ru')).toBeNull()
  })
  it('returns the active-locale text when present', () => {
    const t = { ru: 'Расшифровка ролика.', en: 'Video transcript.' }
    expect(resolveTranscript(t, 'ru')).toBe('Расшифровка ролика.')
    expect(resolveTranscript(t, 'en')).toBe('Video transcript.')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/a11y/media.test.ts`
Expected: FAIL — cannot resolve `./media` (module does not exist).

- [ ] **Step 3: Write minimal implementation**

Create `lib/a11y/media.ts`:

```ts
// lib/a11y/media.ts
// Pure resolvers for video accessibility: caption tracks (self-hosted <video> only)
// and transcripts (universal). No DOM, no React. Returns null → "dark" (render nothing).

export interface Bi { ru: string; en: string }

export interface CaptionTrack {
  src: string // VTT path in /public, e.g. '/captions/showcase-ru.vtt'
  srclang: 'ru' | 'en'
  label: string // track-menu label
}

const TRACK_LABEL: Bi = { ru: 'Русские субтитры', en: 'Captions' }

// Captions attach only to a self-hosted <video> (file source). Embeds carry
// platform-native captions and cannot accept a cross-origin VTT track → null.
export function resolveCaptionTrack(
  sourceKind: 'embed' | 'file',
  vtt: string | null,
  locale: 'ru' | 'en',
): CaptionTrack | null {
  if (sourceKind !== 'file' || !vtt) return null
  return { src: vtt, srclang: locale, label: TRACK_LABEL[locale] }
}

// Active-locale transcript text, or null when absent.
export function resolveTranscript(transcript: Bi | null, locale: 'ru' | 'en'): string | null {
  if (!transcript) return null
  return transcript[locale]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/a11y/media.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/a11y/media.ts LMS/tochka-sborki/web/lib/a11y/media.test.ts
git -c commit.gpgsign=false commit -m "feat(a11y): pure caption-track + transcript resolvers (fb_9563271d9ca6)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `components/media-transcript.tsx` — shared disclosure

**Files:**
- Create: `components/media-transcript.tsx`
- Test: `components/media-transcript.test.ts`

**Interfaces:**
- Consumes: nothing from Task 1 at runtime (takes already-resolved `text: string | null`).
- Produces: `export function MediaTranscript({ text, locale }: { text: string | null; locale: 'ru' | 'en' }): React.ReactElement | null`

- [ ] **Step 1: Write the failing test**

This is a source/markup drift-guard (mirrors `lib/a11y/keyboard.test.ts` — read the file, assert invariants; the Vitest env is `node`, so no DOM render). Create `components/media-transcript.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'media-transcript.tsx'), 'utf8')

describe('MediaTranscript', () => {
  it('returns null when text is empty (dark-ship invariant)', () => {
    expect(src).toMatch(/if\s*\(!text\)\s*return null/)
  })
  it('uses a native <details> disclosure', () => {
    expect(src).toContain('<details')
    expect(src).toContain('<summary')
  })
  it('labels the summary bilingually', () => {
    expect(src).toContain('Транскрипт')
    expect(src).toContain('Transcript')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/media-transcript.test.ts`
Expected: FAIL — cannot read `media-transcript.tsx` (file does not exist).

- [ ] **Step 3: Write minimal implementation**

Create `components/media-transcript.tsx`:

```tsx
// components/media-transcript.tsx
// Shared, dependency-free transcript disclosure. Renders below a video player.
// Returns null when there is no transcript → dark-ship.

const LABEL = { ru: 'Транскрипт', en: 'Transcript' } as const

export function MediaTranscript({ text, locale }: { text: string | null; locale: 'ru' | 'en' }) {
  if (!text) return null
  return (
    <details
      style={{
        margin: '0.9rem 0 2rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        background: 'var(--bg-surface)',
        padding: '0.6rem 1rem',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {LABEL[locale]}
      </summary>
      <div
        style={{
          marginTop: '0.8rem',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
      </div>
    </details>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/media-transcript.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Build-validate**

Run: `npm run build`
Expected: build succeeds (the new component compiles; it is not yet imported anywhere, which is fine).

- [ ] **Step 6: Commit**

```bash
git add LMS/tochka-sborki/web/components/media-transcript.tsx LMS/tochka-sborki/web/components/media-transcript.test.ts
git -c commit.gpgsign=false commit -m "feat(a11y): shared MediaTranscript disclosure (dark when empty) (fb_9563271d9ca6)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Wire `ShowcaseVideo` (hero) — caption track + transcript

**Files:**
- Modify: `lib/course/showcase.ts` (the `VIDEO` const ~line 65, the `ShowcaseVM.video` type ~line 54, the `getShowcase` video resolution ~line 191)
- Modify: `components/showcase-video.tsx`
- Modify: `components/showcase-gallery.tsx`
- Test: `components/showcase-video.test.ts` (new — drift-guard)

**Interfaces:**
- Consumes (from Task 1): `resolveCaptionTrack`, `resolveTranscript`, `CaptionTrack` from `@/lib/a11y/media`.
- Consumes (from Task 2): `MediaTranscript` from `@/components/media-transcript`.
- Produces: `ShowcaseVM.video` extended to `{ source: VideoSource | null; poster: string | null; caption: string; captionTrack: CaptionTrack | null; transcript: string | null }`. `ShowcaseVideo` gains props `captionTrack: CaptionTrack | null`, `transcript: string | null`, `locale: 'ru' | 'en'`.

- [ ] **Step 1: Write the failing test**

Create `components/showcase-video.test.ts` (source drift-guard — asserts the `<track>` is emitted on the file path and the transcript is wired):

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'showcase-video.tsx'), 'utf8')

describe('ShowcaseVideo a11y wiring', () => {
  it('renders a caption <track> on the self-hosted <video> when a track is present', () => {
    expect(src).toContain('<track')
    expect(src).toMatch(/kind="captions"/)
    expect(src).toMatch(/captionTrack &&/)
  })
  it('renders the MediaTranscript disclosure', () => {
    expect(src).toContain('MediaTranscript')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/showcase-video.test.ts`
Expected: FAIL — `<track`, `MediaTranscript`, and `captionTrack` are not in the file yet.

- [ ] **Step 3: Extend the data layer in `lib/course/showcase.ts`**

3a. Add the import at the top of the file (after the existing first import line `import type { Locale } from '@/lib/intake/types'`):

```ts
import { resolveCaptionTrack, resolveTranscript, type CaptionTrack } from '@/lib/a11y/media'
```

3b. Extend the `ShowcaseVM.video` type. Replace this line:

```ts
  video: { source: VideoSource | null; poster: string | null; caption: string }
```

with:

```ts
  video: { source: VideoSource | null; poster: string | null; caption: string; captionTrack: CaptionTrack | null; transcript: string | null }
```

3c. Extend the `VIDEO` const. Replace:

```ts
const VIDEO: { url: string | null; poster: string | null; caption: Bi } = {
  url: null,    // впиши YouTube/Vimeo watch-URL или путь к .mp4 — встроится автоматически
  poster: null, // путь к постеру в /public, например '/showcase-poster.jpg'
  caption: { ru: 'Короткий ролик о сути — скоро', en: 'A short film about the essence — coming soon' },
}
```

with:

```ts
const VIDEO: { url: string | null; poster: string | null; caption: Bi; captions: string | null; transcript: Bi | null } = {
  url: null,    // впиши YouTube/Vimeo watch-URL или путь к .mp4 — встроится автоматически
  poster: null, // путь к постеру в /public, например '/showcase-poster.jpg'
  caption: { ru: 'Короткий ролик о сути — скоро', en: 'A short film about the essence — coming soon' },
  captions: null,   // путь к .vtt в /public для self-hosted .mp4 (для embed субтитры — на стороне платформы)
  transcript: null, // { ru, en } полная расшифровка ролика — показывается раскрывающимся блоком
}
```

3d. Update the `video:` resolution inside `getShowcase`. Replace:

```ts
    video: { source: resolveVideoSource(VIDEO.url), poster: VIDEO.poster, caption: VIDEO.caption[L] },
```

with:

```ts
    video: (() => {
      const source = resolveVideoSource(VIDEO.url)
      return {
        source, poster: VIDEO.poster, caption: VIDEO.caption[L],
        captionTrack: resolveCaptionTrack(source?.kind ?? 'embed', VIDEO.captions, L),
        transcript: resolveTranscript(VIDEO.transcript, L),
      }
    })(),
```

- [ ] **Step 4: Wire `components/showcase-video.tsx`**

4a. Add imports at the top (after the existing `import { withAutoplay, type VideoSource } from '@/lib/course/showcase'`):

```ts
import { MediaTranscript } from '@/components/media-transcript'
import type { CaptionTrack } from '@/lib/a11y/media'
```

4b. Extend the component signature. Replace:

```tsx
export function ShowcaseVideo({ source, poster, caption, title }: {
  source: VideoSource | null
  poster: string | null
  caption: string
  title: string
}) {
  const [playing, setPlaying] = useState(false)
```

with:

```tsx
export function ShowcaseVideo({ source, poster, caption, title, captionTrack, transcript, locale }: {
  source: VideoSource | null
  poster: string | null
  caption: string
  title: string
  captionTrack: CaptionTrack | null
  transcript: string | null
  locale: 'ru' | 'en'
}) {
  const [playing, setPlaying] = useState(false)
```

4c. Make each of the three `return` branches render the transcript below the frame. Wrap each returned `<div style={FRAME}>…</div>` in a fragment that also renders `<MediaTranscript>`. Replace the **placeholder branch** return:

```tsx
  if (!source) {
    return (
      <div style={FRAME}>
        <div style={{ ...FILL, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
          <span aria-hidden="true" style={{ fontSize: '2.4rem' }}>▶</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{caption}</span>
        </div>
      </div>
    )
  }
```

with:

```tsx
  if (!source) {
    return (
      <>
        <div style={FRAME}>
          <div style={{ ...FILL, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
            <span aria-hidden="true" style={{ fontSize: '2.4rem' }}>▶</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{caption}</span>
          </div>
        </div>
        <MediaTranscript text={transcript} locale={locale} />
      </>
    )
  }
```

4d. Replace the **facade branch** return:

```tsx
  if (!playing) {
    return (
      <div style={FRAME}>
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={title}
          style={{
            ...FILL, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: poster ? `center / cover no-repeat url(${poster})` : 'var(--bg-surface)',
          }}
        >
          <span aria-hidden="true" style={{
            fontSize: '1.6rem', width: 72, height: 72, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--text-accent)', color: 'var(--text-on-accent)',
          }}>▶</span>
        </button>
      </div>
    )
  }
```

with:

```tsx
  if (!playing) {
    return (
      <>
        <div style={FRAME}>
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={title}
            style={{
              ...FILL, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: poster ? `center / cover no-repeat url(${poster})` : 'var(--bg-surface)',
            }}
          >
            <span aria-hidden="true" style={{
              fontSize: '1.6rem', width: 72, height: 72, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--text-accent)', color: 'var(--text-on-accent)',
            }}>▶</span>
          </button>
        </div>
        <MediaTranscript text={transcript} locale={locale} />
      </>
    )
  }
```

4e. Replace the **playing branch** return (add the `<track>` to the `<video>` and the transcript below):

```tsx
  return (
    <div style={FRAME}>
      {source.kind === 'embed' ? (
        <iframe
          src={withAutoplay(source.src)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={FILL}
        />
      ) : (
        <video src={source.src} controls autoPlay playsInline poster={poster ?? undefined} style={FILL} />
      )}
    </div>
  )
}
```

with:

```tsx
  return (
    <>
      <div style={FRAME}>
        {source.kind === 'embed' ? (
          <iframe
            src={withAutoplay(source.src)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={FILL}
          />
        ) : (
          <video src={source.src} controls autoPlay playsInline poster={poster ?? undefined} style={FILL}>
            {captionTrack && (
              <track
                kind="captions"
                src={captionTrack.src}
                srcLang={captionTrack.srclang}
                label={captionTrack.label}
                default
              />
            )}
          </video>
        )}
      </div>
      <MediaTranscript text={transcript} locale={locale} />
    </>
  )
}
```

- [ ] **Step 5: Wire `components/showcase-gallery.tsx`**

Replace:

```tsx
        <ShowcaseVideo source={t.video.source} poster={t.video.poster} caption={t.video.caption} title={t.real.heading} />
```

with:

```tsx
        <ShowcaseVideo source={t.video.source} poster={t.video.poster} caption={t.video.caption} title={t.real.heading} captionTrack={t.video.captionTrack} transcript={t.video.transcript} locale={locale === 'en' ? 'en' : 'ru'} />
```

- [ ] **Step 6: Run the drift-guard test**

Run: `npx vitest run components/showcase-video.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 7: Build-validate**

Run: `npm run build`
Expected: build succeeds (types thread through; the page still renders the placeholder since `VIDEO.url` is null, and `transcript` is null → `MediaTranscript` renders nothing).

- [ ] **Step 8: Commit**

```bash
git add LMS/tochka-sborki/web/lib/course/showcase.ts LMS/tochka-sborki/web/components/showcase-video.tsx LMS/tochka-sborki/web/components/showcase-video.test.ts LMS/tochka-sborki/web/components/showcase-gallery.tsx
git -c commit.gpgsign=false commit -m "feat(a11y): caption track + transcript on showcase hero video (fb_9563271d9ca6)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Wire `VideoCheckpoint` (lessons) — transcript prop

**Files:**
- Modify: `components/video-checkpoint.tsx`
- Test: `components/video-checkpoint.test.ts` (new — drift-guard)

**Interfaces:**
- Consumes (from Task 2): `MediaTranscript` from `@/components/media-transcript`.
- Produces: `VideoCheckpoint` gains optional props `transcript?: string` and `locale?: 'ru' | 'en'` (default `'ru'`). Existing `src`, `title`, `children` unchanged.

- [ ] **Step 1: Write the failing test**

Create `components/video-checkpoint.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'video-checkpoint.tsx'), 'utf8')

describe('VideoCheckpoint transcript wiring', () => {
  it('accepts transcript + locale props', () => {
    expect(src).toMatch(/transcript\?:\s*string/)
    expect(src).toMatch(/locale\?:\s*'ru'\s*\|\s*'en'/)
  })
  it('renders the shared MediaTranscript disclosure', () => {
    expect(src).toContain('MediaTranscript')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/video-checkpoint.test.ts`
Expected: FAIL — props and `MediaTranscript` are not in the file yet.

- [ ] **Step 3: Implement**

3a. Add the import after the existing first import (`import { videoEmbedUrl } from '@/lib/course/showcase'`):

```ts
import { MediaTranscript } from '@/components/media-transcript'
```

3b. Update the JSDoc usage comment block to mention the new prop — replace the lines:

```
 *   <VideoCheckpoint src="https://youtu.be/XXXX" title="...">
 *   Прокрути в голове: где это уже встречалось тебе?
 *   </VideoCheckpoint>
 */
```

with:

```
 *   <VideoCheckpoint src="https://youtu.be/XXXX" title="..." transcript="Полная расшифровка…" locale="ru">
 *   Прокрути в голове: где это уже встречалось тебе?
 *   </VideoCheckpoint>
 *
 * `transcript` is a plain locale-correct string (lesson files are per-locale); it
 * renders below the figure as a disclosure, dark when absent. Embeds use the
 * platform's native captions, so there is no caption <track> here.
 */
```

3c. Replace the component signature line:

```tsx
export function VideoCheckpoint({ src, title, children }: { src: string; title?: string; children?: React.ReactNode }) {
  const embed = videoEmbedUrl(src)
```

with:

```tsx
export function VideoCheckpoint({ src, title, children, transcript, locale }: { src: string; title?: string; children?: React.ReactNode; transcript?: string; locale?: 'ru' | 'en' }) {
  const embed = videoEmbedUrl(src)
```

3d. Render the transcript at the end of the `<figure>`, right before its closing tag. The figure currently ends:

```tsx
      {children && (
        <figcaption style={{
          display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
          marginTop: '0.9rem', padding: '0.9rem 1rem',
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
          borderLeft: '3px solid var(--text-accent)', borderRadius: 'var(--radius)',
        }}>
          <span aria-hidden="true" style={{ fontSize: '1rem' }}>⏸</span>
          <span style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{children}</span>
        </figcaption>
      )}
    </figure>
  )
}
```

Replace it with (add `<MediaTranscript>` after the `figcaption` block):

```tsx
      {children && (
        <figcaption style={{
          display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
          marginTop: '0.9rem', padding: '0.9rem 1rem',
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
          borderLeft: '3px solid var(--text-accent)', borderRadius: 'var(--radius)',
        }}>
          <span aria-hidden="true" style={{ fontSize: '1rem' }}>⏸</span>
          <span style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{children}</span>
        </figcaption>
      )}
      <MediaTranscript text={transcript ?? null} locale={locale ?? 'ru'} />
    </figure>
  )
}
```

- [ ] **Step 4: Run the drift-guard test**

Run: `npx vitest run components/video-checkpoint.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS — all suites green, including the new `media`, `media-transcript`, `showcase-video`, `video-checkpoint` tests and all prior tests (no regression).

- [ ] **Step 6: Build-validate the whole app**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 7: Commit**

```bash
git add LMS/tochka-sborki/web/components/video-checkpoint.tsx LMS/tochka-sborki/web/components/video-checkpoint.test.ts
git -c commit.gpgsign=false commit -m "feat(a11y): transcript disclosure on lesson VideoCheckpoint (fb_9563271d9ca6)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- `lib/a11y/media.ts` pure logic + tests → Task 1. ✅
- `MediaTranscript` shared disclosure (dark when empty) → Task 2. ✅
- Wire `ShowcaseVideo` (VIDEO/ShowcaseVM/getShowcase data + `<track>` + transcript + gallery pass-through + drift-guard) → Task 3. ✅
- Wire `VideoCheckpoint` (`transcript?`/`locale?` props + transcript) → Task 4. ✅
- Tests: media truth tables (Task 1), dark-ship + `<track>`-emit drift-guards (Tasks 2–4), full suite + build green (Task 4). ✅
- Dark-ship invariant (every slot defaults null) → enforced in VIDEO seed (Task 3) and MediaTranscript null-return (Task 2). ✅
- Caption-track-file-only fact → encoded in `resolveCaptionTrack` (Task 1) and only the `<video>` branch (Task 3); VideoCheckpoint embed has no track (Task 4). ✅

**Placeholder scan:** No TBD/TODO/"handle edge cases"/"similar to Task N". Every code step shows full code. ✅

**Type consistency:** `CaptionTrack` (`src`/`srclang`/`label`) consistent across Tasks 1→3. `resolveCaptionTrack(sourceKind, vtt, locale)` / `resolveTranscript(transcript, locale)` signatures match their call sites in `getShowcase` (Task 3). `MediaTranscript({ text, locale })` matches all three call sites (Tasks 3, 4). `ShowcaseVideo` new props (`captionTrack`, `transcript`, `locale`) match the gallery call site (Task 3). Note: `lib/course/showcase.ts` keeps its own local `Bi` interface; `VIDEO.transcript` (local `Bi`) is structurally compatible with `resolveTranscript`'s `Bi` param — TS structural typing accepts it. ✅

---

**Plan complete and saved to `LMS/tochka-sborki/web/docs/superpowers/plans/2026-06-29-a11y-captions-transcripts.md`.**
