# Шрифты сертификата

Страница `/certificate` грузит эти файлы со своего сайта и встраивает их в SVG сертификата данными
(`lib/certificate-fonts.ts`): ни страница, ни скачанный SVG не зовут Google Fonts, а скачанный файл
показывает свои шрифты и без сети. Гвард — `lib/certificate-fonts.test.ts`. Владелец файлов — движок
(`scripts/public-shared.json`).

| Файл | Источник | Что сделано | Лицензия |
| --- | --- | --- | --- |
| `Unbounded-900.woff2` | копия `app/fonts/Unbounded-900.woff2` (`google/fonts` `ofl/unbounded`) | статический инстанс 900, latin + cyrillic | OFL 1.1 — `OFL-unbounded.txt` |
| `PlayfairDisplay-wght.woff2` | `google/fonts` `ofl/playfairdisplay/PlayfairDisplay[wght].ttf` | только упаковка TTF → WOFF2 (без вырезания глифов и осей) | OFL 1.1, Reserved Font Name «Playfair Display» — `OFL-playfair-display.txt` |
| `PlayfairDisplay-Italic-wght.woff2` | `google/fonts` `ofl/playfairdisplay/PlayfairDisplay-Italic[wght].ttf` | только упаковка TTF → WOFF2 | то же |
| `GeistMono-Regular.woff2`, `GeistMono-Bold.woff2` | npm-пакет `geist@1.7.0`, `dist/fonts/geist-mono/` | без изменений | OFL 1.1 — `OFL-geist.txt` |

Playfair Display не урезается: у неё Reserved Font Name, а изменённую версию OFL запрещает выпускать
под тем же именем. Поэтому файлы крупные (~105 КБ каждый) и скачанный SVG весит около 470 КБ.

Упаковка Playfair (fontTools ≥ 4.63 с brotli):

```sh
python -c "from fontTools.ttLib import TTFont; f=TTFont('PlayfairDisplay[wght].ttf'); f.flavor='woff2'; f.save('PlayfairDisplay-wght.woff2')"
```

Новое семейство или начертание в SVG — файл сюда, запись в `CERT_FONTS` (`lib/certificate-fonts.ts`),
лицензия рядом.
