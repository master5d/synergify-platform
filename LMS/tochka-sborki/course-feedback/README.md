# 📊 Course Feedback System

Это **авторский слой** feedback-петли Точка Сборки. Студенческие feedback'и приземляются сюда → агент генерирует digest → автор обновляет модули.

## Структура

```
course-feedback/
├── submissions/    — raw feedback от студентов (1 файл = 1 feedback)
│   ├── <anon-id>-m0.md
│   ├── <anon-id>-m1.md
│   └── <anon-id>-final.md
├── digests/        — синтез-отчёты агента (1 файл = 1 цикл)
│   ├── YYYY-MM-DD-digest.md
│   └── TEMPLATE.md — структура отчёта
└── README.md       — этот файл
```

## Как feedback попадает в submissions/

На старте Точка Сборки в single-author демо-режиме механизм сбора **упрощён**: автор вручную кладёт присланные feedback'и в `submissions/`.

Production-варианты (на выбор автора, out of scope текущего демо):
- GitHub Issues с тегом `feedback` → export script
- Google Form → CSV → md-конвертер
- Private Git branch от студентов + merge

## Как запустить digest-цикл

Запусти slash-command в Claude Code:

```
/project:feedback-digest
```

Агент автоматически:
1. Читает все файлы в `submissions/` (игнорирует `example-*`)
2. Агрегирует NPS per module, вычисляет Δ vs предыдущий digest
3. Кластеризует friction points и wins
4. Синтезирует JTBD Forces из `*-final.md` интервью
5. Ранжирует action items P1/P2/P3 по impact × частота с `файл:строка` ссылками
6. Проверяет privacy (нет PII в цитатах)
7. Сохраняет `course-feedback/digests/YYYY-MM-DD-digest.md`
8. Выводит резюме: N submissions, модуль с наименьшим NPS, количество P1

Команда определена в `.claude/commands/feedback-digest.md`.

## Loop

```
submissions/ ──▶ агент ──▶ digest ──▶ автор решает ──▶ Meeting-правки
     ▲                                                          │
     └──────────────── новые feedback'и ◀──────────────────────┘
```

## Privacy rules

- **anon_id** — 3-словный nickname, не PII. Студент генерирует сам.
- **Pre-merge review:** автор удаляет любые имена/компании/уникальные проекты из submissions/ перед commit.
- **Digests** — только агрегированные инсайты. Никаких цитат, идентифицирующих студента.
- **Non-Actions раздел** в digest — защита от карго-культа: не все предложения берутся, отклонённые фиксируются с обоснованием.
- **Unscrubable submissions:** если feedback содержит PII, которую нельзя удалить без разрушения смысла (например, описание уникального проекта — источника friction), — автор **не кладёт** такой файл в `submissions/`. Суть пересказывает в приватных заметках для будущего digest-цикла.
