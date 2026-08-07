import type { Metadata } from 'next'
import { Comfortaa, Onest, Unbounded } from 'next/font/google'
import './globals.css'

// Шрифты школы (дизайн «weave»): Comfortaa — имя школы, Unbounded — дисплей,
// Onest — текст. Самохостинг через next/font: на проде ноль внешних запросов.
const comfortaa = Comfortaa({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-wordmark',
  display: 'swap',
})
const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['200', '300', '400'],
  variable: '--font-display',
  display: 'swap',
})
const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
})

// ⚠ НЕ ставить alternates.canonical здесь — root-metadata протекает на ВСЕ страницы
// и канонизирует их в корень. hreflang-пары отдаём через sitemap.
export const metadata: Metadata = {
  metadataBase: new URL('https://academy.synergify.com'),
  title: 'Школа синергемы — Synergema Authentica Starseed Holon Academy',
  description:
    'Закрытая школа живых связей. Вход — через открытый курс «Точка Сборки». Способности куются, а не изучаются.',
}

// Единый root-layout не даёт статический per-route lang под `output: export`,
// поэтому язык проставляется до отрисовки по префиксу пути.
const LANG_SCRIPT = `(function(){try{if(location.pathname.indexOf('/en')===0){document.documentElement.lang='en'}}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${comfortaa.variable} ${unbounded.variable} ${onest.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
