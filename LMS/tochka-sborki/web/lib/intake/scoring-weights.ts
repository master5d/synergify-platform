// web/lib/intake/scoring-weights.ts
// points[questionId][optionValue] = points contributed to its attribute.
// Doc-explicit values are used verbatim; others follow the even-spacing rule (see plan).
export const SCORING: Record<string, Record<string, number>> = {
  // INT sources
  C1: { tier0: 0, tier1: 2, tier2: 4, tier3: 8, tier4: 12 }, // also sets char_level 0..4
  C3: { never_heard: 0, heard: 1, know: 3, used: 5 },
  C4: { never: 0, basic: 2, scripts: 4, comfortable: 6 },
  C8: { very: 5, somewhat: 3, concrete: 1, confused: 0 },
  D3: { absorb: 6, tired: 4, lose: 2, rewatch: 1, giveup: 0 },
  D7: { one: 0, two_three: 2, four_five: 4, many: 6 },
  // WIS sources
  D1: { video_copy: 1, read_try: 3, jump_in: 4, walk_through: 0 },
  D5: { do_now: 4, notes: 2, teach: 3, review: 2, depends: 2 },
  D9: { e0: 0, e1: 2, e2: 3, e3: 5 },
  E3: { quick: 1, slow: 3, community: 2 },
  E4: { high: 5, mid: 3, low: 1 },
  // CON sources
  E1: { e0: 0, e1: 1, e2: 3, e3: 5 },
  E2: { e0: 0, e1: 1, e2: 3, e3: 5 },
  E7: { e0: 0, e1: 2, e2: 4, e3: 6 },
  B7: { lt_week: 1, w1_4: 2, m1_3: 3, m6_plus: 5 },
  B8: { e0: 0, e1: 2, e2: 4 },
  // DEX sources
  A9: { 1: 0, 2: 1, 3: 2, 4: 4, 5: 5 },
  F5: { yes: 5, no: 1 },
  E5: { lt2h: 1, h2_5: 3, h5_plus: 5 },
  B6: { yes: 4, no: 1 },
  // CHA sources
  A5: { confident: 2, supported: 4, ahead: 3, calm: 3, other: 2 },
  A6: { professional: 4, modern: 3, efficient: 2, creative: 3, other: 2 },
  F2: { coach: 4, massage: 4, astrology: 4, content: 5, ecommerce: 3, service: 3, tech: 1, other: 2 },
  // STR sources (low-confidence: numeric proxies only)
  F4: { solo: 2, helpers: 3, small: 4, large: 6 },
}

export const INVERSE_LIKERT = new Set(['B1'])
