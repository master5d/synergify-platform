# Шрифты курса

Лежат в репо, чтобы `next build` не качал их из Google на каждой сборке (у академии `next/font/google`
дважды за 2026-09-28 уронил deploy-academy). Подключение — `app/layout.tsx` через `next/font/local`;
гвард — `lib/a11y/local-fonts.test.ts`. Geist Sans/Mono приходят из npm-пакета `geist`, сети не требуют.

| Файл | Источник | Что сделано | Лицензия |
| --- | --- | --- | --- |
| `Unbounded-900.woff2` | `google/fonts` `ofl/unbounded/Unbounded[wght].ttf` | статический инстанс wght=900, глифы — latin + cyrillic, WOFF2 | OFL 1.1 — `OFL-unbounded.txt` |

Пересборка (fontTools ≥ 4.63 с brotli; `U` — диапазоны latin + cyrillic как у Google Fonts плюс стрелки U+2190–2199):

```sh
U="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+FEFF,U+FFFD,U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116"
python -m fontTools.varLib.instancer Unbounded.ttf wght=900 -o Unbounded-900.ttf
python -m fontTools.subset Unbounded-900.ttf --unicodes="$U" --layout-features='*' --flavor=woff2 --output-file=Unbounded-900.woff2
```

Нужен другой вес — собрать ещё один инстанс (или вариативный файл с диапазоном) и добавить в `src` в `layout.tsx`.
Академия держит свои шрифты отдельно — `academy/app/fonts`.
