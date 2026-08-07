// Белый дракон — несущий орнамент школы (identity: звёздное полотно, серебро/золото).
// Восточный змей одной линией: рога, ус-спираль, волнистое тело с гребнем, хвост.
// Статичен (motion 1). Масштабируется шириной контейнера.
interface Props {
  /** Ширина орнамента (max), по умолчанию 520px */
  width?: number
  /** Прозрачность линии, по умолчанию 0.6 */
  opacity?: number
  /** Отзеркалить по горизонтали */
  flip?: boolean
}

export function DragonOrnament({ width = 520, opacity = 0.6, flip = false }: Props) {
  return (
    <svg
      viewBox="0 0 640 120"
      aria-hidden="true"
      style={{
        width: '100%',
        maxWidth: `${width}px`,
        height: 'auto',
        display: 'block',
        margin: '0 auto',
        opacity,
        transform: flip ? 'scaleX(-1)' : undefined,
      }}
    >
      <g fill="none" stroke="var(--text-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* тело: длинная серпантина от головы (слева) к хвосту */}
        <path d="M 96 62 C 150 30 210 96 268 66 C 326 36 380 96 438 66 C 488 40 532 78 574 58" />
        {/* гребень — плавники вдоль спины */}
        <path d="M 152 47 q 6 -14 16 -16 q -2 12 -8 20" strokeWidth="1.2" />
        <path d="M 236 74 q 8 12 18 13 q -3 -12 -10 -19" strokeWidth="1.2" />
        <path d="M 322 50 q 6 -14 16 -16 q -2 12 -8 20" strokeWidth="1.2" />
        <path d="M 406 74 q 8 12 18 13 q -3 -12 -10 -19" strokeWidth="1.2" />
        {/* хвост — кисть-пламя */}
        <path d="M 574 58 q 20 -10 28 -26 q 2 14 -6 24 q 14 -4 22 -14 q -2 16 -16 24 q 12 2 20 -2 q -8 12 -26 10" strokeWidth="1.2" />
        {/* голова: лоб, морда, приоткрытая пасть */}
        <path d="M 96 62 C 84 50 70 46 58 50 C 48 53 42 60 40 68 C 52 66 60 68 66 74 C 74 70 84 70 96 62 Z" strokeWidth="1.4" />
        {/* рога, откинутые назад */}
        <path d="M 74 49 q 4 -18 20 -24 q -4 14 -12 22" strokeWidth="1.2" />
        <path d="M 86 52 q 8 -14 22 -17 q -6 12 -14 18" strokeWidth="1.2" />
        {/* ус — длинная спираль от морды */}
        <path d="M 42 66 q -18 4 -26 16 q 12 -2 18 4 q -10 4 -12 12 q 12 -4 18 -12" strokeWidth="1.1" />
        {/* глаз */}
        <circle cx="66" cy="58" r="1.8" fill="var(--text-primary)" stroke="none" />
        {/* коготь-лапа под телом */}
        <path d="M 300 82 q 2 12 -4 18 m 4 -18 q 8 8 8 16 m -8 -16 q -8 6 -10 14" strokeWidth="1.1" />
      </g>
      {/* золотые звёзды у изгибов */}
      <g fill="var(--accent)">
        <path d="M 200 30 l 2.2 6 l 6 2.2 l -6 2.2 l -2.2 6 l -2.2 -6 l -6 -2.2 l 6 -2.2 Z" opacity="0.9" />
        <path d="M 470 88 l 1.8 5 l 5 1.8 l -5 1.8 l -1.8 5 l -1.8 -5 l -5 -1.8 l 5 -1.8 Z" opacity="0.7" />
        <circle cx="360" cy="26" r="1.4" opacity="0.6" />
        <circle cx="540" cy="92" r="1.2" opacity="0.5" />
      </g>
    </svg>
  )
}
