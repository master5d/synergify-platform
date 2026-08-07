// lib/speedreading/rsvp-types.ts
export const RSVP_KEY = 'speedreading_rsvp'
export interface RsvpSession { date: string; wpm: number; words: number }
export interface RsvpState { wpm: number; chunkSize: number; sessions: RsvpSession[] }
