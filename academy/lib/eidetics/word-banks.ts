// lib/eidetics/word-banks.ts
// Данные тренажёра «Запомни ряд» — ПО КЛЮЧУ АУДИТОРИИ (решение владельца 2026-09-14: пока
// взрослые, с перспективой детской линии). Детская линия = новый ключ со своим набором и
// текстами, движок (recall.ts) не меняется. Слова — конкретные, легко представимые
// существительные, одно слово на язык (так их можно честно сверить при вводе).
import type { Bi } from '../speedreading/bi'

export type Audience = 'adult'
export const DEFAULT_AUDIENCE: Audience = 'adult'

export const WORD_BANKS: Record<Audience, Bi[]> = {
  adult: [
    { ru: 'яблоко', en: 'apple' }, { ru: 'мост', en: 'bridge' }, { ru: 'зонт', en: 'umbrella' },
    { ru: 'лампа', en: 'lamp' }, { ru: 'кошка', en: 'cat' }, { ru: 'ключ', en: 'key' },
    { ru: 'гитара', en: 'guitar' }, { ru: 'лодка', en: 'boat' }, { ru: 'барабан', en: 'drum' },
    { ru: 'свеча', en: 'candle' }, { ru: 'якорь', en: 'anchor' }, { ru: 'перо', en: 'feather' },
    { ru: 'чайник', en: 'kettle' }, { ru: 'лестница', en: 'ladder' }, { ru: 'корона', en: 'crown' },
    { ru: 'арбуз', en: 'watermelon' }, { ru: 'колокол', en: 'bell' }, { ru: 'маяк', en: 'lighthouse' },
    { ru: 'зеркало', en: 'mirror' }, { ru: 'ракета', en: 'rocket' }, { ru: 'подушка', en: 'pillow' },
    { ru: 'кактус', en: 'cactus' }, { ru: 'молоток', en: 'hammer' }, { ru: 'облако', en: 'cloud' },
    { ru: 'сова', en: 'owl' }, { ru: 'велосипед', en: 'bicycle' }, { ru: 'шляпа', en: 'hat' },
    { ru: 'скрипка', en: 'violin' }, { ru: 'бочка', en: 'barrel' }, { ru: 'пингвин', en: 'penguin' },
    { ru: 'вулкан', en: 'volcano' }, { ru: 'корзина', en: 'basket' }, { ru: 'пирамида', en: 'pyramid' },
    { ru: 'ножницы', en: 'scissors' }, { ru: 'фонарь', en: 'lantern' }, { ru: 'слон', en: 'elephant' },
    { ru: 'торт', en: 'cake' }, { ru: 'компас', en: 'compass' }, { ru: 'жираф', en: 'giraffe' },
    { ru: 'палатка', en: 'tent' }, { ru: 'тыква', en: 'pumpkin' }, { ru: 'кит', en: 'whale' },
  ],
}
