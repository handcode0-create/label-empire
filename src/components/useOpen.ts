import { GRADIENTS } from '../data/people'
import { hash } from '../engine/rng'
import { useGame } from '../store/gameStore'

export const gradientFor = (id: string) => GRADIENTS[hash(id) % GRADIENTS.length]

/** Ouvre une fiche (artiste, titre, label) depuis n'importe quel écran. */
export function useOpen() {
  const { select, go } = useGame()
  const g = useGame((s) => s.game)!
  return {
    artist: (id: string | undefined) => { if (!id) return; if (g.artists.some((a) => a.id === id)) select({ artistId: id, rivalId: null }); else select({ rivalId: id }); go('Artiste') },
    song: (id: string | undefined) => { if (!id) return; select({ viewSongId: id }); go('Titre') },
    label: (name: string | undefined) => { if (!name) return; select({ labelName: name }); go('Label') },
  }
}
