# A11y captions/transcripts — design (fb_9563271d9ca6)

**Ticket:** `fb_9563271d9ca6` — A11y follow-on (from `fb_a2c667a36a64` slice 2): captions & transcripts on all showcase and lesson videos. Owner-media-gated — the engine ships dark until the owner supplies caption/transcript files. Equity note: not everyone can hear or stream audio.

## Goal

Add an **owner-media-gated accessibility layer for video**: caption tracks on self-hosted video, and a universal transcript disclosure on both video surfaces. Ships **dark** (zero visual change) until the owner supplies caption/transcript content. Continuation of the a11y arc (`lib/a11y/` contrast + keyboard baseline; lite-mode just shipped in `fb_731d3ee7f748`).

## Context (audit — grep-before-build)

- **Two video surfaces, both currently dark:**
  - `components/showcase-video.tsx` (`ShowcaseVideo`) — the single hero video on the possibilities page, driven by the `VIDEO` const in `lib/course/showcase.ts`. `VIDEO.url` is `null` today → static placeholder. Already a click-to-load facade. Supports `embed` (YouTube/Vimeo `<iframe>`) and `file` (self-hosted `<video>`) sources via `resolveVideoSource`.
  - `components/video-checkpoint.tsx` (`VideoCheckpoint`) — an MDX lesson component (embed-only `<iframe>` + reflection `children`). **0 usages** in any `content/` lesson today.
- **No lesson videos exist** (`grep youtu|vimeo|.mp4|<video> content/` → empty), and the hero video is unset. So this slice is purely forward-looking infrastructure — exactly the "engine ships dark" the ticket calls for.
- **`lib/a11y/` already exists** (`contrast.ts`, `keyboard.test.ts`) from the a11y baseline. New media-a11y logic belongs there: `lib/a11y/media.ts`.
- **Existing patterns this mirrors:** engine+keyed-data (`lib/course/showcase.ts` `Bi` bilingual data + thin display component); dark-ship facade (render only when configured); drift-guard binding test (`lib/a11y/keyboard.test.ts` asserts CSS/markup invariants by reading source).

## Two technical facts that pin the design

1. **Captions** (`<track kind="captions">`) attach **only** to a self-hosted `<video>` element (the `file` source). YouTube/Vimeo embeds carry captions natively and cannot accept an injected VTT track cross-origin. → caption-track wiring lands only on the `file` path; embeds rely on platform-native captions.
2. **Transcripts** are the **universal** layer — a text block that works for embed *and* file, before or after play, and serves the equity note best (read instead of stream). This is the always-available accessibility path.

## Architecture

### 1. `lib/a11y/media.ts` — pure logic (unit-tested)

```ts
export interface Bi { ru: string; en: string }

export interface CaptionTrack {
  src: string            // VTT path in /public, e.g. '/captions/showcase-ru.vtt'
  srclang: 'ru' | 'en'
  label: string          // human label for the track menu, e.g. 'Русские субтитры'
}

// Captions attach only to self-hosted <video>. Embeds → null (platform-native captions).
// null vtt → null. file + vtt → a CaptionTrack for the active locale.
export function resolveCaptionTrack(
  sourceKind: 'embed' | 'file',
  vtt: string | null,
  locale: 'ru' | 'en',
): CaptionTrack | null

// Transcript text for the active locale, or null when absent (→ dark).
export function resolveTranscript(transcript: Bi | null, locale: 'ru' | 'en'): string | null
```

Pure, no DOM, no React. The label for `resolveCaptionTrack` is locale-keyed internally (`{ ru: 'Русские субтитры', en: 'Captions' }`). Default behavior when inputs are null/absent = `null` (dark).

### 2. `components/media-transcript.tsx` — shared disclosure

A small, dependency-free, server-renderable component:

```tsx
export function MediaTranscript({ text, locale }: { text: string | null; locale: 'ru' | 'en' }) {
  if (!text) return null            // dark when absent
  // native <details>/<summary> disclosure below the player
}
```

- Summary label bilingual by `locale`: «Транскрипт» / «Transcript».
- Body = `text` (whitespace preserved via styling so authored paragraph breaks survive).
- Native `<details>` → keyboard-accessible for free; inherits `:focus-visible` from the a11y baseline. Styled with the existing surface/border/`var(--radius)` idiom (matches `VideoCheckpoint`'s figcaption).
- Renders `null` when `text` is null → **dark**.

### 3. Wire `ShowcaseVideo` (showcase hero)

Data plumbing in `lib/course/showcase.ts`:
- Extend the `VIDEO` const with `captions: string | null` (VTT path) and `transcript: Bi | null`, both seeded `null` with an authoring comment (mirrors the existing `url`/`poster` comments).
- Extend `ShowcaseVM.video` to `{ source, poster, caption, captionTrack: CaptionTrack | null, transcript: string | null }`.
- In `getShowcase`, resolve `captionTrack: resolveCaptionTrack(source?.kind ?? 'embed', VIDEO.captions, L)` and `transcript: resolveTranscript(VIDEO.transcript, L)`.

`components/showcase-video.tsx`:
- New props `captionTrack: CaptionTrack | null` and `transcript: string | null`.
- On the `file` `<video>` element, render `<track kind="captions" src srcLang label default />` when `captionTrack` is present.
- Render `<MediaTranscript text={transcript} locale=… />` **below the FRAME in every branch** (placeholder, facade, playing) so the transcript is reachable even before the learner clicks play. (Component needs `locale`; thread it from `getShowcase`/gallery — add a `locale` prop to `ShowcaseVideo`.)
- `showcase-gallery.tsx` passes the new fields through.

### 4. Wire `VideoCheckpoint` (lessons)

Embed-only → no caption track (native captions). Add transcript support:
- New prop `transcript?: string` — a plain string, NOT `Bi`: lesson MDX files are already per-locale (`content/ru/**`, `content/en/**`), so the author supplies the locale-correct text directly.
- New prop `locale?: 'ru' | 'en'` (default `'ru'`) — selects the disclosure summary label. MDX authors in `content/en/**` pass `locale="en"`.
- Render `<MediaTranscript text={transcript ?? null} locale={locale ?? 'ru'} />` below the existing `<figure>`. Existing `children` reflection-checkpoint untouched.

### 5. Tests

- **`lib/a11y/media.test.ts`** — pure truth tables:
  - `resolveCaptionTrack`: `embed` + any vtt → `null`; `file` + `null` → `null`; `file` + path → `CaptionTrack` with correct `srclang`/`src`; label matches locale.
  - `resolveTranscript`: `null` → `null`; present → active-locale string; ru vs en selection.
- **Drift-guard** (mirrors `keyboard.test.ts` source-reading style): a test asserting `components/showcase-video.tsx` emits a `<track` element for the file+caption path, and that `media-transcript.tsx` returns null for empty text (guards the dark-ship invariant). Keep it a source/markup assertion, not a DOM render.
- Components otherwise **build-validated** (`npm run build`) + full Vitest suite green, no regression (theme/lite/showcase still work).

## Authenticity / values

Directly serves the equity note: «not everyone can hear or stream audio.» The transcript is the always-available text path; captions where the format allows. No dark patterns, no nagging, no fabricated content — the owner supplies real transcripts/captions; until then the surface is silent (dark).

## Scope

- Single app: `LMS/tochka-sborki/web/`. `lms_target: engine`.
- **Out of scope:** auto-generating transcripts or VTT files (owner supplies real media), transcript-from-file loading at runtime (inline keyed data is consistent + YAGNI), styling beyond the existing disclosure idiom, multi-track caption menus beyond one per locale, audio-description tracks, and touching the lite-mode / theme infrastructure.

## Backward compatibility

Additive only: one new pure lib + one shared component + new nullable fields on `VIDEO`/`ShowcaseVM.video` + new optional props on `ShowcaseVideo`/`VideoCheckpoint`. Every new slot defaults `null`/absent → **zero visible change** for the current videoless site. No new dependencies.

## Task decomposition (for the plan)

1. `lib/a11y/media.ts` pure logic (`CaptionTrack`, `resolveCaptionTrack`, `resolveTranscript`) + `media.test.ts` (TDD).
2. `components/media-transcript.tsx` shared disclosure + drift-guard test (returns null on empty) — build-validated.
3. Wire `ShowcaseVideo`: `VIDEO`/`ShowcaseVM`/`getShowcase` data plumbing + `<track>` + `<MediaTranscript>` + gallery pass-through + `<track>`-emit drift-guard — build-validated.
4. Wire `VideoCheckpoint`: `transcript?`/`locale?` props + `<MediaTranscript>` — build-validated + full suite/build green.
