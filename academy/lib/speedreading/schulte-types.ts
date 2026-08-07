// lib/speedreading/schulte-types.ts
export const SCHULTE_KEY = 'speedreading_schulte'
export interface SchulteSession { date: string; size: number; ms: number; errors: number }
export interface SchulteState { size: number; best: Record<number, number>; sessions: SchulteSession[] }
