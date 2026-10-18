'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { menuMoney, parseMoney } from '../../lib/retreat-menu/export'
import { field } from './styles'

/** Поле суммы со своим текстом, как в генераторе меню: «12,» и «12.» не съедаются, центы уходят наверх, когда число
 *  готово. `nullable` — пустое поле значит «не задано» (ставка месяца = общая); иначе пустое становится 0 при уходе из поля. */
export function MoneyInput({ value, locale, onChange, nullable = false, label, disabled = false }: {
  value: number | null
  locale: Locale
  onChange: (value: number | null) => void
  nullable?: boolean
  label?: string
  disabled?: boolean
}) {
  const shown = (v: number | null) => (v === null ? '' : menuMoney(v, locale))
  const [text, setText] = useState(shown(value))
  useEffect(() => {
    // текст меняется только при внешней смене суммы (ссылка, черновик), а не на каждую клавишу
    if (/[.,]$/.test(text.trim())) return
    if (text.trim() === '' ? value !== null && !nullable : parseMoney(text) !== value) setText(shown(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, locale])
  return (
    <input
      style={field}
      inputMode="decimal"
      aria-label={label}
      disabled={disabled}
      value={text}
      onChange={(event) => {
        setText(event.target.value)
        if (event.target.value.trim() === '') {
          if (nullable) onChange(null)
          return
        }
        const parsed = parseMoney(event.target.value)
        if (parsed !== null) onChange(parsed)
      }}
      onBlur={() => {
        if (text.trim() === '' && !nullable) {
          setText(shown(0))
          onChange(0)
        }
      }}
    />
  )
}
