import type { Locale } from './types'

export const KEY = {
  root: 'root',
  home: (l: Locale) => (l === 'ru' ? 'root' : 'en/home'),
  book: (l: Locale) => `${l}/book`,
  module: (l: Locale, m: string) => `${l}/m/${m}`,
  unit: (l: Locale, m: string, u: string) => `${l}/u/${m}/${u}`,
  dict: (l: Locale) => `${l}/dict`,
  concept: (l: Locale, id: string) => `${l}/c/${id}`,
  page: (l: Locale, name: string) => `${l}/p/${name}`,
}
