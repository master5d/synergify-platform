# Шрифты академии

Лежат в репо, чтобы `next build` не качал их из Google на каждой сборке
(`next/font/google` дважды за 2026-09-28 уронил deploy-academy). Подключение — `app/layout.tsx`
через `next/font/local`; гвард — `lib/fonts.test.ts`.

| Файл | Источник | Что сделано | Лицензия |
| --- | --- | --- | --- |
| `Comfortaa-wght.woff2` | `google/fonts` `ofl/comfortaa/Comfortaa[wght].ttf` | только упаковка TTF → WOFF2 (без вырезания глифов и осей) | OFL 1.1, Reserved Font Name «Comfortaa» — `OFL-comfortaa.txt` |
| `Unbounded-wght.woff2` | `google/fonts` `ofl/unbounded/Unbounded[wght].ttf` | ось wght сужена до 200–400, глифы — latin + cyrillic, WOFF2 | OFL 1.1 — `OFL-unbounded.txt` |
| `Onest-wght.woff2` | `google/fonts` `ofl/onest/Onest[wght].ttf` | ось wght сужена до 300–500, глифы — latin + cyrillic, WOFF2 | OFL 1.1 — `OFL-onest.txt` |

Comfortaa не урезается: у неё Reserved Font Name, а изменённую версию OFL запрещает выпускать под
тем же именем. Упаковка в WOFF2 глифы и таблицы не меняет.

Пересборка (fontTools ≥ 4.63 с brotli; `U` — диапазоны latin + cyrillic как у Google Fonts плюс стрелки U+2190–2199):

```sh
U="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+FEFF,U+FFFD,U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116"
python -m fontTools.varLib.instancer Onest.ttf wght=300:500 -o Onest-i.ttf
python -m fontTools.subset Onest-i.ttf --unicodes="$U" --layout-features='*' --flavor=woff2 --output-file=Onest-wght.woff2
python -m fontTools.varLib.instancer Unbounded.ttf wght=200:400 -o Unbounded-i.ttf
python -m fontTools.subset Unbounded-i.ttf --unicodes="$U" --layout-features='*' --flavor=woff2 --output-file=Unbounded-wght.woff2
python -c "from fontTools.ttLib import TTFont; f=TTFont('Comfortaa.ttf'); f.flavor='woff2'; f.save('Comfortaa-wght.woff2')"
```

Новый вес в дизайне вне диапазона файла — пересобрать файл с шире осью и поправить `weight` в `layout.tsx`.
