'use client'

import { createContext, useContext } from 'react'
import type { Locale } from '@/lib/dictionaries'

interface UnitWizardContextValue {
  currentStep: number
  totalSteps: number
  locale: Locale
}

export const UnitWizardContext = createContext<UnitWizardContextValue>({
  currentStep: 0,
  totalSteps: 4,
  locale: 'ru',
})

export function useUnitWizard(): UnitWizardContextValue {
  return useContext(UnitWizardContext)
}
