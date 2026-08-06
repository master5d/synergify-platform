import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Unbounded } from 'next/font/google'
import { ProgressProvider } from '@/components/progress-provider'
import { LangSuggestBanner } from '@/components/lang-suggest-banner'
import { PwaRegister } from '@/components/pwa/pwa-register'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { ThemeProvider } from '@/components/theme-provider'
import { LiteProvider } from '@/components/lite-provider'
import { TelegramAuthBridge } from '@/components/telegram/telegram-auth-bridge'
import Script from 'next/script'
import { COURSE } from '@/lib/course'
import { REGISTRY } from '@/lib/academy/registry'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['900'],
  variable: '--font-display',
  display: 'swap',
})

// Keep the 'theme-pref' key + 'system' default in sync with lib/theme-pref.ts.
// This runs before paint so the resolved theme is applied with no flash (FOUC).
const themeScript = `(function(){try{` +
  `var p=localStorage.getItem('theme-pref');` +
  `var sys=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';` +
  // Only an explicit light/dark wins; 'system' and any junk value fall back to sys.
  `document.documentElement.setAttribute('data-theme',(p==='light'||p==='dark')?p:sys);` +
  `}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`

// Keep the 'lite-pref' key + 'auto' default in sync with lib/lite-pref.ts.
// Runs before paint so [data-lite] CSS applies with no flash.
const liteScript = `(function(){try{` +
  `var p=localStorage.getItem('lite-pref');` +
  `var c=(navigator.connection||{});` +
  `var slow=c.saveData===true||c.effectiveType==='2g'||c.effectiveType==='slow-2g';` +
  `var on=(p==='on')||((p==='auto'||p==null)&&slow);` +
  `document.documentElement.setAttribute('data-lite',on?'on':'off');` +
  `}catch(e){document.documentElement.setAttribute('data-lite','off');}})();`

// Static export uses a single root layout, so <html lang> can't be set per route at build.
// Correct it pre-paint from the path: /en/* → 'en', everything else → 'ru'. This removes the
// language conflict on English pages (which would otherwise declare lang="ru").
const langScript =
  `(function(){try{document.documentElement.lang=/^\\/en(\\/|$)/.test(location.pathname)?'en':'ru';}catch(e){}})();`

export const metadata: Metadata = {
  metadataBase: new URL(COURSE.domain),
  title: 'Точка Сборки — курс по vibe-кодингу',
  description: `Открытый курс по AI-разработке и агентному программированию. Presented by ${REGISTRY.academy.org.name}.`,
  publisher: REGISTRY.academy.org.name,
  authors: [{ name: 'Alexander Mamaev' }],
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Точка Сборки' },
  // No global canonical/alternates here: a root-level canonical would leak to every page
  // (canonicalizing all routes to '/'). hreflang pairing is declared in the sitemap instead;
  // Google self-canonicalizes each URL by default.
  openGraph: { locale: 'ru_RU', alternateLocale: ['en_US'], siteName: 'Точка Сборки' },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      data-theme="dark"
      data-lite="off"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${unbounded.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: liteScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body>
        <ThemeProvider>
          <LiteProvider>
            <TelegramAuthBridge />
            <ProgressProvider>
              <LangSuggestBanner />
              <PwaRegister />
              <InstallPrompt />
              {children}
            </ProgressProvider>
          </LiteProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
