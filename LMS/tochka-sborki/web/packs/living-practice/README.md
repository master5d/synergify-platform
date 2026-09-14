# living-practice — второй course-pack

«Тишина, в которой слышно» — восемь шагов практики внимания: польза и риск названы до первой
сессии, собеседник-ИИ между сессиями, живой круг в конце. Курс академии S.A.S.H.A.

## Где живёт

Подпуть школы: `https://academy.synergify.com/praktika` (`COURSE_BASE_PATH=/praktika`, склейка
`scripts/merge-course.mjs` в job `deploy-academy`). В `LMS/registry.json` — `status: live`.

## Контракт pack'а (тот же, что у эталона tochka-sborki)

- `course.config.ts` — COURSE (name/fullName/domain/locales), `features` (rpg и сертификат выключены),
  `gates` (auth + admission академии, без RPG-опросника)
- `dictionaries.ts` — полный интерфейс `Dictionary`, значения под курс практики
- `materials.ts` — минимальный честный манифест (ссылки на академию)
- `manifest.ts` — исполняемые правила тона: гейтятся только ОБЕЩАЮЩИЕ формы
  («гарантируем», «вылечит», «заменит терапию», «обретёшь сверхспособности»)
- `content/{ru,en}/01-living-practice/` — один модуль, 8 уроков, фазовый мастер (`layout: phases`);
  плюс loose-страницы `cheatsheet/roadmap/exercises`
- `course/*.ts` — форма эталона; `course/companion.ts` — компаньон «Учиться с ИИ»: свой контекст,
  своя методика и границы из u7, профиль анкеты Точки Сборки не используется (intake LMS#16)
- `skins-meta.ts` + `skins/wanderer.json` — только скин wanderer

## Чего здесь нет (сознательно)

- Реальных кейсов, showcase-видео, дримов — массивы пустые, движок рендерит тёмным
- RPG-глубины: скин один (wanderer), dungeon-флейворы нейтральные
- Обещаний результата: копия де-hustle; курс не заменяет терапию и говорит это вслух
- Дневника на сервере: уроки просят вести свой дневник (файл или тетрадь)
