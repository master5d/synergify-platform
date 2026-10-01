# Стартер студента «Точки Сборки»

Заготовка проекта, с которой можно пройти весь курс с любым агентом: Claude Code, Codex,
Gemini CLI, Antigravity, Hermes или другим, который читает `AGENTS.md`. Ничего не устанавливает, ключей
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
   Дальше запусти агента **в корне этой папки**: `claude`, `codex`, `gemini` или `hermes`;
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
| `.gemini/settings.json` | Говорит Gemini CLI читать `AGENTS.md` (сам он ищет только `GEMINI.md`) | 02/u3 |
| `.gitignore` | Не пускает в git ключи (`.env`), личные настройки агента и мусор | 07/u6 |

Так же устроен проект в уроках курса (02/u3, 05/u3): контекст и правила живут в `AGENTS.md`, а
`CLAUDE.md` только подключает его. Правило, записанное в `AGENTS.md`, увидит любой агент.

## Что прочитает твой агент при старте

Проверено по официальной документации (ссылки ниже). Стартер не обещает больше, чем в ней написано.

| Агент | Файл правил | Hook при старте сессии |
|-------|-------------|------------------------|
| **Claude Code** | `CLAUDE.md`, а через строку `@AGENTS.md` — и `AGENTS.md`. Новые версии читают `AGENTS.md` и сами, но только если рядом нет `CLAUDE.md`; импорт работает в любой версии | Да: `.claude/settings.json` → `SessionStart`. При первом запуске Claude Code спросит, доверяешь ли ты этой папке |
| **Codex** | `AGENTS.md` (ищет от корня git-репозитория до текущей папки) | Да: `.codex/hooks.json` → `SessionStart`. Codex запустит hook только после того, как ты доверишь проект и одобришь hook командой `/hooks` |
| **Gemini CLI** | `AGENTS.md`: сам Gemini CLI ищет только `GEMINI.md`, поэтому `.gemini/settings.json` задаёт `context.fileName` = `AGENTS.md`, `GEMINI.md`. `GEMINI.md` в списке оставлен потому, что настройка заменяет имя по умолчанию: без него свой `GEMINI.md`, если ты его заведёшь, Gemini CLI бы не увидел | Нет: стартер не подключает hook для Gemini CLI. Память подхватывается правилом в `AGENTS.md` |
| **Antigravity** | `AGENTS.md` (читает его как правила workspace) | Стартер на hooks Antigravity не рассчитывает |
| **Hermes** | `AGENTS.md` (из `.hermes.md`, `AGENTS.md`, `CLAUDE.md` берёт первый найденный) | Нет: hooks Hermes настраиваются в `~/.hermes/`, не в проекте |

**Gemini CLI и доверие к папке.** В папке, которой Gemini CLI не доверяет, он не загружает
настройки проекта `.gemini/settings.json` — а значит, не узнает про `AGENTS.md`. По документации
функция Trusted folders выключена по умолчанию, и тогда настройка работает сразу. Если ты её
включил (`security.folderTrust.enabled` в `~/.gemini/settings.json`), доверь папку в диалоге при
запуске или командой `/permissions`. Не доверил — первая команда всё равно просит агента прочитать
файлы явно.

Если hook не сработал, ничего не теряется: в `AGENTS.md` записано правило «в начале сессии прочитай
`STATE.md` и `TODO.md`». Hook просто делает это надёжнее.

**Hook — это команда, которая запускается на твоём компьютере** (07/u3). Прежде чем одобрить
его, открой `hooks/session-start.mjs`: он только читает два файла и печатает их. Для запуска
нужен Node.js — его ставит установщик из урока 02/u2.

Источники:
- Claude Code — память и `AGENTS.md`: https://code.claude.com/docs/en/memory
- Claude Code — hooks: https://code.claude.com/docs/en/hooks
- Codex — `AGENTS.md`: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Codex — hooks: https://learn.chatgpt.com/docs/hooks
- Gemini CLI — `GEMINI.md` и `context.fileName`: https://geminicli.com/docs/cli/gemini-md/
- Gemini CLI — настройки проекта `.gemini/settings.json`: https://geminicli.com/docs/reference/configuration
- Gemini CLI — trusted folders: https://geminicli.com/docs/cli/trusted-folders/
- Antigravity — rules: https://www.antigravity.google/docs/rules
- Hermes — context files: https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files

## Чего стартер не делает

- Не ставит агента, Node.js и Git — для этого установщик в уроке 02/u2.
- Не содержит ключей и токенов. Если курс попросит ключ, положи его в файл `.env` в этой
  папке: он уже в `.gitignore` и не попадёт в git.
- Не трогает `~/.claude`, `~/.codex`, `~/.gemini` и другие глобальные настройки.

---

## English version

The English edition of this starter is on the course site, page `/en/starter`,
archive `tochka-starter-en.zip`.
