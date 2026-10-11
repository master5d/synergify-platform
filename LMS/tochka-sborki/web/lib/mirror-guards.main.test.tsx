import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AuthGuard } from '../components/auth-guard'
import { IntakeGuard } from '../components/intake-guard'

// Основная сборка: без сессии содержимое не отдаётся до проверки (эффекты в статическом рендере не идут).
describe('защиты в основной сборке', () => {
  it('AuthGuard прячет содержимое до проверки', () => {
    expect(renderToStaticMarkup(<AuthGuard locale="ru"><p>UNIT-BODY</p></AuthGuard>)).not.toContain('UNIT-BODY')
  })
  it('IntakeGuard прячет содержимое до проверки', () => {
    expect(renderToStaticMarkup(<IntakeGuard locale="ru"><p>UNIT-BODY</p></IntakeGuard>)).not.toContain('UNIT-BODY')
  })
})
