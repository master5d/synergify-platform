export interface TelegramWebApp {
  initData: string
  ready(): void
  expand(): void
}

interface TelegramGlobal {
  Telegram?: { WebApp?: TelegramWebApp }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null
  const tg = (window as unknown as TelegramGlobal).Telegram?.WebApp
  return tg ?? null
}

export function isInsideTelegram(): boolean {
  const app = getTelegramWebApp()
  return !!app && typeof app.initData === 'string' && app.initData.length > 0
}
