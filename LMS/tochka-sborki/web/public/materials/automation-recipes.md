# 🤖 Automation Recipes

> Три рецепта автоматизаций, которые дают ощутимую экономию времени (5–15 ч/нед). Все построены на паттерне **Trigger → Action** (см. Meeting 5).

Инструмент по умолчанию — [Make.com](https://make.com) (бесплатные 1000 operations/мес, 10000 по промо-ссылкам). Альтернативы: Zapier, n8n, или Claude Code + hooks + MCP-серверы.

---

## Recipe 1: Content Generation + Auto-Post в соц. сети

**Экономит:** 5–10 ч/нед на контент-маркетинге.

### Что делает

Ты пишешь идею поста в одну ячейку Google Sheet → через минуту пост (текст + картинка) публикуется в LinkedIn / Instagram / Facebook.

### Trigger → Action

| | |
| --- | --- |
| **Trigger** | Новая строка в Google Sheet со статусом `ready` |
| **Action 1** | ChatGPT генерирует текст поста по идее |
| **Action 2** | DALL·E / Midjourney генерирует картинку |
| **Action 3** | Публикация в соц. сети (LinkedIn / IG / FB) |
| **Action 4** | Статус строки → `posted`, записать URL поста |

### Infra

- **Google Sheets** (или Airtable / SmartSheets) — хранилище идей и статусов
- **Make.com** — оркестратор сценария
- **OpenAI API** (ChatGPT + DALL·E) — генерация
- **Соц. платформы:**
  - Facebook — только Pages
  - Instagram — только Business Profiles
  - LinkedIn — Personal + Company Page

### Колонки в Sheet

```
| idea | status  | post_text | image_url | platform | posted_url |
```

### Промпт для ChatGPT

```
Role: виральный соц. копирайтер
Objective: превратить идею в пост для [LinkedIn / IG / FB]
Context: аудитория — [твоя ЦА]
Instructions:
  - начни с hook (первые 2 строки)
  - раскрой идею через storyline
  - закончи CTA
  - длина: LinkedIn до 1300 символов / IG до 2200 / FB до 500
Notes:
  - без emoji-спама
  - без #хештегов больше 5
```

### Шаги реализации

1. Создать Google Sheet с колонками выше
2. Make.com → New Scenario → Trigger: **Google Sheets > Watch New Rows**
3. Action: **OpenAI > Create Completion** (промпт выше, data = `{{idea}}`)
4. Action: **OpenAI > Create Image** (prompt на основе `{{post_text}}`)
5. Action: **LinkedIn / Instagram / Facebook > Create Post**
6. Action: **Google Sheets > Update Row** — записать `posted_url`, статус → `posted`

---

## Recipe 2: Auto-Reply Email (черновики в Drafts)

**Экономит:** 2–4 ч/день на email-рутине.

### Что делает

Новое письмо в Gmail → ChatGPT читает → формирует ответ → сохраняет как **черновик** (не отправляет). Ты только нажимаешь Send после финальной проверки.

### Trigger → Action

| | |
| --- | --- |
| **Trigger** | Новое письмо в Gmail inbox (фильтр: label или sender) |
| **Action 1** | ChatGPT читает subject + body |
| **Action 2** | ChatGPT формирует ответ в твоём стиле |
| **Action 3** | Gmail → сохранить черновик в Drafts |

### Почему черновик, а не отправка

- Human-in-the-loop: ты контролируешь финальный tone
- Без рисков отправить галлюцинацию клиенту
- Exit velocity как для "отправить" — 1 клик

### Промпт для ChatGPT

```
Role: ассистент, пишущий ответы в моём стиле
Objective: составить черновик ответа на письмо ниже
Context:
  - мой тон: [дружеский / формальный / деловой]
  - мой язык: [русский / английский / mix]
  - мои frequent phrases: [список]
Instructions:
  - прочитай subject + body
  - определи intent письма (вопрос / запрос / инфо)
  - напиши ответ 3–6 предложений
  - если нужна информация, которую я не дал — оставь placeholder [UNCLEAR: ...]
Notes:
  - не обещай сроки, которые я не подтвердил
  - не делись конфиденциальной инфой
  - подпись: [твоя подпись]

---
FROM: {{email.from}}
SUBJECT: {{email.subject}}
BODY: {{email.body}}
```

### Шаги реализации

1. Make.com → Trigger: **Gmail > Watch Emails** (filter: `label:inbox -from:me`)
2. Action: **OpenAI > Chat Completion** (промпт выше)
3. Action: **Gmail > Create Draft** (to = `{{email.from}}`, subject = `Re: {{email.subject}}`, body = output)

### Vибрация для Claude Code

То же самое можно собрать локально через Claude Code + MCP-сервер для Gmail. Преимущество: не отдаёшь переписку третьему сервису.

---

## Recipe 3: Personalized Cold Email Outreach

**Экономит:** 5–15 ч/нед на sales-аутриче. **Внимание:** используй только если это твой реальный бизнес-процесс, и уважай правила отправки (opt-out, GDPR, no spam).

### Что делает

Список компаний в Google Sheet → для каждой: находим decision maker'а → ChatGPT пишет персонализированное письмо → отправка в Gmail → логирование.

### Trigger → Action

| | |
| --- | --- |
| **Trigger** | Новая строка в Sheet (company domain + role) |
| **Action 1** | Apollo.io — найти контакт по домену + роли |
| **Action 2** | Apollo.io — получить публичные данные о компании |
| **Action 3** | ChatGPT — составить персонализированное письмо |
| **Action 4** | Gmail — отправить (или сохранить в Drafts) |
| **Action 5** | Sheet — записать статус + дату отправки |

### Infra

- **Apollo.io** — B2B data (поиск контактов по домену)
- **Google Sheets** — список целей + статусы
- **Make.com** — оркестратор
- **OpenAI API** — генерация письма
- **Gmail / Outlook** — отправка

### Промпт для ChatGPT

```
Role: B2B SDR, пишущий короткие релевантные первые письма
Objective: написать cold email для {{contact.first_name}} в {{company.name}}
Context:
  - я предлагаю: [твой продукт / услуга в 1 предложении]
  - моя value prop для их роли ({{contact.title}}): [что получит]
  - моя компания: [1-2 предложения]
Instructions:
  - subject: < 6 слов, без clickbait
  - opener: конкретная деталь о них (из Apollo data)
  - 2-3 предложения value prop привязанное к их контексту
  - CTA: один простой вопрос (не "когда у вас 15 минут?")
  - подпись: [твоя]
  - длина: не более 90 слов в body
Notes:
  - никакого "I hope this email finds you well"
  - без превосходных степеней ("revolutionary", "best-in-class")
  - если их компания маленькая — не используй тон для enterprise
```

### Шаги реализации

1. Google Sheet: колонки `company_domain | target_role | status | sent_date | contact_email | subject | body`
2. Make.com → Trigger: **Google Sheets > Watch New Rows**
3. Action: **Apollo.io > Search People** (domain + role)
4. Action: **Apollo.io > Get Company** (domain)
5. Action: **OpenAI > Chat Completion** (промпт выше с данными из Apollo)
6. Action: **Gmail > Send Email** (или Create Draft для ручной проверки)
7. Action: **Google Sheets > Update Row** (status, sent_date, email, subject, body)

### Правила приличия

- **Всегда** opt-out ссылка/строка
- **Не больше** 50 писем/день с одного адреса (warm-up)
- **Сегментируй** по role + industry, не шли одинаковое всем
- Проверяй **GDPR / CAN-SPAM** для твоих юрисдикций

---

## 🧰 Альтернатива: те же рецепты в Claude Code

Если не хочешь платить за Make.com и готов поддерживать локально:

| Компонент Make.com | Аналог в Claude Code |
| --- | --- |
| Trigger: Watch Sheet | Hook на schedule / MCP Google Sheets |
| Action: ChatGPT | Claude Code сессия с промптом |
| Action: Gmail | MCP Gmail server |
| Action: LinkedIn | MCP LinkedIn / web-scraping |
| Storage | Local files / Git |

Плюсы: полный контроль, без сторонних сервисов, код в Git.
Минусы: ты сам поддерживаешь infra.

---

## 🎯 Что дальше

1. Выбери **один** рецепт, который экономит тебе больше всего времени.
2. Построй его за вечер (даже если сыро).
3. Измерь через неделю: сколько часов экономит реально?
4. Если >2 ч/нед — оставляй. Если нет — удаляй без сожалений.

> 💡 Не строй все три сразу. Лучше один работающий, чем три заброшенных.
