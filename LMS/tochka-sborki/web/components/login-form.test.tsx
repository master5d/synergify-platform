import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LoginForm } from './login-form'
// Шапка (Nav → SettingsMenu) читает useTheme()/useLite(): в приложении провайдеры даёт
// app/layout.tsx (ThemeProvider → LiteProvider), в тесте — те же, явно.
import { ThemeProvider } from './theme-provider'
import { LiteProvider } from './lite-provider'

describe('LoginForm', () => {
  it('email and telegram fields are wired to real <label htmlFor>, with id/name/autoComplete', () => {
    const html = renderToStaticMarkup(<ThemeProvider><LiteProvider><LoginForm locale="ru" /></LiteProvider></ThemeProvider>)

    const emailInputMatch = html.match(/<input[^>]*name="email"[^>]*>/)
    expect(emailInputMatch, 'email input not found').toBeTruthy()
    const emailInput = emailInputMatch![0]
    const emailId = /id="([^"]+)"/.exec(emailInput)?.[1]
    expect(emailId, 'email input has no id').toBeTruthy()
    expect(html).toContain(`<label for="${emailId}"`)
    expect(emailInput).toMatch(/autocomplete="email"/i)

    const telegramInputMatch = html.match(/<input[^>]*name="telegram"[^>]*>/)
    expect(telegramInputMatch, 'telegram input not found').toBeTruthy()
    const telegramInput = telegramInputMatch![0]
    const telegramId = /id="([^"]+)"/.exec(telegramInput)?.[1]
    expect(telegramId, 'telegram input has no id').toBeTruthy()
    expect(html).toContain(`<label for="${telegramId}"`)
  })

  it('telegram label marks it optional, and the "why" hint survives independently of the placeholder', () => {
    const html = renderToStaticMarkup(<ThemeProvider><LiteProvider><LoginForm locale="ru" /></LiteProvider></ThemeProvider>)
    expect(html).toMatch(/<label[^>]*>Telegram \(необязательно\)<\/label>/)
    // Подсказка — отдельный узел с aria-describedby, а не только placeholder (тот пропадает при вводе).
    const telegramInput = html.match(/<input[^>]*name="telegram"[^>]*>/)![0]
    const describedBy = /aria-describedby="([^"]+)"/.exec(telegramInput)?.[1]
    expect(describedBy).toBeTruthy()
    expect(html).toContain(`id="${describedBy}"`)
    expect(html).toContain('Бот напомнит про курс в Telegram')
  })

  it('en locale: same wiring, English copy', () => {
    const html = renderToStaticMarkup(<ThemeProvider><LiteProvider><LoginForm locale="en" /></LiteProvider></ThemeProvider>)
    expect(html).toMatch(/<label[^>]*>Telegram \(optional\)<\/label>/)
    expect(html).toContain('The bot will nudge you on Telegram')
  })

  it('shows nothing about a redirect when the URL has none (SSR default)', () => {
    const html = renderToStaticMarkup(<ThemeProvider><LiteProvider><LoginForm locale="ru" /></LiteProvider></ThemeProvider>)
    expect(html).not.toContain('Войди, и урок откроется')
  })
})
