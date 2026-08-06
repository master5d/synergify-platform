import type { Metadata } from 'next'
import './globals.css'

// ⚠ НЕ ставить alternates.canonical здесь — root-metadata протекает на ВСЕ страницы
// и канонизирует их в корень. hreflang-пары отдаём через sitemap.
export const metadata: Metadata = {
  metadataBase: new URL('https://academy.synergify.com'),
  title: 'S.A.S.H.A — школа синергемы',
  description:
    'Закрытая школа живых связей. Вход — через открытый курс «Точка Сборки». Способности куются, а не изучаются.',
}

// Единый root-layout не даёт статический per-route lang под `output: export`,
// поэтому язык проставляется до отрисовки по префиксу пути.
const LANG_SCRIPT = `(function(){try{if(location.pathname.indexOf('/en')===0){document.documentElement.lang='en'}}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
