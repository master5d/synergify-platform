// packs/tochka-sborki/course/starter.ts
// Данные страницы «Стартер» (/starter). Отображение — components/starter-guide.tsx.
// Сам архив собирается из packs/tochka-sborki/starter.json (scripts/build-starter.mjs);
// тест packs/tochka-sborki/starter.test.ts сверяет, что ссылка на скачивание совпадает с архивом.
//
// Колонка «что прочитает агент» — ТОЛЬКО то, что написано в официальной документации
// агента (ссылки в `sources`). Проверено 2026-09-28. Живым запуском в распакованном
// стартере: Claude Code — правила через @AGENTS.md и hook; Codex — правила (hook Codex
// до одобрения через /hooks не запускается, одобрение — интерактивное). Непроверенное не обещаем.
import type { StarterData } from '@/lib/starter/types'

export const STARTER: StarterData | null = {
  archive: '/downloads/tochka-starter.zip',
  folder: 'tochka-starter',
  eyebrow: { ru: 'стартер студента', en: 'student starter' },
  heading: { ru: 'Стартер: проект для курса с любым агентом', en: 'Starter: a course project for any agent' },
  intro: [
    {
      ru: 'Готовая папка проекта, с которой можно пройти весь курс: файл правил агента, память между сессиями, папка для практик, шаблоны и чек-лист гигиены. Работает с Claude Code, Codex, Antigravity, Hermes и любым агентом, который читает AGENTS.md.',
      en: 'A ready project folder for the whole course: an agent rules file, memory between sessions, a folder for practice results, templates and a hygiene checklist. Works with Claude Code, Codex, Antigravity, Hermes and any agent that reads AGENTS.md.',
    },
    {
      ru: 'Ничего не устанавливает и не пишет в твою домашнюю папку. Ключей в нём нет. Агента, Node.js и Git ставит установщик из урока «Установка».',
      en: 'It installs nothing and never writes to your home folder. There are no keys inside. The agent, Node.js and Git come from the installer in the Install lesson.',
    },
  ],
  steps: [
    {
      title: { ru: 'Скачай и распакуй', en: 'Download and unzip' },
      body: {
        ru: 'Распакуй архив туда, где будешь работать. Папку tochka-starter можно переименовать.',
        en: 'Unzip the archive where you will work. You can rename the tochka-starter folder.',
      },
    },
    {
      title: { ru: 'Открой в своём агенте', en: 'Open it in your agent' },
      body: {
        ru: 'Сначала сделай из папки git-репозиторий: Codex и Hermes ищут файл правил от корня репозитория. Потом запусти агента в корне папки — как именно, смотри во вкладке своего агента.',
        en: 'First turn the folder into a git repository: Codex and Hermes look for the rules file from the repository root. Then start your agent in the folder root; see your agent’s tab for how.',
      },
    },
    {
      title: { ru: 'Первая команда', en: 'First command' },
      body: {
        ru: 'Отправь агенту промпт ниже. Он прочитает правила и память проекта и задаст три вопроса, чтобы заполнить AGENTS.md вместе с тобой.',
        en: 'Send the prompt below. The agent reads the project rules and memory and asks three questions to fill in AGENTS.md with you.',
      },
    },
  ],
  gitInit: 'cd tochka-starter\ngit init\ngit add .\ngit commit -m "course starter"',
  firstPrompt: {
    ru: 'Прочитай файл правил проекта и STATE.md. Расскажи, что ты теперь знаешь о проекте, и задай мне три вопроса, чтобы заполнить AGENTS.md.',
    en: 'Read the project rules file and STATE.md. Tell me what you now know about the project and ask me three questions to fill in AGENTS.md.',
  },
  agents: [
    {
      id: 'claude-code',
      name: 'Claude Code',
      command: 'claude',
      open: { ru: 'В терминале перейди в папку и запусти claude. При первом запуске он спросит, доверяешь ли ты папке.', en: 'In the terminal, go to the folder and run claude. On first launch it asks whether you trust the folder.' },
      reads: {
        ru: 'CLAUDE.md. В нём одна строка @AGENTS.md — она подключает общий файл правил целиком.',
        en: 'CLAUDE.md. Its single line @AGENTS.md imports the shared rules file in full.',
      },
      hook: {
        ru: 'Есть: .claude/settings.json запускает hook начала сессии, и агент сразу видит STATE.md и TODO.md.',
        en: 'Yes: .claude/settings.json runs the session-start hook, so the agent sees STATE.md and TODO.md right away.',
      },
      sources: [
        { label: 'Claude Code — memory, AGENTS.md', href: 'https://code.claude.com/docs/en/memory' },
        { label: 'Claude Code — hooks', href: 'https://code.claude.com/docs/en/hooks' },
      ],
    },
    {
      id: 'codex',
      name: 'Codex',
      command: 'codex',
      open: { ru: 'В терминале перейди в папку и запусти codex.', en: 'In the terminal, go to the folder and run codex.' },
      reads: {
        ru: 'AGENTS.md — ищет его от корня git-репозитория до текущей папки.',
        en: 'AGENTS.md, searched from the git repository root down to the current folder.',
      },
      hook: {
        ru: 'Есть: .codex/hooks.json. Codex запустит hook только после того, как ты доверишь проект и одобришь hook командой /hooks. До этого правило «прочитай STATE.md» в AGENTS.md делает ту же работу.',
        en: 'Yes: .codex/hooks.json. Codex runs it only after you trust the project and approve the hook with /hooks. Until then the “read STATE.md” rule in AGENTS.md does the same job.',
      },
      sources: [
        { label: 'Codex — AGENTS.md', href: 'https://developers.openai.com/codex/guides/agents-md' },
        { label: 'Codex — hooks', href: 'https://developers.openai.com/codex/hooks' },
      ],
    },
    {
      id: 'antigravity',
      name: 'Antigravity',
      open: { ru: 'Открой папку как workspace и напиши промпт в панели агента.', en: 'Open the folder as a workspace and type the prompt in the agent panel.' },
      reads: {
        ru: 'AGENTS.md — как правила workspace.',
        en: 'AGENTS.md, as workspace rules.',
      },
      hook: {
        ru: 'Стартер на hooks Antigravity не рассчитывает: память подхватывается правилом в AGENTS.md.',
        en: 'The starter does not rely on Antigravity hooks: memory is picked up by the rule in AGENTS.md.',
      },
      sources: [{ label: 'Antigravity — rules', href: 'https://www.antigravity.google/docs/rules' }],
    },
    {
      id: 'hermes',
      name: 'Hermes',
      command: 'hermes',
      open: { ru: 'В терминале перейди в папку и запусти hermes.', en: 'In the terminal, go to the folder and run hermes.' },
      reads: {
        ru: 'AGENTS.md. Из .hermes.md, AGENTS.md и CLAUDE.md Hermes берёт первый найденный, и в стартере это AGENTS.md.',
        en: 'AGENTS.md. Hermes loads the first of .hermes.md, AGENTS.md and CLAUDE.md it finds; in the starter that is AGENTS.md.',
      },
      hook: {
        ru: 'Нет: hooks Hermes настраиваются в ~/.hermes/, а не в проекте. Память подхватывается правилом в AGENTS.md.',
        en: 'No: Hermes hooks live in ~/.hermes/, not in the project. Memory is picked up by the rule in AGENTS.md.',
      },
      sources: [{ label: 'Hermes — context files', href: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files' }],
    },
  ],
  files: [
    { path: 'AGENTS.md', what: { ru: 'Единый файл правил: кто ты, что за проект, как работать', en: 'The single rules file: who you are, the project, how to work' }, lesson: '/lessons/02-setup-guide/u3-first-project/' },
    { path: 'CLAUDE.md', what: { ru: 'Одна строка @AGENTS.md для Claude Code', en: 'One line, @AGENTS.md, for Claude Code' } },
    { path: 'TODO.md', what: { ru: 'Текущие задачи', en: 'Current tasks' }, lesson: '/lessons/05-context-memory/u3-memory/' },
    { path: 'STATE.md', what: { ru: 'Память между сессиями: где остановились', en: 'Memory between sessions: where you stopped' }, lesson: '/lessons/05-context-memory/u4-practice/' },
    { path: 'HYGIENE.md', what: { ru: 'Чек-лист гигиены перед «Пенделем»', en: 'Hygiene checklist before the “Pendel” practice' }, lesson: '/lessons/07-tools/u6-pendel/' },
    { path: 'my-experiments/', what: { ru: 'Сюда курс просит сохранять результаты практик', en: 'Where the course asks you to save practice results' } },
    { path: 'my-templates/', what: { ru: 'Устав агента, рецепты автоматизации, шаблоны отзывов', en: 'Agent charter, automation recipes, feedback templates' } },
    { path: 'hooks/session-start.mjs', what: { ru: 'Hook: показывает агенту STATE.md и TODO.md в начале сессии', en: 'Hook: shows STATE.md and TODO.md at session start' }, lesson: '/lessons/07-tools/u3-hooks/' },
    { path: '.claude/settings.json · .codex/hooks.json', what: { ru: 'Подключают этот hook в Claude Code и Codex', en: 'Wire that hook into Claude Code and Codex' } },
    { path: '.gitignore', what: { ru: 'Не пускает в git ключи (.env) и личные настройки агента', en: 'Keeps keys (.env) and personal agent settings out of git' } },
  ],
  honest: {
    heading: { ru: 'Честно о границах', en: 'Honest limits' },
    items: [
      {
        ru: 'Hook — это команда, которая запускается на твоём компьютере. Прежде чем одобрить, открой hooks/session-start.mjs: он только читает два файла и печатает их. Для запуска нужен Node.js.',
        en: 'A hook is a command that runs on your computer. Before approving it, open hooks/session-start.mjs: it only reads two files and prints them. It needs Node.js.',
      },
      {
        ru: 'В уроках часто написано «CLAUDE.md». В стартере правила живут в AGENTS.md: где урок говорит «добавь в CLAUDE.md», добавляй в AGENTS.md — так правило увидит любой агент.',
        en: 'Lessons often say “CLAUDE.md”. In the starter the rules live in AGENTS.md: where a lesson says “add to CLAUDE.md”, add it to AGENTS.md so every agent sees it.',
      },
      {
        ru: 'Что агент читает при старте, мы взяли из его официальной документации. Агенты обновляются: если твой ведёт себя иначе, первая команда всё равно просит его прочитать файлы явно.',
        en: 'What each agent reads at start comes from its official documentation. Agents change: if yours behaves differently, the first command still asks it to read the files explicitly.',
      },
    ],
  },
  related: [
    { href: '/lessons/02-setup-guide/u2-install/', label: { ru: '02 · Установка стека', en: '02 · Installing the stack' } },
    { href: '/lessons/02-setup-guide/u3-first-project/', label: { ru: '02 · Первый проект', en: '02 · First project' } },
    { href: '/lessons/05-context-memory/u3-memory/', label: { ru: '05 · Система памяти', en: '05 · Memory system' } },
    { href: '/lessons/07-tools/u3-hooks/', label: { ru: '07 · Hooks', en: '07 · Hooks' } },
    { href: '/lessons/07-tools/u6-pendel/', label: { ru: '07 · Пендель', en: '07 · Pendel' } },
  ],
}
