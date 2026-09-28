# Стартер студента «Точки Сборки»

Заготовка проекта, с которой можно пройти весь курс с любым агентом: Claude Code, Codex,
Antigravity, Hermes или другим, который читает `AGENTS.md`. Ничего не устанавливает, ключей
не содержит, в домашнюю папку и глобальные настройки не пишет: всё лежит в этой папке.

## Три шага

1. **Распакуй** архив туда, где будешь работать (например, в домашнюю папку). Переименуй
   папку `tochka-starter` во что хочешь.
2. **Сделай из папки git-репозиторий** и открой её в своём агенте. Codex и Hermes ищут
   файл правил от корня git-репозитория, поэтому `git init` лучше сделать сразу:
   ```
   cd tochka-starter
   git init
   git add .
   git commit -m "стартер курса"
   ```
   Дальше запусти агента **в корне этой папки**: `claude`, `codex` или `hermes`;
   в Antigravity — открой папку как workspace.
3. **Первая команда агенту:**
   ```
   Прочитай файл правил проекта и STATE.md. Расскажи, что ты теперь знаешь о проекте,
   и задай мне три вопроса, чтобы заполнить AGENTS.md.
   ```
   Ответь на вопросы, попроси агента вписать ответы в `AGENTS.md` — это твой первый шаг в курсе.

## Что внутри

| Файл | Зачем | Где в курсе |
|------|-------|-------------|
| `AGENTS.md` | **Единый файл правил.** Кто ты, что за проект, как работать, чего не делать | 02/u3, 05/u3 |
| `CLAUDE.md` | Одна строка `@AGENTS.md`: Claude Code подключает общий файл правил | 02/u3 |
| `TODO.md` | Текущие задачи: сейчас, дальше, готово | 05/u3 |
| `STATE.md` | Память между сессиями: что сделано, где остановились, что мешает | 05/u3, 05/u4 |
| `HYGIENE.md` | Чек-лист гигиены проекта — перед практикой «Пендель» | 07/u6 |
| `my-experiments/` | Сюда курс просит сохранять результаты практик | все модули |
| `my-templates/` | Проверенные шаблоны: устав агента, рецепты автоматизации, отзывы | 01, 08, упражнения |
| `hooks/session-start.mjs` | Показывает агенту `STATE.md` и `TODO.md` в начале сессии | 07/u3 |
| `.claude/settings.json` | Подключает этот hook в Claude Code | 07/u3 |
| `.codex/hooks.json` | Подключает этот же hook в Codex | 07/u3 |
| `.gitignore` | Не пускает в git ключи (`.env`), личные настройки агента и мусор | 07/u6 |

В уроках курса часто написано «CLAUDE.md». В стартере все правила живут в `AGENTS.md`, а
`CLAUDE.md` только подключает его. Где урок говорит «добавь в CLAUDE.md» — добавляй в `AGENTS.md`:
так правило увидит любой агент, а не только Claude Code.

## Что прочитает твой агент при старте

Проверено по официальной документации (ссылки ниже). Стартер не обещает больше, чем в ней написано.

| Агент | Файл правил | Hook при старте сессии |
|-------|-------------|------------------------|
| **Claude Code** | `CLAUDE.md`, а через строку `@AGENTS.md` — и `AGENTS.md` | Да: `.claude/settings.json` → `SessionStart`. При первом запуске Claude Code спросит, доверяешь ли ты этой папке |
| **Codex** | `AGENTS.md` (ищет от корня git-репозитория до текущей папки) | Да: `.codex/hooks.json` → `SessionStart`. Codex запустит hook только после того, как ты доверишь проект и одобришь hook командой `/hooks` |
| **Antigravity** | `AGENTS.md` (читает его как правила workspace) | Стартер на hooks Antigravity не рассчитывает |
| **Hermes** | `AGENTS.md` (из `.hermes.md`, `AGENTS.md`, `CLAUDE.md` берёт первый найденный) | Нет: hooks Hermes настраиваются в `~/.hermes/`, не в проекте |

Если hook не сработал, ничего не теряется: в `AGENTS.md` записано правило «в начале сессии прочитай
`STATE.md` и `TODO.md`». Hook просто делает это надёжнее.

**Hook — это команда, которая запускается на твоём компьютере** (07/u3). Прежде чем одобрить
его, открой `hooks/session-start.mjs`: он только читает два файла и печатает их. Для запуска
нужен Node.js — его ставит установщик из урока 02/u2.

Источники:
- Claude Code — память и `AGENTS.md`: https://code.claude.com/docs/en/memory
- Claude Code — hooks: https://code.claude.com/docs/en/hooks
- Codex — `AGENTS.md`: https://developers.openai.com/codex/guides/agents-md
- Codex — hooks: https://developers.openai.com/codex/hooks
- Antigravity — rules: https://www.antigravity.google/docs/rules
- Hermes — context files: https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files

## Чего стартер не делает

- Не ставит агента, Node.js и Git — для этого установщик в уроке 02/u2.
- Не содержит ключей и токенов. Если курс попросит ключ, положи его в файл `.env` в этой
  папке: он уже в `.gitignore` и не попадёт в git.
- Не трогает `~/.claude`, `~/.codex` и другие глобальные настройки.

---

## In English

A project skeleton for the Tochka Sborki course that works with any agent that reads `AGENTS.md`.
Unzip it, run `git init` and start your agent (`claude`, `codex`, `hermes`, or open the folder in
Antigravity) from the folder root. First prompt: *"Read the project rules file and STATE.md. Tell me
what you now know about the project and ask me three questions to fill in AGENTS.md."*
`AGENTS.md` is the single rules file; `CLAUDE.md` only imports it with `@AGENTS.md`. The session-start
hook is wired for Claude Code (`.claude/settings.json`) and Codex (`.codex/hooks.json`, needs `/hooks`
approval); it needs Node.js. No keys, no global config changes.
