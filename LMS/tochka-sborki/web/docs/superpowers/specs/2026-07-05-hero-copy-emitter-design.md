# Sovereign hero-copy emitter (fb_3c88df79)

**Ticket:** `fb_3c88df794…` — hero-header синтез из 3 owner-сформулированных рамок
(«чат-против-системы» / «о-чём-мечтать» / «что-изменится») + слой отработки возражений.
Грани уже зашиплены по отдельным тикетам (fb_85c12d9a / fb_b1bf63a0+fb_2fbf86ac /
fb_39f6ccee+fb_8423715c / fb_a6c79aa2), но задачи ВЫБОРА/СИНТЕЗА единого hero-header нет.

## Scope decision

Финальная landing hero-копия — owner-voice, её не гострайчу. Buildable-now дельта =
**4-й член sovereign prompt-emitter-семьи** (academy-manifesto S3 · diyu · why-free): JSON-SoT
с рамками + `.mjs`-эмиттер, печатающий промпт для агента ВЛАДЕЛЬЦА, который синтезирует
hero-header своим голосом. Ноль live-LLM, ноль build-impact (app-код JSON не импортит).

## Architecture — exact mirror of the why-free emitter

### `LMS/hero-frame.json` (JSON-SoT, sibling to `registry.json` / `why-free-frame.json`)

```json
{
  "origin": { "source": "…", "note": "…" },
  "frames": [ { "id", "label": {ru,en}, "ru", "en" } × 3 ],
  "objections": [ { "id", "objection": {ru,en}, "reframe": {ru,en} } × 3 ],
  "placements": [ "…" ]
}
```

**3 frames** (id · суть):
- `chat-vs-system` — заряженный чат vs собранная система: что ты получаешь сверх своего
  ChatGPT — не разговор, а собранная под тебя система, которая держит контекст и работает.
- `dream-together` — о чём можно помечтать вместе: приглашение увидеть, что станет
  возможным — витрина, а не обещание.
- `what-changes` — что конкретно изменится за курс: честный исход в терминах «сможешь
  делать X», не проценты и не хайп.

**3 objections** (objection → honest reframe, из fb_a6c79aa2):
- `freelancer` — «закажу у фрилансера» → фрилансер делает раз; ты учишься собирать сам и
  дальше.
- `chat-remembers` — «мой чат и так всё помнит» → память ≠ система: контекст, который ведёт
  дело, а не тред, который теряется.
- `automation-fear` — «боюсь автоматизировать общение» → ИИ снимает рутину, живой контакт и
  суждение остаются человеку (перекликается с anti-dependency fb_9f6458a2).

**placements:** hero-header короткий (главный экран) · подзаголовок-раскрытие (medium) ·
FAQ-ответ «чем это лучше моего чата» (короткий, рядом с рамкой).

### `scripts/hero-copy-prompt.mjs` (sovereign emitter, mirror `why-free-prompt.mjs`)

Читает `LMS/registry.json` (`academy.name`/`fullName`, `courses`) + `LMS/hero-frame.json`;
печатает промпт в stdout: контекст (академия/курсы) → 3 рамки (label + ru/en) → objection-слой
→ HARD CONSTRAINTS (verbatim из why-free: plain-mode/clarity-first, no urgency/scarcity, no
testimonials/credentials/guru/fabricated metrics, sole-prop never nonprofit, RU+EN) →
инструкция: **синтезировать ОДИН hero-header, выбрав или сплавив рамки и упреждая возражения**
→ placements. Shebang `#!/usr/bin/env node`, `fileURLToPath`-repoRoot, ноль deps.

### `LMS/tochka-sborki/web/lib/academy/hero-frame.test.ts` (mirror `why-free-frame.test.ts`)

- `origin.source`/`origin.note` non-empty.
- `frames` ровно 3, у каждого `id`/`label.ru`/`label.en`/`ru`/`en` non-empty.
- `objections` ≥3, у каждого `id`/`objection.ru`/`objection.en`/`reframe.ru`/`reframe.en` non-empty.
- ≥1 placement.
- `lintDehustle []` по КАЖДОЙ строке (origin.note + все frame ru/en + label ru/en + все
  objection/reframe ru/en). ⚠ objection-строки ЦИТИРУЮТ возражение клиента, но не содержат
  banned-фраз — если какая-то зацепит `lintDehustle`, переформулировать reframe (как diyu
  «rare/no-longer-rare» гоча), не ослаблять guard.

## Global constraints

- Sovereign prompt-emitter: ноль live-LLM, промпт для агента владельца, owner-voice не гострайчу.
- Sibling-паттерн: JSON-SoT рядом с `registry.json`; app-код НЕ импортит → ноль build-impact.
- De-hustle: `lintDehustle []` (reuse `lib/authoring/dehustle.ts`, не дублировать ban-list).
- Sole-prop, never nonprofit; no-Mermaid; plain-mode/clarity-first (перекликается fb_a1a446f5).
- Web gate: `cd LMS/tochka-sborki/web && npx tsc --noEmit && npx vitest run && npx next build`
  (тест JSON-импорта проходит vitest; эмиттер .mjs — standalone, tsc его не тайпчекает,
  smoke-прогон `node scripts/hero-copy-prompt.mjs` в плане).
- Trunk-based `main`, один коммит. **Ops:** git только через PowerShell tool (bash-git висит).

## Out of scope

Правка живой hero-копии в `dictionaries.ts`/home-page (её пишет владелец из промпта), npm-скрипт
(запуск `node scripts/…` как у соседей), новые рамки/возражения сверх названных, A/B-тест-инфра.
