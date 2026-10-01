# Файлы правил агента в кросс-агентном проекте: best practice на 2026-09-28

Повод: решение владельца 2026-09-28 — «сделай рисерч, какая сейчас best practice, и прими решение
сам». Нужна одна схема для стартера студента «Точки Сборки» (`packs/tochka-sborki/starter/`)
и для уроков курса. До этой правки стартер уже жил на `AGENTS.md` + `CLAUDE.md` = `@AGENTS.md`,
а уроки 02/u3 и 05/u3 учили другому: «CLAUDE.md — контекст, AGENTS.md — инструкции».

Метка **[V]** — документация вендора, **[B]** — блог или сообщество. Все страницы открыты 2026-09-28.

## Что говорят источники

**AGENTS.md — общий стандарт.**
- [V] https://agents.md — формат стюардирует Agentic AI Foundation (Linux Foundation). Его
  читают Codex, Cursor, GitHub Copilot, Jules, Aider, Zed, Warp, Devin и другие. Если файлов
  несколько, главнее ближайший к рабочей папке.
- [V] Codex, https://learn.chatgpt.com/docs/agent-configuration/agents-md — старый адрес
  `developers.openai.com/codex/guides/agents-md` отдаёт 308 на эту страницу.
  - Сначала глобальный `~/.codex/AGENTS.md` (или `AGENTS.override.md`).
  - Затем цепочка от корня git до текущей папки; ближние к ней файлы читаются позже и
    перекрывают дальние.
  - Лимит `project_doc_max_bytes` — 32 KiB.
- [V] Cursor, https://cursor.com/docs/context/rules — читает `AGENTS.md` в корне и в
  подпапках; рядом есть свои правила `.cursor/rules/*.mdc`.
- [V] GitHub Copilot, https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
  — побеждает ближайший `AGENTS.md`. В VS Code вложенные `AGENTS.md` пока экспериментальные и
  по умолчанию выключены: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- [V] Antigravity, https://www.antigravity.google/docs/rules — правила workspace: `AGENTS.md`,
  `GEMINI.md` или `.agents/rules/`. Лимит — 24 000 байт на файл.
- [V] Gemini CLI, https://geminicli.com/docs/cli/gemini-md/ — сам читает `GEMINI.md`. Чтобы
  читал `AGENTS.md`, нужна настройка `context.fileName` в `.gemini/settings.json`.
- [V] Hermes, https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files
  — берёт первый найденный из `.hermes.md` → `AGENTS.override.md` → `AGENTS.md` → `CLAUDE.md`.
  Своя память (`~/.hermes/memories/`) попадает в промпт снимком на старте сессии.

**Claude Code.** Источник — [V] https://code.claude.com/docs/en/memory.
- **Сам читает `AGENTS.md` с v2.1.277**, но только если ни в рабочей папке, ни выше нет
  `CLAUDE.md`, `.claude/CLAUDE.md` или `CLAUDE.local.md`.
  - Ловушка: личный `CLAUDE.local.md` выключает чтение `AGENTS.md`.
  - В сессиях до v2.1.277, в первую сессию после обновления и при выключенном плагине
    `agents-md` читается только `CLAUDE.md`.
- Официальный путь «один файл для всех инструментов» — `CLAUDE.md` рядом с `AGENTS.md` со
  строкой `@AGENTS.md`, а ниже неё — то, что нужно только Claude. Документация прямо пишет,
  что такой импорт можно оставить: `AGENTS.md` не будет прочитан дважды.
- Symlink вместо импорта на Windows не советуют: git без `core.symlinks` превращает ссылку в
  однострочный текстовый файл.
- Размер: «target under 200 lines per CLAUDE.md file». Импортированные файлы тоже
  грузятся на старте, поэтому деление на импорты контекст не экономит.
- Слои:
  - managed policy → `~/.claude/CLAUDE.md` (личное, для всех проектов) → `./CLAUDE.md` →
    `CLAUDE.local.md`;
  - файлы в подпапках подгружаются, когда агент читает файлы там;
  - `.claude/rules/` с `paths:` — правила для отдельных путей.
- Auto memory: `~/.claude/projects/<проект>/memory/MEMORY.md` пишет сам Claude. На старте
  грузятся первые 200 строк или 25 KB. Память локальная: в git её нет, другие агенты её не видят.
- Hooks, [V] https://code.claude.com/docs/en/hooks — то, что SessionStart печатает в stdout,
  попадает в контекст. В memory-доке прямо сказано: hook, который печатает сам `AGENTS.md`,
  надо убрать, иначе в контексте окажутся две копии.

**Codex, hooks и память.**
- [V] Hooks, https://learn.chatgpt.com/docs/hooks:
  - hooks проекта лежат в `<repo>/.codex/hooks.json`;
  - stdout SessionStart добавляется в контекст;
  - hook запускается только после того, как ты доверишь проект и одобришь его в `/hooks`
    (одобрение привязано к хэшу).
- [B] На GitHub открыты issue, что SessionStart из repo-local config срабатывает не всегда.
  Поэтому на hook как на единственный канал полагаться нельзя.
- [V] Memories, https://learn.chatgpt.com/docs/customization/memories — по умолчанию
  выключены. Дословно: «Keep required team guidance in AGENTS.md… Treat memories as a helpful recall layer».

**Память между сессиями.**
- [V, инженерный блог вендора] Anthropic, «Effective harnesses for long-running agents»
  (2025-11-26), https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
  - Состояние держат в файлах репозитория: progress-файл, список задач, git log.
  - Каждая сессия начинает с того, что читает их.
  - Статусы задач предлагают вести в JSON: модель реже портит его, чем Markdown.
- Встроенная память у каждого агента своя и локальная: Claude auto memory, Codex memories,
  Hermes memories. Между агентами и машинами она не переносится.

## Вывод

1. **Один канонический `AGENTS.md` в корне.** В нём и контекст проекта (кто я, проект, стек,
   как запустить), и правила. Делить «контекст в CLAUDE.md, правила в AGENTS.md» — не
   стандарт ни одного вендора: Codex, Cursor, Copilot, Antigravity и Hermes увидели бы только
   половину.
2. **`CLAUDE.md` = строка `@AGENTS.md`, ниже — только то, что нужно одному Claude Code.**
   Нативного чтения `AGENTS.md` (v2.1.277+) хватило бы новой версии. Импорт надёжнее: работает
   в любой версии и в любой сессии, не ломается от `CLAUDE.local.md`, и его официально
   советуют для Windows. Двойного чтения не будет, это прописано в документации.
3. **Длина — до ~200 строк.** Ориентир Anthropic; у Codex жёсткий предел 32 KiB, у
   Antigravity — 24 000 байт.
4. **Личное — в глобальный файл своего агента** (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`,
   `~/.gemini/GEMINI.md`), а не в проект.
5. **Память между сессиями — файлы в git:** `STATE.md` (где остановились) и `TODO.md`
   (задачи). Их читает любой агент. Встроенная память агента (MEMORY.md у Claude) — личный
   дополнительный слой, а не место для того, что обязано сработать.
6. **Hook начала сессии печатает `STATE.md` и `TODO.md`, но не `AGENTS.md`**, иначе будет
   двойная копия. Hook — ускоритель, а не единственный канал: то же правило записано словами
   в `AGENTS.md`.
7. **Вложенные `AGENTS.md` в подпапках** поддерживают все, кроме VS Code по умолчанию. Это
   приём для большого проекта; в стартере его нет.

Отложено (решает владелец): поддержка Gemini CLI одной строкой `.gemini/settings.json`
(`{"context":{"fileName":["AGENTS.md"]}}`). Сейчас стартер перечисляет четыре агента
(Claude Code, Codex, Antigravity, Hermes); Gemini CLI в их число не входит.
**Добавлено 2026-09-28** (ветка `w20/starter-gemini`, решение контроллера по делегированию владельца):
`.gemini/settings.json` = `{"context": {"fileName": ["AGENTS.md", "GEMINI.md"]}}` в обоих изданиях —
`GEMINI.md` оставлен, потому что `context.fileName` заменяет имя по умолчанию. Hook для Gemini CLI
стартер не подключает. Trusted folders: по документации функция выключена по умолчанию; в недоверенной
папке `.gemini/settings.json` не загружается — это сказано в README стартера.

Не проверено: читает ли Cursor `CLAUDE.md`; что главнее в Antigravity, `GEMINI.md` или
`AGENTS.md` (порядок есть только в блогах [B]).
