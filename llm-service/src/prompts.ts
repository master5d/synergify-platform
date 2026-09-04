import type { ProseInput, CatalogEntry, Signal } from './types.js'

export function buildProsePrompt(i: ProseInput): string {
  return [
    `You write RPG character-sheet prose for a learning platform.`,
    `Language: ${i.language}. Register: ${i.register ?? 'neutral'}. World skin: ${i.worldSkin}. Class: ${i.charClass}. Niche: ${i.niche ?? 'n/a'}.`,
    `Learner aspirational figure (G11): ${i.aspirational ?? 'n/a'}.`,
    `Desired first win: ${i.firstWin ?? 'n/a'}. Success definition: ${i.successDef ?? 'n/a'}.`,
    `Return STRICT JSON: {"legendaryTitle","backstory","firstQuest","finalBoss"}.`,
    `Tone must match the world skin. Backstory uses the aspirational figure. finalBoss frames the ultimate challenge.`,
  ].join('\n')
}

export function buildSkinPrompt(film: string, skins: readonly string[]): string {
  return `Map this film/series to ONE world skin from [${skins.join('|')}]. Reply with STRICT JSON {"skin":"<key>"}. Film: "${film}"`
}

export function buildDemandClassifyPrompt(signals: Signal[], catalog: CatalogEntry[]): string {
  const catalogText = catalog.map(c => `${c.slug}: ${c.topic.en}`).join('\n')
  const signalsText = signals.map((s, i) => `${i}. (${s.source}) ${s.text}`).join('\n')
  return [
    `You triage learner requests for an AI course against its existing modules.`,
    `Course modules:\n${catalogText}`,
    `Learner requests (one per line, index-prefixed):\n${signalsText}`,
    `For EACH request, decide: "covered" (an existing module already teaches it — set matched_module to its slug),`,
    `"gap" (feasible to build in an agentic-AI environment but not yet covered — set gap_topic_key to a short english kebab slug and gap_topic_label to {ru,en}),`,
    `or "not_feasible" (cannot be done with agentic AI — set feasibility_note explaining why).`,
    `Also set value_tier: "high" if it implies direct revenue or an explicit deadline, else "normal".`,
    `Return STRICT JSON {"items":[...]}, one object per request IN ORDER, each:`,
    `{"classification","matched_module","gap_topic_key","gap_topic_label","feasibility_note","value_tier"}.`,
    `Use null for fields that do not apply.`,
  ].join('\n')
}

export function buildBriefPrompt(
  topicLabel: { ru: string; en: string }, quotes: string[], catalog: CatalogEntry[],
): string {
  const catalogText = catalog.map(c => `${c.slug}: ${c.topic.en}`).join('\n')
  return [
    `You are a course architect for an agentic-AI course. Learners asked for content not yet covered.`,
    `Topic: ${topicLabel.en} / ${topicLabel.ru}.`,
    `Learner quotes:\n${quotes.map(q => `- ${q}`).join('\n')}`,
    `Existing modules:\n${catalogText}`,
    `Pedagogy: each unit follows 4 phases — Activation, Reflection, Concept, Practice. Modules are numbered 00–08.`,
    `Propose how to deliver this. Return STRICT JSON:`,
    `{"proposed_type","title":{"ru","en"},"learning_objective","slot","agentic_approach","unit_count_estimate","source_quotes"}.`,
  ].join('\n')
}
