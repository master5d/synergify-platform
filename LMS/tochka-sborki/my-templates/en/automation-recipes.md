# 🤖 Automation Recipes

> Three automation recipes that save noticeable time (5–15 h/week). All are built on the **Trigger → Action** pattern (see Meeting 5).

The steps are written for [Make.com](https://make.com) (free 1000 operations/month): the fastest no-code start. Alternatives: Zapier; n8n on your own hardware (free, self-hosted); or no cloud service at all: the OS scheduler (cron / schtasks) runs the agent in non-interactive mode, as in module 06, unit u5 "A pipeline that runs itself".

---

## Recipe 1: Content Generation + Auto-Post to social media

**Saves:** 5–10 h/week on content marketing.

### What it does

You write a post idea into one Google Sheet cell → a minute later the post (text + image) is published on LinkedIn / Instagram / Facebook.

### Trigger → Action

| | |
| --- | --- |
| **Trigger** | New row in the Google Sheet with status `ready` |
| **Action 1** | ChatGPT writes the post text from the idea |
| **Action 2** | DALL·E / Midjourney generates an image |
| **Action 3** | Publish to social media (LinkedIn / IG / FB) |
| **Action 4** | Row status → `posted`, save the post URL |

### Infra

- **Google Sheets** (or Airtable / SmartSheets): storage for ideas and statuses
- **Make.com**: scenario orchestrator
- **OpenAI API** (ChatGPT + DALL·E): generation
- **Social platforms:**
  - Facebook: Pages only
  - Instagram: Business Profiles only
  - LinkedIn: Personal + Company Page

### Sheet columns

```
| idea | status  | post_text | image_url | platform | posted_url |
```

### Prompt for ChatGPT

```
Role: viral social media copywriter
Objective: turn the idea into a post for [LinkedIn / IG / FB]
Context: audience is [your target audience]
Instructions:
  - open with a hook (first 2 lines)
  - develop the idea as a storyline
  - end with a CTA
  - length: LinkedIn up to 1300 characters / IG up to 2200 / FB up to 500
Notes:
  - no emoji spam
  - no more than 5 #hashtags
```

### Implementation steps

1. Create a Google Sheet with the columns above
2. Make.com → New Scenario → Trigger: **Google Sheets > Watch New Rows**
3. Action: **OpenAI > Create Completion** (prompt above, data = `{{idea}}`)
4. Action: **OpenAI > Create Image** (prompt based on `{{post_text}}`)
5. Action: **LinkedIn / Instagram / Facebook > Create Post**
6. Action: **Google Sheets > Update Row**: save `posted_url`, status → `posted`

---

## Recipe 2: Auto-Reply Email (drafts in Drafts)

**Saves:** 2–4 h/day on email routine.

### What it does

A new email in Gmail → ChatGPT reads it → writes a reply → saves it as a **draft** (does not send). You only press Send after a final check.

### Trigger → Action

| | |
| --- | --- |
| **Trigger** | New email in the Gmail inbox (filter: label or sender) |
| **Action 1** | ChatGPT reads subject + body |
| **Action 2** | ChatGPT writes a reply in your style |
| **Action 3** | Gmail → save a draft in Drafts |

### Why a draft and not sending

- Human-in-the-loop: you control the final tone
- No risk of sending a hallucination to a client
- Same exit velocity as "send": one click

### Prompt for ChatGPT

```
Role: assistant writing replies in my style
Objective: draft a reply to the email below
Context:
  - my tone: [friendly / formal / businesslike]
  - my language: [English / other / mix]
  - my frequent phrases: [list]
Instructions:
  - read subject + body
  - identify the intent of the email (question / request / info)
  - write a reply of 3–6 sentences
  - if information I haven't given is needed, leave a placeholder [UNCLEAR: ...]
Notes:
  - don't promise deadlines I haven't confirmed
  - don't share confidential information
  - signature: [your signature]

---
FROM: {{email.from}}
SUBJECT: {{email.subject}}
BODY: {{email.body}}
```

### Implementation steps

1. Make.com → Trigger: **Gmail > Watch Emails** (filter: `label:inbox -from:me`)
2. Action: **OpenAI > Chat Completion** (prompt above)
3. Action: **Gmail > Create Draft** (to = `{{email.from}}`, subject = `Re: {{email.subject}}`, body = output)

### The Claude Code variant

You can build the same thing locally with Claude Code + an MCP server for Gmail. The advantage: your correspondence does not go to a third-party service.

---

## Recipe 3: Personalized Cold Email Outreach

**Saves:** 5–15 h/week on sales outreach. **Warning:** use it only if this is your real business process, and respect sending rules (opt-out, GDPR, no spam).

### What it does

A list of companies in a Google Sheet → for each one: find the decision maker → ChatGPT writes a personalized email → send via Gmail → log it.

### Trigger → Action

| | |
| --- | --- |
| **Trigger** | New row in the Sheet (company domain + role) |
| **Action 1** | Apollo.io: find a contact by domain + role |
| **Action 2** | Apollo.io: get public company data |
| **Action 3** | ChatGPT: write a personalized email |
| **Action 4** | Gmail: send (or save to Drafts) |
| **Action 5** | Sheet: record status + send date |

### Infra

- **Apollo.io**: B2B data (contact search by domain)
- **Google Sheets**: target list + statuses
- **Make.com**: orchestrator
- **OpenAI API**: email generation
- **Gmail / Outlook**: sending

### Prompt for ChatGPT

```
Role: B2B SDR writing short, relevant first emails
Objective: write a cold email to {{contact.first_name}} at {{company.name}}
Context:
  - what I offer: [your product / service in 1 sentence]
  - my value prop for their role ({{contact.title}}): [what they get]
  - my company: [1-2 sentences]
Instructions:
  - subject: < 6 words, no clickbait
  - opener: a specific detail about them (from Apollo data)
  - 2-3 sentences of value prop tied to their context
  - CTA: one simple question (not "when do you have 15 minutes?")
  - signature: [yours]
  - length: no more than 90 words in the body
Notes:
  - no "I hope this email finds you well"
  - no superlatives ("revolutionary", "best-in-class")
  - if their company is small, don't use an enterprise tone
```

### Implementation steps

1. Google Sheet: columns `company_domain | target_role | status | sent_date | contact_email | subject | body`
2. Make.com → Trigger: **Google Sheets > Watch New Rows**
3. Action: **Apollo.io > Search People** (domain + role)
4. Action: **Apollo.io > Get Company** (domain)
5. Action: **OpenAI > Chat Completion** (prompt above with the Apollo data)
6. Action: **Gmail > Send Email** (or Create Draft for a manual check)
7. Action: **Google Sheets > Update Row** (status, sent_date, email, subject, body)

### Etiquette

- **Always** include an opt-out link or line
- **No more than** 50 emails/day from one address (warm-up)
- **Segment** by role + industry, don't send the same thing to everyone
- Check **GDPR / CAN-SPAM** for your jurisdictions

---

## 🧰 Alternative: the same recipes in Claude Code

If you don't want to pay for Make.com and are ready to maintain things locally:

| Make.com component | Claude Code equivalent |
| --- | --- |
| Trigger: Watch Sheet | The OS scheduler (cron / schtasks) runs `claude -p`, which checks the sheet via the Google Sheets MCP (module 06/u5). A hook does not fit here: it fires on events inside an agent session, not on a clock |
| Action: ChatGPT | A Claude Code session with the prompt |
| Action: Gmail | MCP Gmail server |
| Action: LinkedIn | MCP LinkedIn / web scraping |
| Storage | Local files / Git |

Pros: full control, no third-party services, code in Git.
Cons: you maintain the infra yourself.

---

## 🎯 What next

1. Pick **one** recipe that saves you the most time.
2. Build it in an evening (even if rough).
3. Measure after a week: how many hours does it really save?
4. If >2 h/week, keep it. If not, delete it without regret.

> 💡 Don't build all three at once. One that works beats three abandoned ones.
