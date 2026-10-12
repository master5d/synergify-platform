# iso-kit — копия библиотеки рисования Anatomy

Источник: `github.com/wheresryan22/anatomy`, каталог `kit/`, коммит `be2fa9b47a7e4b05dec468be9ffc42e830c2101c`
(2026-10-12, release 1.1.0), лицензия MIT — `LICENSE` рядом. Скопировано 2026-10-12 после SecOps-ревью скилла
(intake LMS#36, план `docs/superpowers/plans/2026-10-12-assembly-map.md`, задача 6).

Файлы: `iso-kit.ts` и `iso-kit.mjs` (ядро: камера, тела, рендер SVG), `iso.css`, `lathe.mjs` (тела вращения),
`tube.mjs` (трубы и кабели), `audit.mjs` (аудит геометрии), `react/draw.tsx` и `react/live.tsx` (React-компоненты).

Нужна настоящей машине сквозной картины (`packs/tochka-sborki/course/assembly-machine.tsx`, задача 7); черновая машина
обходится своим проектором `lib/assembly/iso.ts`.

Правок здесь нет и не должно быть: обновление — только переносом новой версии `kit/` целиком с новым SHA в этом файле.
