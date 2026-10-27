import Avatar from '../../components/Avatar'
import { useMemo, useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import Slider from '../../components/Slider'
import { cityById } from '../../data/world'
import { evaluateOffer, renegotiate, signArtist, type Offer } from '../../engine/scouting'
import { sum } from '../../engine/util'
import type { Artist } from '../../engine/types'
import { useGame } from '../../store/gameStore'
import {compact, stars, usd} from '../../lib'

const SCOPES = [['local', 'Un pays'], ['region', 'Continent'], ['monde', 'Monde']] as const
const years = (w: number) => (w % 52 === 0 ? `${w / 52} an${w > 52 ? 's' : ''}` : `${w} sem.`)

export default function Contrat() {
  const g = useGame((s) => s.game)!
  const { sel, run, select, go } = useGame()
  const cand = g.pool.find((x) => x.id === sel.candidateId)
  const existing = !cand ? g.artists.find((x) => x.id === sel.artistId && x.contract) : undefined
  const base: Artist | undefined = cand ?? (existing ? { ...existing, asking: { advance: Math.max(2000, existing.contract!.advance), royalty: existing.contract!.royalty, weeks: 104 } } : undefined)
  const [offer, setOffer] = useState<Offer | null>(null)
  const o: Offer | null = offer ?? (base ? { advance: base.asking!.advance, royalty: base.asking!.royalty, weeks: base.asking!.weeks, scope: existing?.contract?.scope ?? 'region' } : null)
  const ev = useMemo(() => (base && o ? evaluateOffer(g, base, o) : null), [g, base, o])
  if (!base || !o || !ev) return (
    <div className="scr"><Dock active="artistes" /><Hud /><div className="main"><div className="pn cut" style={{maxWidth: 600}}><div className="h2">Aucun contrat à négocier</div><p className="mut">Choisissez un artiste depuis la liste de découverte ou « Mes artistes ».</p><a href="Artistes.dc.html" className="btn">Mes artistes</a></div></div></div>
  )
  const c = cityById(base.originCityId)
  const set = (p: Partial<Offer>) => setOffer({ ...o, ...p })
  const ask = base.asking!
  const labelShare = Math.round((1 - o.royalty) * 100)
  const submit = () => {
    const done = existing ? run((s) => renegotiate(s, existing.id, o)) : run((s) => signArtist(s, base.id, o))
    if (done) { select({ artistId: base.id, candidateId: null }); go('Artistes') }
  }
  const chanceTone = ev.chance === 'Probable' ? 'tg' : ev.chance === 'Incertain' ? 'te' : 'tr_'
  return (
    <div className="scr">
      <Dock active="artistes" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 470, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div className="pn cut" style={{height: 330, padding: 0, overflow: 'hidden', background: 'radial-gradient(300px 220px at 50% 40%, rgba(139,92,246,0.55), transparent), #1C1236', position: 'relative'}}>
            <div className="map" style={{position: 'absolute', inset: 0, opacity: '0.25'}} />
            <Avatar artist={base} size={150} style={{position: 'absolute', left: 160, top: 52}} />
            <div style={{position: 'absolute', left: 24, bottom: 20}}><div className="lbl">{existing ? 'Contrat à renégocier' : 'Artiste à signer'}</div><div className="disp" style={{fontSize: 42, lineHeight: 1}}>{base.stageName.toUpperCase()}</div><div className="mut" style={{fontSize: 14}}>{c.name}, {c.country} · {base.genre.toLowerCase()}</div></div>
            <span className="tag tc" style={{position: 'absolute', right: 20, top: 20}}>Potentiel : {stars(base.potential)}</span>
          </div>
          <div className="bub"><span className="tag ti" style={{marginRight: 8}}>Attentif</span>« {base.rivalInterest ? "J'ai d'autres propositions. Soyez à la hauteur." : 'Je veux une avance correcte et un contrat qui me permette de grandir.'} »</div>
          <div className="pn" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14}}>
            <div><div className="lbl">Ego</div><div style={{marginTop: 4}}>{base.traits.some((t) => /Ambitieux|Exigeant/.test(t)) ? 'Élevé' : 'Moyen'}</div></div>
            <div><div className="lbl">Moral</div><div style={{marginTop: 4}}>{Math.round(base.morale)}</div></div>
            <div><div className="lbl">Langues</div><div style={{marginTop: 4}}>{base.lang}</div></div>
            <div><div className="lbl">Fans actuels</div><div style={{marginTop: 4}}>{compact(sum(base.fans))}</div></div>
          </div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}><h1 className="h1">{existing ? 'Renégocier le contrat' : 'Négocier le contrat'}</h1><span className={'tag ' + chanceTone}>Chances d'acceptation : {ev.chance}</span></div>
          <div className="pn" style={{display: 'grid', gridTemplateColumns: '140px 1fr 110px', gap: '22px 16px', alignItems: 'center'}}>
            <span>Durée</span><Slider min={26} max={156} step={26} value={o.weeks} onChange={(v) => set({ weeks: v })} /><b style={{textAlign: 'right'}}>{years(o.weeks)}</b>
            <span>{existing ? 'Prime de signature' : 'Avance'}</span><Slider min={0} max={Math.max(ask.advance * 3, 10000)} step={500} value={o.advance} onChange={(v) => set({ advance: v })} /><b style={{textAlign: 'right', color: '#FFC63D'}}>{usd(o.advance)}</b>
            <span>Part du label</span><Slider min={30} max={80} step={1} value={labelShare} onChange={(v) => set({ royalty: 1 - v / 100 })} /><b style={{textAlign: 'right'}}>{labelShare} %</b>
            <span>Territoires</span><div style={{display: 'flex', gap: 8}}>{SCOPES.map(([k, l]) => <span key={k} className={'chip' + (o.scope === k ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => set({ scope: k })}>{l}</span>)}</div><b style={{textAlign: 'right'}}>{o.scope === 'local' ? 'Un pays' : o.scope === 'region' ? 'Continent' : 'Monde'}</b>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
            {ev.tags.map((t, i) => (
              <div key={i} className="pn"><span className={'tag ' + ({ Certain: 'tc', Estimé: 'te', Incertain: 'ti', Risque: 'tr_' } as const)[t.tag]}>{t.tag}</span><div style={{marginTop: 8}}><div className="mut" style={{fontSize: 14}}>{t.text}</div></div></div>
            ))}
          </div>
          <div className="sp" />
          <div style={{display: 'flex', gap: 14, justifyContent: 'flex-end', alignItems: 'center'}}>
            <span className="mut" style={{fontSize: 14}}>Cette proposition coûte 1 action ({g.ap}/6 restantes).</span>
            <a href="Artistes.dc.html" className="btn s" onClick={(e) => { e.preventDefault(); go(existing ? 'Artistes' : 'Profil') }}>Annuler</a>
            <a href="Artistes.dc.html" className="btn" style={{height: 60}} onClick={(e) => { e.preventDefault(); submit() }}>{existing ? 'Proposer la révision' : 'Proposer le contrat'}</a>
          </div>
        </div>
      </div>
    </div>
  )
}
