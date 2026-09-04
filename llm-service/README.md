# lms-llm

Узкий LLM-сервис для `lms-engine`. Живёт на hetzner в `sovern-net`, ходит в
SOVERN-гейтвей по тайнету. Наружу выставлен `enerv-tunnel` как
`lms-llm.mamaev.coach` за CF Access.

Зачем он есть: Cloudflare Worker с эджа не достаёт до тайнета, а выставлять
гейтвей наружу запрещено (см. спеку). Сервис публикует четыре узкие операции
с фиксированными промптами — не интерфейс к гейтвею.

Дизайн: `NAUTILUS/docs/superpowers/specs/2026-09-04-lms-llm-service-design.md`

## Эндпоинты

Все, кроме `/health`, требуют `Authorization: Bearer $API_TOKEN`.

| Метод | Путь | Тело | Ответ |
|---|---|---|---|
| GET | `/health` | — | `{ok:true}` |
| POST | `/prose` | `ProseInput` | `{legendaryTitle,backstory,firstQuest,finalBoss}` |
| POST | `/skin` | `{film}` | `{skin}` |
| POST | `/demand/classify` | `{signals,catalog}` | `{items:[...]}` |
| POST | `/demand/brief` | `{topicLabel,quotes,catalog}` | `BriefProposal` |

## Коды ошибок

**502 — проблема апстрима** (гейтвей, сеть, парсинг):
- `gateway_unreachable` — гейтвей недоступен
- `gateway_error` — гейтвей вернул ошибку
- `unparsable` — ответ гейтвея невозможно распарсить
- `bad_shape` — ответ гейтвей не соответствует схеме
- `timeout` — таймаут при обращении к гейтвею

**500 — баг в сервисе**:
- `internal` — непредвиденная ошибка внутри lms-llm

Ответ всегда с `{error:{code,message}}`.

## Локально

    npm install && npm test
    cp .env.example .env   # заполнить GATEWAY_API_KEY и API_TOKEN
    npm start
