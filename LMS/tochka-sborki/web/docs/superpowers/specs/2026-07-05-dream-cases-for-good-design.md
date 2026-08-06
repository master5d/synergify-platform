# AI-for-good dream-cases для conscious-ЦА (fb_650d16d2)

**Ticket:** `fb_650d16d24f16` — dream-case сиды от реального conscious/creative ICP (фидбэк
Наташи: экология, спасение животных в морозы, распознавание паттернов абьюза, помощь при
домашнем насилии). Стыкуется с ICP-пивотом fb_6a26e3f3 (светлая полярность): показать
ценностной аудитории «о чём можно мечтать» — служение, не бизнес-хасл.

## Problem

`DREAM_CASES` в `lib/course/showcase.ts` (10 кейсов) целиком про личную продуктивность и
запуск (напарник, продукт за выходные, рутина, второй мозг…). Для conscious-ЦА нет ни одного
кейса «AI во благо других» — а именно такие идеи реальный ICP назвал сам. Витрина live
(`getShowcase` → showcase-компонент, табы категорий генерятся из used keys).

## Design

**Только контент + тест. Ноль изменений компонентов/движка.**

### `lib/course/showcase.ts`

1. **Новая категория** в `CATEGORIES` (после `platform`):
   ```ts
   { key: 'for-good', label: { ru: 'Во благо', en: 'For good' } },
   ```
   `CategoryKey` union получает `'for-good'`. Таб появляется на витрине автоматически
   (categories = used keys).

2. **4 новых кейса** в конец `DREAM_CASES`, все `category: 'for-good'`,
   `tag: { ru: 'Во благо', en: 'For good' }`:

   - `eco` 🌱 «Эко-дозор своего места» / "An eco-watch for your place" —
     blurb ru: «Собери данные о среде вокруг — воздух, вода, свалки — в живую картину,
     которая двигает соседей к действию.»
     en: "Gather data about your surroundings — air, water, dumping — into a living picture
     that moves your neighbours to act."
   - `rescue` 🐾 «Сеть спасения животных» / "An animal-rescue network" —
     ru: «В морозы координируй волонтёров: карта точек, быстрые оповещения, никто не потерян.»
     en: "In a cold snap, coordinate volunteers: a map of spots, fast alerts, no one lost."
   - `pattern-shield` 🛡️ «Увидеть паттерн — назвать его» / "See the pattern — name it" —
     ru: «Помощник, который помогает человеку распознать разрушительный паттерн в отношениях
     и увидеть его со стороны.»
     en: "A helper that lets a person recognize a destructive pattern in a relationship and
     see it from the outside."
   - `safe-path` 🕊️ «Навигатор помощи» / "A help navigator" —
     ru: «Для того, кто в трудной ситуации: куда обратиться рядом с домом, шаг за шагом,
     без осуждения.»
     en: "For someone in a hard situation: where to turn near home, step by step, without
     judgment."

   Формулировки — финальные владельческие правки допустимы позже; все строки обязаны
   проходить `lintDehustle`. **Явно НЕ строим «доску позора»** из фидбэка — публичный
   шейминг против светлой полярности; кейс `pattern-shield` = распознавание для самого
   человека, не публичное обвинение.

### `lib/course/showcase.test.ts`

Добавить describe-блок:
- `for-good` присутствует в `getShowcase(loc).categories` (обе локали) — т.е. таб реально
  появится.
- ≥4 dream-кейса с `category === 'for-good'`, у каждого непустые title/blurb/tag/icon.
- **`lintDehustle` (из `@/lib/authoring/dehustle`) возвращает `[]` для title+blurb+tag
  КАЖДОГО dream- и real-кейса, обеих локалей** — закрывает существующий пробел: showcase-копи
  до сих пор не линтилась (guardrail-бонус, готовит почву fb_a1a446f5).

## Honesty frame

Кейсы живут в секции `DREAM_HEADING` «О чём можно мечтать» — явная рамка мечты, не
фейк-истории. В `REAL_CASES` ничего не добавляем (там только реальные проекты с автором).

## Global constraints

- Engine+keyed-data уже существует — только данные, локальный `Bi` шоукейса.
- De-hustle: `lintDehustle []` для всей showcase-копи; никакого шейминга/хасла.
- Sole-prop, никакого nonprofit-фрейминга.
- Web gate: `cd LMS/tochka-sborki/web && npx tsc --noEmit && npx vitest run && npx next build`.
- Trunk-based `main`, один коммит (одна задача).
- **Ops:** bash-git висит в этой сессии — git только через PowerShell tool.

## Out of scope

Реальные кейсы (REAL_CASES), новые компоненты, blog deep-dives, изменение существующих
10 dream-кейсов.
