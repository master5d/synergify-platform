```
████████╗ ██████╗  ██████╗██╗  ██╗██╗  ██╗ █████╗
   ██╔══╝██╔═══██╗██╔════╝██║  ██║██║ ██╔╝██╔══██╗
   ██║   ██║   ██║██║     ███████║█████╔╝ ███████║
   ██║   ██║   ██║██║     ██╔══██║██╔═██╗ ██╔══██║
   ██║   ╚██████╔╝╚██████╗██║  ██║██║  ██╗██║  ██║
   ╚═╝    ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝

 ███████╗██████╗  ██████╗ ██████╗ ██╗  ██╗██╗
 ██╔════╝██╔══██╗██╔═══██╗██╔══██╗██║ ██╔╝██║
 ███████╗██████╔╝██║   ██║██████╔╝█████╔╝ ██║
 ╚════██║██╔══██╗██║   ██║██╔══██╗██╔═██╗ ██║
 ███████║██████╔╝╚██████╔╝██║  ██║██║  ██╗██║
 ╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝
```

<div align="center">

**Agentic-AI Course · 9 тем · agent-agnostic (Claude Code / Sovereign / Cloud-OSS / Behind-GFW) · RU + EN**

[![Deploy](https://img.shields.io/badge/deploy-Cloudflare_Pages-orange?style=flat-square&logo=cloudflare)](https://ai.synergify.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

</div>

---

## О курсе

**Точка Сборки** — практический курс по вайб-кодингу. Освоение Claude Code, MCP-серверов, агентов и автоматизации через 8 элективных тем и 33 когнитивных юнита.

Каждая тема разбита на юниты по циклу Колба: **Активация → Рефлексия → Концепция → Практика**. Темы независимы — выбирай в любом порядке.

## Темы

```
9 тем × 3–5 юнитов = 39 когнитивных юнитов

Kickstart                — карта AI-мира для нонкодеров + гигиена источников
Знакомство               — Software 3.0, четыре сдвига
Базовый сетап            — рабочая среда, Claude Code CLI
Выбор стека              — какой agentic-стек под твои ограничения, обход блокировок
Промпт-инжиниринг        — формулировка ТЗ, магические слова
Контекст и память        — память агента, CLAUDE.md, sub-agents
Pipeline автоматизации   — URL → scrape → analyze → insights
Инструменты расширения   — MCP, Hooks, Skills, Superpowers
Агентский инжиниринг     — оркестрация, prod-инфра (ENERV/SOVERN)
```

Счётчик держится тестами: `registry-integrity` сверяет `_meta.json` с файлами
и парность локалей, `skins-coverage` — покрытие юнитов во всех скин-паках.

## Стек

| Слой | Технология |
|------|-----------|
| LMS (web) | Next.js 16 App Router · `output: export` · MDX |
| Контент | Markdown / MDX · Kolb-cycle unit structure |
| Стилизация | CSS Custom Properties · Geist Mono |
| Хостинг | Cloudflare Pages |
| CI/CD | GitHub Actions |
| Тесты | Vitest |

## Быстрый старт

```bash
git clone https://github.com/master5d/tochka-sborki.git
cd tochka-sborki/web
npm install
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000)

## Разработка контента

Каждый модуль — папка в `web/content/ru/`:

```
web/content/ru/
  01-introduction/
    _meta.json          ← метаданные модуля (title, module, units[])
    u1-activation.mdx   ← юнит 1
    u2-four-shifts.mdx  ← юнит 2
    ...
```

MDX-юнит использует `<Phase>` компоненты:

```mdx
<Phase type="activation">
  Вопрос для разогрева...
</Phase>

<Phase type="reflection">
  Рефлексия...
</Phase>

<Phase type="concept">
  Теория...
</Phase>

<Phase type="practice">
  Практическое задание...
</Phase>
```

## Команды

```bash
npm run dev          # dev-сервер
npm run build        # production build (static export)
npm test             # vitest
```

## Деплой

Push в `main` → GitHub Actions → Cloudflare Pages автоматически.

---

<div align="center">
  <sub>Сделано с Claude Code · <a href="https://ai.synergify.com">ai.synergify.com</a></sub>
</div>
