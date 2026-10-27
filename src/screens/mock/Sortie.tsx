import { useMemo, useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import Slider from '../../components/Slider'
import { LOC_OPTIONS } from '../../data/people'
import { CITIES, affinity } from '../../data/world'
import { MEDIA, mediaScopeLabel } from '../../data/media'
import { MediaLogo } from '../../components/Logo'
import { STREAM_VALUE, royaltyShare, weeklyStreams } from '../../engine/market'
import { STRATEGIES, releaseCalendar, releaseCost, scheduleRelease } from '../../engine/production'
import { fansByCity } from '../../engine/selectors'
import type { SongRelease } from '../../engine/types'
import { useGame } from '../../store/gameStore'
import { compact, currentSong, usd } from '../../lib'

type Strat = keyof typeof STRATEGIES
const RISK_TAG: Record<Strat, string> = { locale: 'tg', regionale: 'te', mondiale: 'tr_', crossover: 'ti' }

export default function Sortie() {
  const g = useGame((s) => s.game)!
  const { sel, run, say, go } = useGame()
  const song = currentSong(g, sel.songId, ['mixed'])
  const fans = fansByCity(g)
  const unlocked = useMemo(() => CITIES.filter((c) => c.minRep <= g.reputation).sort((a, b) => (fans[b.id] ?? 0) - (fans[a.id] ?? 0) || b.base - a.base), [g, fans])
  const [strategy, setStrategy] = useState<Strat>('regionale')
  const [cityIds, setCityIds] = useState<string[]>(() => unlocked.slice(0, 5).map((c) => c.id))
  const [loc, setLoc] = useState<string[]>([])
  const [media, setMedia] = useState<string[]>([])
  const [tab, setTab] = useState<'media' | 'loc'>('media')
  const [promo, setPromo] = useState(Math.min(5000, Math.max(0, Math.floor(g.cash * 0.1 / 500) * 500)))
  const [week, setWeek] = useState<number | null>(sel.week)
  if (!song) return (
    <div className="scr"><Dock active="sorties" /><Hud />
      <div className="main"><div className="pn cut" style={{maxWidth: 640}}><div className="h2">Aucun titre prêt à sortir</div><p className="mut">Terminez d'abord l'écriture, l'enregistrement et le mixage d'une chanson.</p><a href="Ecriture.dc.html" className="btn">Écrire un titre</a></div></div></div>
  )
  const artist = g.artists.find((a) => a.id === song.artistId)!
  const locWeeks = Math.max(0, ...loc.map((id) => LOC_OPTIONS.find((l) => l.id === id)?.weeks ?? 0))
  const from = Math.max(g.week + locWeeks, song.readyWeek)
  const chosen = week && week >= from ? week : from
  const cal = releaseCalendar(g, from, 5)
  const strat = STRATEGIES[strategy]
  const draft: SongRelease = { week: chosen, strategy, cityIds, promo, loc, media }
  const cost = releaseCost(draft)
  const proj = (() => {
    const sim = { ...song, release: draft, stage: 'released' as const }
    let streams = 0, revenue = 0
    for (const c of CITIES) {
      const st = weeklyStreams(g, sim, c, chosen)
      streams += st
      revenue += st * STREAM_VALUE * (1 - c.piracy) * (1 - c.tax) * (1 - royaltyShare(g, song))
    }
    return { streams, revenue, fans: streams * 0.02 * (0.7 + artist.skills.charisme / 150) }
  })()
  const range = (v: number, f: (n: number) => string) => `${f(v * 0.8)} – ${f(v * 1.2)}`
  const toggleCity = (id: string) => {
    if (cityIds.includes(id)) return setCityIds(cityIds.filter((x) => x !== id))
    if (cityIds.length >= strat.maxCities) return say(`La stratégie ${strat.label.toLowerCase()} limite à ${strat.maxCities} territoire(s).`, 'err')
    setCityIds([...cityIds, id])
  }
  const pickStrategy = (k: Strat) => {
    setStrategy(k)
    const max = STRATEGIES[k].maxCities
    if (k === 'mondiale') setCityIds(unlocked.map((c) => c.id))
    else setCityIds(cityIds.slice(0, max).length ? cityIds.slice(0, max) : unlocked.slice(0, max).map((c) => c.id))
  }
  const submit = () => { if (run((s) => scheduleRelease(s, song.id, draft))) go('Hub') }
  return (
    <div className="scr">
      <Dock active="sorties" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}><h1 className="h1">Programmer la sortie</h1><a href="Projets.dc.html" className="chip">EP & albums</a><span className="tag ti">« {song.title} » · {artist.stageName} · qualité {song.quality}</span></div>
        <div style={{display: 'flex', gap: 20, marginTop: 16}}>
          <div style={{width: 820}}>
            <div className="lbl">Stratégie</div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 10}}>
              {(Object.keys(STRATEGIES) as Strat[]).map((k) => (
                <div key={k} className={'pn' + (k === strategy ? ' sel' : '')} role="button" tabIndex={0} onClick={() => pickStrategy(k)} style={{padding: '14px 16px', cursor: 'pointer'}}><b>{STRATEGIES[k].label}</b><div className="mut" style={{fontSize: 13, marginTop: 4}}>{STRATEGIES[k].desc}</div><div style={{marginTop: 8}}><span className={'tag ' + RISK_TAG[k]}>{STRATEGIES[k].risk}</span></div></div>
              ))}
            </div>
            <div style={{display: 'flex', gap: 20, marginTop: 18}}>
              <div className="pn" style={{flex: 1}}>
                <div className="lbl">Territoires de la sortie ({cityIds.length}{strat.maxCities < 99 ? `/${strat.maxCities}` : ''})</div>
                <div style={{marginTop: 6, maxHeight: 340, overflow: 'auto'}}>
                  {unlocked.slice(0, 10).map((c) => { const a = affinity(song.genre, c); const on = cityIds.includes(c.id); return (
                    <div key={c.id} className="row" onClick={() => toggleCity(c.id)} style={{gridTemplateColumns: '24px 1fr 80px 90px', cursor: 'pointer'}}><span style={{color: on ? '#FF7DBB' : '#9C90CC'}}>{on ? '■' : '□'}</span><b>{c.name}</b><span className="mut" style={{fontSize: 13}}>{compact(fans[c.id] ?? 0)} fans</span><span className={'tag ' + (a >= 1.2 ? 'tg' : a >= 1 ? 'tc' : 'te')}>Affinité {a.toFixed(1).replace('.', ',')}</span></div>) })}
                  {CITIES.filter((c) => c.minRep > g.reputation).slice(0, 2).map((c) => <div key={c.id} className="row" style={{gridTemplateColumns: '24px 1fr 170px', opacity: 0.5}}><span>🔒</span><b>{c.name}</b><span className="mut" style={{fontSize: 13}}>Réputation {c.minRep} requise</span></div>)}
                </div>
              </div>
              <div className="pn" style={{width: 340}}>
                <div style={{display: 'flex', gap: 8}}>
                  <span className={'chip' + (tab === 'media' ? ' on' : '')} role="button" onClick={() => setTab('media')}>Médias & marketing</span>
                  <span className={'chip' + (tab === 'loc' ? ' on' : '')} role="button" onClick={() => setTab('loc')}>Localisation</span>
                </div>
                {tab === 'loc' ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12, fontSize: 14}}>
                  {LOC_OPTIONS.map((l) => { const on = loc.includes(l.id); return (
                    <div key={l.id} style={{cursor: 'pointer'}} onClick={() => setLoc(on ? loc.filter((x) => x !== l.id) : [...loc, l.id])}><span style={{color: on ? '#FF7DBB' : '#9C90CC'}}>{on ? '■' : '□'}</span> <b>{l.name}</b><div className="mut" style={{fontSize: 13, marginLeft: 20}}>{usd(l.cost)} · {l.weeks} semaine{l.weeks > 1 ? 's' : ''} · {l.desc}</div></div>) })}
                </div>) : (
                <div style={{marginTop: 8, maxHeight: 320, overflow: 'auto'}}>
                  {MEDIA.map((m) => { const on = media.includes(m.id); const locked = m.minRep > g.reputation; return (
                    <div key={m.id} className="row" role="button" style={{gridTemplateColumns: '44px 1fr auto', gap: 10, cursor: locked ? 'default' : 'pointer', opacity: locked ? 0.5 : 1, background: on ? '#3A1B52' : undefined}} onClick={() => { if (locked) return say(`${m.name} exige ${m.minRep} de réputation.`, 'err'); setMedia(on ? media.filter((x) => x !== m.id) : [...media, m.id]) }}>
                      <MediaLogo id={m.id} size={40} />
                      <div><b style={{fontSize: 14}}>{m.name}</b><div className="mut" style={{fontSize: 12}}>{m.kind} · {mediaScopeLabel(m)}{locked ? ` · 🔒 Réputation ${m.minRep}` : ` · +${Math.round(m.boost * 100)} %`}</div></div>
                      <span style={{color: on ? '#FF7DBB' : '#FFC63D', fontSize: 13, fontWeight: 700}}>{on ? '■' : usd(m.cost)}</span>
                    </div>) })}
                </div>)}
              </div>
            </div>
          </div>
          <div style={{width: 440, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn">
              <div className="lbl">Calendrier</div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 10, textAlign: 'center', fontSize: 13}}>
                {cal.map((c) => (
                  <div key={c.week} className={'pn' + (c.week === chosen ? ' sel' : '')} role="button" tabIndex={0} onClick={() => setWeek(c.week)} style={{padding: '10px 4px', cursor: 'pointer'}}><div className="lbl">S{(c.week - 1) % 52 + 1}</div><div style={{marginTop: 4, fontWeight: c.week === chosen ? 700 : 400, color: c.week === chosen ? undefined : c.tone === 'fest' ? '#FFC63D' : c.tone === 'rival' ? '#FF5470' : undefined}}>{c.week === chosen ? 'Sortie' : c.tone === 'fest' ? 'Fête locale' : c.tone === 'rival' ? 'Rival' : 'Libre'}</div></div>
                ))}
              </div>
            </div>
            <div className="pn">
              <div className="lbl">Budget de promotion</div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 100px', gap: 16, alignItems: 'center', marginTop: 14}}><Slider min={0} max={30000} step={500} value={promo} onChange={setPromo} /><b style={{textAlign: 'right', color: '#FFC63D', fontSize: 18}}>{usd(promo)}</b></div>
              <div className="mut" style={{fontSize: 13, marginTop: 10}}>Radio, TV, presse et web : les médias choisis ({media.length}) boostent les écoutes dans leur zone. Coût total de la sortie : <b style={{color: '#FFC63D'}}>{usd(cost)}</b>.</div>
            </div>
            <div className="pn cut">
              <div className="lbl">Projection de la première semaine</div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 10}}>
                <div><div className="mut" style={{fontSize: 13}}>Écoutes</div><div className="disp" style={{fontSize: 26}}>{range(proj.streams, compact)}</div></div>
                <div><div className="mut" style={{fontSize: 13}}>Revenus</div><div className="disp" style={{fontSize: 26, color: '#FFC63D'}}>{range(proj.revenue, (n) => '$' + compact(n))}</div></div>
                <div><div className="mut" style={{fontSize: 13}}>Nouveaux fans</div><div className="disp" style={{fontSize: 26, color: '#35D3F0'}}>+{range(proj.fans, compact)}</div></div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 6}}><span className="tag te">Estimé</span><span className="tag ti">Effet viral incertain</span></div>
              </div>
            </div>
            <div className="sp" />
            <div style={{display: 'flex', gap: 12}}><a href="Mixage.dc.html" className="btn s">Retour</a><a href="Hub.dc.html" className="btn" style={{flex: 1, height: 60}} onClick={(e) => { e.preventDefault(); submit() }}>Programmer la sortie</a></div>
          </div>
        </div>
      </div>
    </div>
  )
}
