# Meeting 3 — Выбор стека

> 💡 Этот модуль полностью живёт в MDX-формате в `web/content/{ru,en}/03-stack-selection/`. Markdown-версии нет — модуль интерактивный (StackMatrix компонент, AgentBlock-фильтрация).

## Зачем модуль

Курс перестал быть «Claude Code only». Модуль показывает 4 жизнеспособных стека для разных контекстов:

- **Claude Code** — paid, max capability ($20+/мес)
- **Sovereign (SOVERN)** — Hermes + Aider + локальные модели ($0 + железо)
- **Cloud-OSS** — Cline + OpenRouter / Cerebras free / Groq ($0–5/мес)
- **Behind-GFW** — Cerebras + Gemini Flash + local llama-server, для Mainland China без VPN

## Units

1. **u1-activation** — 5 вопросов про твои реальные ограничения (бюджет, доступ, железо, приватность, готовность настраивать)
2. **u2-stack-matrix** — Concept. Интерактивная матрица 4 стеков, decision tree, trade-offs
3. **u3-behind-gfw** — Hands-on для Mainland China: Cerebras + Gemini Flash + LiteLLM gateway + local llama-server. Без VPN.
4. **u4-hermes-sovereign** — Hermes как boss-orchestrator. SOVERN-pattern: boss держит план, workers (Aider/Cline) делают код. LiteLLM с fallback массивом.
5. **u5-migrate** — 7-дневный план миграции с любого старого стека на выбранный.

## Связь с другими модулями

- В 01-introduction добавлен callout «курс agent-agnostic»
- В 05-context-memory упоминается что CLAUDE.md — паттерн, реализованный по-разному в разных стеках
- В 06-audio-pipeline и 07-tools — callouts «case-study на Claude Code, паттерн агностичный»
- AgentToggle / AgentBlock компоненты позволяют фильтровать команды в любом уроке по выбранному стеку (`localStorage.stack`)

## SOVERN integration

Модуль выровнен с `Efforts/Ongoing/SOVERN/SOVRN-PRINCIPLES.md`:
- Free-clouds-first routing
- Local GGUF как floor
- LiteLLM gateway как единая точка входа
- Hermes как boss-worker orchestrator
- Zero-telemetry constraint (нет Cursor/Trae)
