#!/usr/bin/env node
/**
 * Génère automatiquement les avatars via l'API d'images d'OpenAI et les dépose dans avatars_src/.
 * Les prompts viennent de docs/avatars/prompts.json (source : tools/avatars/prompts.py), aucune liste à recopier.
 *
 * Usage :
 *   OPENAI_API_KEY=... npm run avatars:generate            # tout ce qui manque
 *   npm run avatars:generate -- --only story               # seulement les fichiers dont le nom contient "story"
 *   npm run avatars:generate -- --force                    # régénère même si le fichier existe
 *   npm run avatars:generate -- --dry                      # affiche ce qui serait généré, sans appel API
 * Puis : npm run avatars  (conversion WebP 512 px + manifeste)
 *
 * Variables (.env à la racine ou environnement) : OPENAI_API_KEY (obligatoire), OPENAI_IMAGE_MODEL (défaut gpt-image-1).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

// .env minimal, sans dépendance
const envFile = path.join(root, '.env')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const args = process.argv.slice(2)
const force = args.includes('--force')
const dry = args.includes('--dry')
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
const key = process.env.OPENAI_API_KEY

const items = JSON.parse(fs.readFileSync(path.join(root, 'docs/avatars/prompts.json'), 'utf8')).filter((i) => !only || i.file.includes(only))
const outDir = path.join(root, 'avatars_src')
fs.mkdirSync(outDir, { recursive: true })

if (!key && !dry) {
  console.error('❌ OPENAI_API_KEY manquante : ajoutez-la dans un fichier .env à la racine (OPENAI_API_KEY=sk-...).')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function generate(prompt) {
  const body = { model, prompt, n: 1, size: '1024x1024' }
  if (model.startsWith('dall-e')) body.response_format = 'b64_json'
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const json = await res.json()
      const d = json.data?.[0]
      if (d?.b64_json) return Buffer.from(d.b64_json, 'base64')
      if (d?.url) return Buffer.from(await (await fetch(d.url)).arrayBuffer())
      throw new Error('Réponse sans image')
    }
    const text = await res.text()
    // 429 (quota/débit) et 5xx : on réessaie avec une pause croissante
    if ((res.status === 429 || res.status >= 500) && attempt < 3) { await sleep(attempt * 15000); continue }
    throw new Error(`HTTP ${res.status} : ${text.slice(0, 300)}`)
  }
}

let done = 0, skipped = 0, failed = 0
console.log(`🚀 ${items.length} avatar(s) à traiter avec ${model}${dry ? ' (simulation)' : ''}`)
for (const [i, item] of items.entries()) {
  const target = path.join(outDir, item.file)
  const tag = `[${i + 1}/${items.length}]`
  if (fs.existsSync(target) && !force) { console.log(`${tag} ⏩ déjà là : ${item.file}`); skipped++; continue }
  if (dry) { console.log(`${tag} 📝 ${item.file}`); continue }
  try {
    console.log(`${tag} 🎨 ${item.file}…`)
    fs.writeFileSync(target, await generate(item.prompt))
    console.log(`${tag} ✅ ${item.file}`)
    done++
    await sleep(1000)
  } catch (e) {
    console.error(`${tag} ❌ ${item.file} : ${e.message}`)
    failed++
  }
}
console.log(`\n✨ Terminé : ${done} générée(s), ${skipped} déjà présente(s), ${failed} échec(s).`)
if (done) console.log('Étape suivante : npm run avatars  (conversion en WebP et mise à jour du manifeste)')
if (failed) process.exitCode = 1
