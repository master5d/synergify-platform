// Геометрия сквозной картины. Пока — черновая машина из соответствия; настоящую строит скилл Anatomy (план, задача 7)
// с теми же id узлов и деталей (контракт MachineDef / MachineProps в lib/assembly/types.ts).
import { draftMachine } from '@/lib/assembly/draft-machine'
import type { MachineDef } from '@/lib/assembly/types'
import { ASSEMBLY_MAP } from './assembly-map'

export const MACHINE: MachineDef | null = draftMachine(ASSEMBLY_MAP)
