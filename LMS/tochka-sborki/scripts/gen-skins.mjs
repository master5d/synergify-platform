// scripts/gen-skins.mjs
// Dev-time only. Generates web/lib/rpg/skins/<skin>.json via Gemini.
// Usage: GEMINI_API_KEY=... node scripts/gen-skins.mjs [skin1 skin2 ...]
import { writeFileSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const KEY = process.env.GEMINI_API_KEY
if (!KEY) { console.error('Set GEMINI_API_KEY'); process.exit(1) }

const MODULE_SLUGS = [
  '00-kickstart','01-introduction','02-setup-guide','03-stack-selection',
  '04-prompt-engineering','05-context-memory','06-audio-pipeline','07-tools','08-agent-engineering',
]

// Read real module titles (RU) for grounding.
function moduleTitles() {
  const out = {}
  for (const slug of MODULE_SLUGS) {
    const meta = JSON.parse(readFileSync(join(ROOT, 'web/content/ru', slug, '_meta.json'), 'utf8'))
    out[slug] = { title: meta.title, description: meta.description }
  }
  return out
}

const SKIN_TONES = {
  'slavic-myth': 'warm Slavic folklore, house-spirit (домовой) metaphors, oral-storytelling, unhurried',
  'dark-fantasy': 'serious, atmospheric, morally complex, earned gravitas',
  'cyber-noir': 'dry, precise, ironic, urban, zero fluff',
  'space-opera': 'epic, expansive, optimistic, mission/crew framing',
  'anime-quest': 'high-energy, training-arc, celebratory, urgent',
  'soviet-heroic': 'dry collective humor, смекалка, pragmatic, anti-glamour',
  'mystic-arcane': 'symbolic, intuitive, arcane/spell metaphors',
}

async function gen(skin) {
  const titles = moduleTitles()
  const prompt = [
    `You localize an AI course into an RPG "world skin". Skin: ${skin}. Tone: ${SKIN_TONES[skin]}.`,
    `For EACH of these 9 modules, invent a short zone name and a quest title in that tone, in BOTH Russian and English.`,
    `Modules (slug → real title): ${JSON.stringify(titles)}`,
    `Russian is primary; keep technical terms (API, prompt, agent, MCP) untranslated. Keep names short (zone ≤ 3 words, quest ≤ 7 words).`,
    `Return STRICT JSON: {"zoneNames":{"<slug>":{"ru","en"}},"questTitles":{"<slug>":{"ru","en"}}} covering all 9 slugs.`,
  ].join('\n')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${KEY}`
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.85 } }) })
  if (!res.ok) throw new Error(`${skin}: gemini ${res.status}`)
  const data = await res.json()
  const parsed = JSON.parse(data.candidates[0].content.parts[0].text)
  const pack = { skin, zoneNames: parsed.zoneNames, questTitles: parsed.questTitles }
  // validate coverage
  for (const slug of MODULE_SLUGS) {
    if (!pack.zoneNames?.[slug]?.ru || !pack.questTitles?.[slug]?.ru) throw new Error(`${skin}: missing ${slug}`)
  }
  writeFileSync(join(ROOT, 'web/lib/rpg/skins', `${skin}.json`), JSON.stringify(pack, null, 2) + '\n')
  console.log(`✓ ${skin}`)
}

function unitList(module) {
  const dir = join(ROOT, 'web/content/ru', module)
  return readdirSync(dir)
    .filter(f => /^u\d.*\.mdx$/.test(f))
    .sort()
    .map(f => {
      const slug = f.replace(/\.mdx$/, '')
      const raw = readFileSync(join(dir, f), 'utf8')
      const m = raw.match(/title:\s*"([^"]+)"/)
      return { slug, title: m ? m[1] : slug }
    })
}

function expectedUnitCount() {
  return MODULE_SLUGS.reduce((n, m) => n + unitList(m).length, 0)
}

async function genUnitsForModule(skin, module) {
  const units = unitList(module)
  const prompt = [
    `You theme an AI course into the "${skin}" world skin. Tone: ${SKIN_TONES[skin]}.`,
    `Module: ${module}. For EACH unit below write themed framing in BOTH Russian and English:`,
    `- intro: 1-2 sentences setting the scene before the lesson, in the skin's voice.`,
    `- mentorHint: ONE short encouraging line from the skin's mentor character, referencing the unit's topic.`,
    `- outro: 1-2 sentences celebrating completion and bridging onward.`,
    `Units (slug -> real title): ${JSON.stringify(units)}`,
    `Russian is primary; keep technical terms (API, prompt, agent, MCP) untranslated. Keep each field concise.`,
    `Return STRICT JSON: {"<slug>":{"intro":{"ru","en"},"mentorHint":{"ru","en"},"outro":{"ru","en"}}} covering every unit slug.`,
  ].join('\n')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${KEY}`
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.85 } }),
  })
  if (!res.ok) throw new Error(`${skin}/${module}: gemini ${res.status}`)
  const data = await res.json()
  const parsed = JSON.parse(data.candidates[0].content.parts[0].text)
  const out = {}
  for (const u of units) {
    const f = parsed[u.slug]
    if (!f?.intro?.ru || !f?.mentorHint?.ru || !f?.outro?.ru) throw new Error(`${skin}/${module}: missing ${u.slug}`)
    out[`${module}/${u.slug}`] = { intro: f.intro, mentorHint: f.mentorHint, outro: f.outro }
  }
  return out
}

async function genUnits(skin) {
  const packPath = join(ROOT, 'web/lib/rpg/skins', `${skin}.json`)
  const pack = JSON.parse(readFileSync(packPath, 'utf8'))
  pack.units = pack.units ?? {}
  for (const module of MODULE_SLUGS) {
    Object.assign(pack.units, await genUnitsForModule(skin, module))
    console.log(`  ✓ ${skin}/${module}`)
  }
  const expected = expectedUnitCount()
  if (Object.keys(pack.units).length !== expected) {
    throw new Error(`${skin}: expected ${expected} unit keys, got ${Object.keys(pack.units).length}`)
  }
  writeFileSync(packPath, JSON.stringify(pack, null, 2) + '\n')
  console.log(`✓ ${skin} units`)
}

const args = process.argv.slice(2)
const unitsMode = args.includes('--units')
const named = args.filter(a => a !== '--units')
const targets = named.length ? named : Object.keys(SKIN_TONES)
for (const s of targets) {
  try { await (unitsMode ? genUnits(s) : gen(s)) }
  catch (e) { console.error('✗', e.message) }
}
