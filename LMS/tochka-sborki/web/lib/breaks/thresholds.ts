// lib/breaks/thresholds.ts
// Throttle constants for the dopamine-break trigger (mirrors lib/pacing/thresholds.ts).
export const MIN_BREAK_STEP = 2          // skip the shallow intro steps
export const BREAK_COOLDOWN_STEPS = 3    // step transitions between breaks
export const MAX_BREAKS_PER_SESSION = 2  // frequency cap per player session
