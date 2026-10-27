import type { Rng } from '../engine/rng'

/** Banques de mots par thème et par langue pour proposer un titre automatiquement. */
/** Noms : « mot|genre » ; adjectifs : « masculin/féminin » (ou une seule forme invariable). */
const FR: Record<string, { n: string[]; a: string[]; p: string[] }> = {
  Amour: { n: ['Cœur|m', 'Baiser|m', 'Promesse|f', 'Étreinte|f', 'Regard|m', 'Déclaration|f', 'Rendez-vous|m'], a: ['interdit/interdite', 'sauvage', 'éternel/éternelle', 'brûlant/brûlante', 'secret/secrète', 'doux/douce'], p: ['Ton nom dans le vent', 'Reste encore', 'Toi et moi', 'Mon soleil', 'Pour la vie', 'Dis-moi oui'] },
  Fête: { n: ['Nuit|f', 'Soirée|f', 'Piste|f', 'Ambiance|f', 'Podium|m', 'Samedi|m'], a: ['sans fin', 'électrique', 'en feu', 'doré/dorée', 'fou/folle', 'infini/infinie'], p: ['On danse jusqu’au matin', 'Tout le monde debout', 'Allume la ville', 'Bouge ton corps', 'Cette nuit est à nous', 'Monte le son'] },
  Ambition: { n: ['Couronne|f', 'Sommet|m', 'Chemin|m', 'Empire|m', 'Racine|f', 'Héritage|m', 'Étoile|f'], a: ['sans limite', 'invaincu/invaincue', 'brillant/brillante', 'royal/royale', 'têtu/têtue', 'de diamant'], p: ['Je ne lâche rien', 'Plus haut que les toits', 'Devenir légende', 'Le monde m’attend', 'Jamais à genoux', 'Premier de la route'] },
  Société: { n: ['Quartier|m', 'Rue|f', 'Jeunesse|f', 'Voix|f', 'Frontière|f', 'Miroir|m', 'Génération|f'], a: ['debout', 'oublié/oubliée', 'en colère', 'lumineux/lumineuse', 'uni/unie', 'libre'], p: ['Écoute la rue', 'On est encore là', 'Le peuple chante', 'Les murs parlent', 'Demain nous appartient', 'Même ciel, même combat'] },
}
const EN: Record<string, { n: string[]; a: string[]; p: string[] }> = {
  Amour: { n: ['Heart', 'Kiss', 'Promise', 'Embrace', 'Glance'], a: ['of Gold', 'Forbidden', 'Wild', 'Eternal', 'Burning'], p: ['Stay With Me', 'You and I', 'Say Yes Tonight', 'My Sunshine'] },
  Fête: { n: ['Night', 'Party', 'Dance Floor', 'Weekend', 'Vibe'], a: ['Electric', 'On Fire', 'Golden', 'Endless', 'Crazy'], p: ['Dance Till Morning', 'Turn It Up', 'Light Up the City', 'Everybody Move'] },
  Ambition: { n: ['Crown', 'Summit', 'Empire', 'Roots', 'Legacy'], a: ['of Diamonds', 'Unbroken', 'Royal', 'Unstoppable', 'Fearless'], p: ['I Never Let Go', 'Higher Than Rooftops', 'Become a Legend', 'The World Is Waiting'] },
  Société: { n: ['Streets', 'Youth', 'Voice', 'Border', 'Mirror'], a: ['Awake', 'Forgotten', 'United', 'Free', 'Loud'], p: ['Hear the Streets', 'We Are Still Here', 'Tomorrow Is Ours', 'Same Sky'] },
}
const MOOD_TAIL: Record<string, string[]> = { Mélancolique: ['sous la pluie', 'à minuit', 'sans toi'], Solaire: ['au soleil', 'en plein jour', 'sur la plage'], Intense: ['à fond', 'sans pitié', 'en feu'] }
const MOOD_TAIL_EN: Record<string, string[]> = { Mélancolique: ['in the Rain', 'at Midnight', 'Without You'], Solaire: ['in the Sun', 'by the Sea', 'All Day'], Intense: ['No Mercy', 'Full Blast', 'on Fire'] }
const NOUCHI = ['Gbê', 'Djê', 'Zangbê', 'Môgô', 'Gnangnan', 'Warba']

const startsVowel = (w: string) => /^[aeiouyhéèêœâî]/i.test(w)
function frNoun(entry: string, adj?: string): string {
  const [w, g] = entry.split('|')
  const art = startsVowel(w) ? 'L’' : g === 'f' ? 'La ' : 'Le '
  const low = w[0].toLowerCase() + w.slice(1)
  if (!adj) return art + low
  const [m, f] = adj.split('/')
  return `${art}${low} ${g === 'f' ? f ?? m : m}`
}

/** Propose un titre. `taken` : titres déjà utilisés, évités. */
export function generateTitle(rng: Rng, o: { theme: string; mood: string; lang: string; genre?: string }, taken: string[] = []): string {
  const english = o.lang === 'anglais'
  const bank = (english ? EN : FR)[o.theme] ?? (english ? EN : FR).Amour
  const tails = (english ? MOOD_TAIL_EN : MOOD_TAIL)[o.mood] ?? []
  const used = new Set(taken.map((t) => t.toLowerCase()))
  for (let i = 0; i < 24; i++) {
    const r = rng.next()
    let t: string
    if (english) t = r < 0.4 ? rng.pick(bank.p) : r < 0.85 ? `${rng.pick(bank.n)} ${rng.pick(bank.a)}` : `${rng.pick(bank.p)} ${rng.pick(tails.length ? tails : bank.a)}`
    else if (o.lang === 'nouchi' && r < 0.45) t = r < 0.22 ? `${rng.pick(NOUCHI)} ${rng.pick(bank.p)}` : `${rng.pick(NOUCHI)} ${rng.pick(bank.n).split('|')[0]}`
    else if (r < 0.3) t = rng.pick(bank.p)
    else if (r < 0.75) t = frNoun(rng.pick(bank.n), rng.pick(bank.a))
    else if (tails.length) { const [w] = rng.pick(bank.n).split('|'); t = `${w} ${rng.pick(tails)}` }
    else t = frNoun(rng.pick(bank.n))
    if (!used.has(t.toLowerCase())) return t
  }
  return `${rng.pick(bank.p)} ${rng.int(2, 99)}`
}
