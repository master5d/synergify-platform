# Clarity-first guardrail — ясность первична, персонализация поверх (fb_a1a446f5)

**Ticket:** `fb_a1a446f5030b` — фидбэк Наташи (реальный conscious-ICP): «я бы не делала акцент
на определённый способ обучения — способ восприятия у всех разный; ориентироваться надо на
ЯСНОСТЬ, а не на метод». Контр-сигнал к профилированию-по-стилю (методология Галкина
fb_80ebb140, themed skins, intake-профиль). Напряжение нигде не зафиксировано как норма.

## The principle

**Baseline clarity первична для ВСЕХ сегментов; персонализация (стиль, скины, профили) — слой
поверх, никогда не замена.** Любая поверхность обязана быть понятной новичку в дефолтном
состоянии, до и независимо от подстройки под стиль восприятия.

## What already enforces it (untouched — inventory, not delta)

Grep-перед-стройкой показал: кодовые guardrails частично существуют, дельта — НЕ дублировать их:
- `lib/rpg-mode.ts` — plain-mode: RPG-хром сводится к плоским словам для не-геймеров
  (`PLAIN_OVERRIDES`, `SKILL_GATING_NOTE`).
- `lib/authoring/review.ts` `lintReadability` — executable-гейт: предложения ≤25 слов,
  конкретный practice-шаг, пустые фазы.
- `lib/rpg/types.ts` `decoder` — plain-language расшифровка каждого скина.

## The delta (two point changes)

### 1. `buildPolishPrompt` — clarity-first директива (live consumer: авторский агент)

`lib/authoring/review.ts`: в обе локали промпта добавить ОДНУ строку после строки
«Подтяни: разговорный тон…»:

- ru: `Пиши так, чтобы понял любой новичок без подстройки под его стиль восприятия: ясность первична, персонализация — поверх, не вместо.`
- en: `Write so any beginner understands it without tuning to their perception style: clarity comes first, personalization sits on top — never instead.`

Каждый будущий урок, проходящий S4-polish конвейера, несёт этот принцип агенту автора.

**Тест** (`lib/authoring/review.test.ts`): для обеих локалей `buildPolishPrompt('<Phase …>', [],
loc)` содержит подстроку `ясность первична` / `clarity comes first`.

### 2. CLAUDE.md — строка-норма (live consumer: каждая агент-сессия)

В корневой `CLAUDE.md` (mc_hub), в блок принципов курса, одна строка:

> **Clarity-first guardrail (fb_a1a446f5):** baseline-ясность первична для всех сегментов;
> профилирование-по-стилю/скины/интейк-подстройка — слой поверх, никогда не замена
> (контр-сигнал реального ICP к методологии fb_80ebb140; enforce: plain-mode,
> lintReadability, polish-prompt).

Точное место — рядом с существующими content/authoring-принципами (де-хасл, anti-dependency);
исполнитель находит блок по контексту и вставляет одну строку, ничего не переписывая.

## Global constraints

- Только 2 файла кода/доков + 1 тест-правка. Никакого рефакторинга plain-mode/lintReadability.
- Копи-строки де-хасл-чистые (проверяются глазами; в lint-тест не добавляем — промпт-строки
  не проходят через `lintDehustle` конвейер, это директивы агенту).
- Web gate: `cd LMS/tochka-sborki/web && npx tsc --noEmit && npx vitest run && npx next build`.
- Trunk-based `main`, один коммит. **Ops:** git только через PowerShell tool.

## Out of scope

Аудит/правка существующих поверхностей (интейк, RPG-шок, скины — уже закрыты своими
тикетами и plain-mode), новые lint-правила, изменение методологии профилирования (она
остаётся — принцип фиксирует порядок слоёв, не отменяет верхний).
