# Гостевой модуль в существующем курсе (module-pack wizard)

SOP для приглашённого мастера — путь от идеи до PR. Пример сквозной: Наташа
авторит модуль астрологии внутри курса «Практика в живой связи» (`living-practice`).

Всё sovereign: прозу пишет **твой собственный агент** по напечатанным промптам
(Claude Code / ChatGPT — любой). Движок детерминирован, ни одного LLM-вызова в коде.
Все CLI запускаются из `web/`.

## 0. Доступ и рамка

- Доступ мастера = **ветка или форк** репозитория. В `main` мерджит владелец,
  и только после зелёного CI. Прямых прав на запись в контент курса у мастера нет —
  это честная граница, а не недоверие.
- Модуль живёт **строго в рамках манифеста курса** — исполняемого списка правил тона
  (`packs/<course-pack>/manifest.ts`): без scarcity, без «гарантированных результатов»,
  для living-practice — без обещаний исцеления/замены терапии/сверхспособностей.
  Рамку держит гвард `lib/content/manifest-guard.test.ts` — он прогоняется по всему
  контенту и словарю pack'а.

## 1. Plan — фрактальная декомпозиция идеи

```
npx tsx scripts/module-plan-prompt.ts living-practice "модуль астрологии внутреннего неба" ru
```

Печатает промпт для твоего агента: референс-курсы домена → ICP модуля →
«для кого / вход / выход» → 3–6 юнитов с целями → готовый **ModuleOutline JSON**.
Лейблы манифеста курса уже вшиты в промпт как ограничения тона.

Ответ агента (JSON-блок) сохрани в файл, например `natasha-module.json`.

## 2. Scaffold — скелет модуля в pack

```
npx tsx scripts/author-module.ts living-practice natasha-module.json
```

CLI валидирует outline (форма слагов `NN-kebab` / `uN-kebab`, свободный номер модуля,
обе локали ru+en, de-hustle-линт) и при ошибках печатает их и выходит. Иначе создаёт:

- `content/{ru,en}/<NN-slug>/_meta.json` — как у модулей курса (level 0, ~10 мин × юниты);
- `content/{ru,en}/<NN-slug>/<uN-slug>.mdx` — стабы с frontmatter и TODO по 4 фазам;
- `content/ru/<NN-slug>/_module.json` — паспорт модуля: автор, дата, `manifest_ack: true`
  (твоё подтверждение, что рамка манифеста принята).

**No-clobber**: если хоть один целевой файл существует — отказ, ничего не пишется.
В конце CLI печатает next steps: research-промпты по каждому юниту.

## 3. Research → Draft → Review — проза юнитов

1. Для каждого юнита вставь напечатанный research-промпт в своего агента,
   ответ сохрани в `notes/<module>__<unit>.txt` (размеченный формат `CONCEPTS:/HOOK:/...`).
   Альтернатива: `research-prompt` / `draft-lesson` / `author-course` принимают
   `--outline <path.json>` (CourseOutline). Твой модуль — это курс из одного модуля:
   оберни свой ModuleOutline JSON как `{ "name": {…имя курса…}, "modules": [{ …твой модуль,
   "level": 1 }] }` (мост `moduleOutlineToCourseOutline` в `lib/authoring/outline-io.ts`) —
   и все три CLI работают поверх твоего модуля напрямую.
2. Пиши прозу юнита в 4-фазном ритме (activation → reflection → concept → practice)
   поверх стаба. Опора — AUTHORING.md (общий конвейер курса).
3. Проверка каждого файла:
   ```
   npx tsx scripts/review-lesson.ts packs/living-practice/content/ru/<NN-slug>/<uN>.mdx ru
   ```
   Печатает findings + polish-промпт для твоего агента. Итерируй до чистого.

## 4. Гварды — зелёный прогон перед PR

```
COURSE_PACK=living-practice npx vitest run
```

Ключевые гварды для твоего модуля: `manifest-guard` (рамка манифеста по контенту и
словарю + валидность `_module.json`), Kolb-coverage (4 фазы), de-hustle, links-integrity.
Красный гвард = правь текст, а не гвард.

## 5. PR

Коммить в свою ветку/форк только файлы своего модуля
(`packs/<course-pack>/content/*/<NN-slug>/`), открой PR. Владелец ревьюит и мерджит
после зелёного CI. Правки движка и чужих модулей в PR мастера не принимаются.
