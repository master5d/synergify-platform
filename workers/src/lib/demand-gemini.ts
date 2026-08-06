import type { CatalogEntry } from './course-catalog'

export interface DemandClassification {
  classification: 'covered' | 'gap' | 'not_feasible' | 'unclassified'
  matched_module: string | null
  gap_topic_key: string | null
  gap_topic_label: { ru: string; en: string } | null
  feasibility_note: string | null
  value_tier: 'high' | 'normal'
}

function unclassified(n: number): DemandClassification[] {
  return Array.from({ length: n }, () => ({
    classification: 'unclassified' as const,
    matched_module: null, gap_topic_key: null, gap_topic_label: null,
    feasibility_note: null, value_tier: 'normal' as const,
  }))
}

export async function classifyDemand(
  signals: { source: string; text: string }[],
  catalog: CatalogEntry[],
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DemandClassification[]> {
  if (!signals.length) return []
  const model = 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const catalogText = catalog.map(c => `${c.slug}: ${c.topic.en}`).join('\n')
  const signalsText = signals.map((s, i) => `${i}. (${s.source}) ${s.text}`).join('\n')
  const prompt = [
    `You triage learner requests for an AI course against its existing modules.`,
    `Course modules:\n${catalogText}`,
    `Learner requests (one per line, index-prefixed):\n${signalsText}`,
    `For EACH request, decide: "covered" (an existing module already teaches it — set matched_module to its slug),`,
    `"gap" (feasible to build in an agentic-AI environment but not yet covered — set gap_topic_key to a short english kebab slug and gap_topic_label to {ru,en}),`,
    `or "not_feasible" (cannot be done with agentic AI — set feasibility_note explaining why).`,
    `Also set value_tier: "high" if it implies direct revenue or an explicit deadline, else "normal".`,
    `Return STRICT JSON array, one object per request IN ORDER, each:`,
    `{"classification","matched_module","gap_topic_key","gap_topic_label","feasibility_note","value_tier"}.`,
    `Use null for fields that do not apply.`,
  ].join('\n')
  try {
    const res = await fetchImpl(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    })
    if (!res.ok) throw new Error(`gemini ${res.status}`)
    const data = await res.json() as any
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    const parsed = JSON.parse(text) as DemandClassification[]
    if (!Array.isArray(parsed) || parsed.length !== signals.length) throw new Error('shape')
    return parsed
  } catch {
    return unclassified(signals.length)
  }
}

export interface BriefProposal {
  proposed_type: 'module' | 'unit'
  title: { ru: string; en: string }
  learning_objective: string
  slot: string
  agentic_approach: string
  unit_count_estimate: number
  source_quotes: string[]
}

function fallbackBrief(label: { ru: string; en: string }, quotes: string[]): BriefProposal {
  return {
    proposed_type: 'unit',
    title: { ru: label.ru, en: label.en },
    learning_objective: label.en,
    slot: 'to be decided by architect',
    agentic_approach: 'Drafted from raw demand (Gemini unavailable); architect to specify.',
    unit_count_estimate: 1,
    source_quotes: quotes,
  }
}

export async function draftBrief(
  topicLabel: { ru: string; en: string },
  quotes: string[],
  catalog: CatalogEntry[],
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<BriefProposal> {
  const model = 'gemini-2.5-pro'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const catalogText = catalog.map(c => `${c.slug}: ${c.topic.en}`).join('\n')
  const prompt = [
    `You are a course architect for an agentic-AI course. Learners asked for content not yet covered.`,
    `Topic: ${topicLabel.en} / ${topicLabel.ru}.`,
    `Learner quotes:\n${quotes.map(q => `- ${q}`).join('\n')}`,
    `Existing modules:\n${catalogText}`,
    `Pedagogy: each unit follows 4 phases — Activation, Reflection, Concept, Practice. Modules are numbered 00–08.`,
    `Propose how to deliver this. Return STRICT JSON:`,
    `{"proposed_type":"module"|"unit","title":{"ru","en"},"learning_objective","slot","agentic_approach","unit_count_estimate","source_quotes"}.`,
    `"slot" says where it fits (e.g. "unit inside 07-tools" or "new module after 08-agent-engineering").`,
    `"agentic_approach" explains how it is built and taught using agentic AI. Echo the input quotes in source_quotes.`,
  ].join('\n')
  try {
    const res = await fetchImpl(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
      }),
    })
    if (!res.ok) throw new Error(`gemini ${res.status}`)
    const data = await res.json() as any
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    const parsed = JSON.parse(text) as BriefProposal
    if (!parsed?.title?.ru || !parsed?.proposed_type) throw new Error('shape')
    return parsed
  } catch {
    return fallbackBrief(topicLabel, quotes)
  }
}
