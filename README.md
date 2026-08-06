# lms-engine

Standalone образовательная платформа synergify: LMS-движок + platform-API (workers) +
витрина synergify.com + академия S.A.S.H.A. Вырезан из mc_hub (Ф0, геометрия путей
сохранена). Спека: docs/superpowers/specs/2026-08-06-lms-engine-extraction-design.md

- LMS/tochka-sborki/web — движок LMS (Next.js 16, ai.synergify.com); курс-данные
  выделяются в course-pack'и по фазам Ф0.5+
- LMS/registry.json — SoT курсов (slug/имя/домен/status)
- workers/ — platform-API (auth/progress/admission/feedback/CRM/telegram/checkout)
- academy/ — academy.synergify.com (витрина школы + курс «Практика в живой связи»)
- synergify/ — зонтик synergify.com
- Модель авторинга: гостевые мастера делают МОДУЛИ внутри существующих курсов,
  в рамках манифеста курса (manifest-guard в CI).

⚠ Прод пока деплоится из mc_hub; deploy.yml.disabled-until-cutover включается на Ф0.5.
