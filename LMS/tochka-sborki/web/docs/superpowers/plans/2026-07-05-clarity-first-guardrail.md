# Clarity-first Guardrail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encode the clarity-first principle (ясность первична, персонализация поверх — fb_a1a446f5) into the two live consumers: the authoring polish-prompt and CLAUDE.md.

**Architecture:** Two point changes, no refactoring: one directive line in each locale branch of `buildPolishPrompt` (`lib/authoring/review.ts`) + a substring test; one norm line in mc_hub root `CLAUDE.md`. Existing enforcers (plain-mode, lintReadability, skin decoder) stay untouched.

**Tech Stack:** TypeScript, Vitest.

## Global Constraints

- Only 2 code/doc files + 1 test file. NO refactoring of plain-mode / lintReadability / anything else.
- Directive strings verbatim from this plan (they are the spec's exact copy).
- Web gate (from `LMS/tochka-sborki/web`): `npx tsc --noEmit && npx vitest run && npx next build`.
- ⚠ `lib/authoring/*` is NOT imported by the app — vitest/next-build do not typecheck it; `npx tsc --noEmit` is the mandatory gate for review.ts.
- Trunk-based `main`, one commit.
- **Ops:** bash-git hangs this session — run all `git` via the PowerShell tool. Paths relative to `LMS/tochka-sborki/web` unless stated.

---

### Task 1: clarity-first directive in polish-prompt + CLAUDE.md norm line

**Files:**
- Modify: `lib/authoring/review.ts` (two locale branches of `buildPolishPrompt`, ~lines 56-77)
- Modify: `C:\telo\Efforts\Ongoing\mc_hub\CLAUDE.md` (one line appended to the Course-authoring engine bullet, line ~140)
- Test: `lib/authoring/review.test.ts` (extend existing `describe('buildPolishPrompt')` block, ~line 30)

**Interfaces:**
- Consumes: existing `buildPolishPrompt(mdx: string, findings: string[], locale: Locale): string`.
- Produces: no signature changes — the returned prompt gains one directive line per locale.

- [ ] **Step 1: Write the failing test**

Inside the existing `describe('buildPolishPrompt', () => { … })` block in `lib/authoring/review.test.ts`, append:

```ts
  it('carries the clarity-first guardrail in both locales (fb_a1a446f5)', () => {
    expect(buildPolishPrompt('<Phase type="activation">x</Phase>', [], 'en')).toContain('clarity comes first')
    expect(buildPolishPrompt('<Phase type="activation">x</Phase>', [], 'ru')).toContain('ясность первична')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/authoring/review.test.ts`
Expected: FAIL — the new test's two `toContain` assertions fail (substrings absent); all pre-existing tests still pass.

- [ ] **Step 3: Add the directive line to both locale branches**

In `lib/authoring/review.ts`, `buildPolishPrompt`:

**EN branch** — the array currently reads:

```ts
    return [
      `Here is a draft lesson from my course — honest, calm, no selling.`,
      `Tighten it: conversational tone, sentences under 25 words, plain language.`,
```

insert ONE line after the `Tighten it:` line:

```ts
      `Write so any beginner understands it without tuning to their perception style: clarity comes first, personalization sits on top — never instead.`,
```

**RU branch** — the array currently reads:

```ts
  return [
    `Вот черновик урока моего курса — честно, спокойно, без продаж.`,
    `Подтяни: разговорный тон, предложения короче 25 слов, простой язык.`,
```

insert ONE line after the `Подтяни:` line:

```ts
    `Пиши так, чтобы понял любой новичок без подстройки под его стиль восприятия: ясность первична, персонализация — поверх, не вместо.`,
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/authoring/review.test.ts`
Expected: PASS — new test green, all existing tests green.

- [ ] **Step 5: Add the CLAUDE.md norm line**

In `C:\telo\Efforts\Ongoing\mc_hub\CLAUDE.md`, the Course-authoring engine bullet (line ~140) ends with:

```
`lib/authoring/*` НЕ импортится приложением; tsc-гейт обязателен (vitest/next-build не тайпчекают эти файлы).
```

Immediately AFTER that bullet (as a new sibling bullet on its own line) insert:

```
- **Clarity-first guardrail** (fb_a1a446f5, контр-сигнал реального ICP к методологии fb_80ebb140): baseline-ясность первична для ВСЕХ сегментов; профилирование-по-стилю/скины/интейк-подстройка — слой ПОВЕРХ, никогда не замена. Enforce: plain-mode (`lib/rpg-mode.ts`), `lintReadability`, clarity-строка в `buildPolishPrompt`.
```

Nothing else in CLAUDE.md changes.

- [ ] **Step 6: Full gate**

Run: `cd LMS/tochka-sborki/web && npx tsc --noEmit && npx vitest run && npx next build`
Expected: tsc clean (mandatory for review.ts — see Global Constraints); whole suite green; build succeeds.

- [ ] **Step 7: Commit** (PowerShell tool — bash-git hangs)

```
Set-Location C:\telo\Efforts\Ongoing\mc_hub
git add LMS/tochka-sborki/web/lib/authoring/review.ts LMS/tochka-sborki/web/lib/authoring/review.test.ts CLAUDE.md
git commit -m "feat: clarity-first guardrail in polish-prompt + CLAUDE.md norm (fb_a1a446f5)"
```

---

## Self-Review

**1. Spec coverage:** polish-prompt directive both locales verbatim ✅ Step 3 · substring test both locales ✅ Step 1 · CLAUDE.md norm line with tension + enforcers named ✅ Step 5 · existing enforcers untouched ✅ (no other files) · tsc-gate called out ✅ Global Constraints + Step 6.

**2. Placeholder scan:** none — exact strings and insertion points given.

**3. Type consistency:** no signature changes; test uses existing `buildPolishPrompt` import (already at line 2 of the test file).
