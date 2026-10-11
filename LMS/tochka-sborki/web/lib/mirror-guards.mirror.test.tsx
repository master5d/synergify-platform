import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/lib/mirror', async (orig) => ({ ...(await orig<typeof import('@/lib/mirror')>()), IS_MIRROR: true }))

import { AuthGuard } from '../components/auth-guard'
import { IntakeGuard } from '../components/intake-guard'
import { MobileGate } from '../components/mobile-gate'
import { AdmissionGuard } from '../components/admission-guard'

describe('защиты в зеркале', () => {
  it.each([
    ['AuthGuard', AuthGuard], ['IntakeGuard', IntakeGuard], ['MobileGate', MobileGate], ['AdmissionGuard', AdmissionGuard],
  ] as const)('%s сразу отдаёт содержимое', (_name, Guard) => {
    const html = renderToStaticMarkup(<Guard locale="ru"><p>UNIT-BODY</p></Guard>)
    expect(html).toBe('<p>UNIT-BODY</p>')
  })
})
