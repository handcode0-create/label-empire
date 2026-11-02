import { useState } from 'react'
import { pitchCost } from '../../engine/prices'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import Cover from '../../components/Cover'
import { CONTINENTS } from '../../data/world'
import { PITCH_COOLDOWN, PLATFORMS, isOnPlatform, lastPitch, pitchChance, pitchPlaylist, platformSplit } from '../../engine/platforms'
import { useGame } from '../../store/gameStore'
import { compact, songName, usd } from '../../lib'

/** Couleur d'identité de chaque plateforme (accord avec les logos générés par tools/logo_gen). */
const BRAND: Record<string, string> = { sonora: '#FF3D9A', vibra: '#FF5470', tembo: '#FFC63D', lotus: '#3DDC97', clipwave: '#35D3F0' }
const logo = (id: string) => `/platforms/${id}.svg`

export default function Plateformes() {
  const g = useGame((s) => s.game)!
  const { run } = useGame()
  const released = g.songs.filter((s) => s.stage === 'released')
  const [songId, setSongId] = useState<string | null>(released[0]?.id ?? null)
  const song = released.find((x) => x.id === songId) ?? released[0]
  const split = platformSplit(g)
  const total = Object.values(split).reduce((a, b) => a + b, 0) || 1
  const songSplit = song ? platformSplit(g, [song]) : {}
  const songTotal = Object.values(songSplit).reduce((a, b) => a + b, 0) || 1
  const live = (id: string) => g.songs.filter((x) => x.stage === 'released' && isOnPlatform(x, id)).length
  const onCount = (sId: string) => { const x = g.songs.find((y) => y.id === sId); return x ? PLATFORMS.filter((p) => isOnPlatform(x, p.id)).length : 0 }
  const sorted = [...PLATFORMS].sort((a, b) => (split[b.id] ?? 0) - (split[a.id] ?? 0))
  const top = sorted[0]

  return (
    <div className="scr">
      <Dock active="sorties" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <h1 className="h1">Plateformes</h1>
          <span className="tag ti">{compact(total)} écoutes réparties</span>
          {top && (split[top.id] ?? 0) > 0 && <span className="tag tg">Leader : {top.name} · {Math.round(((split[top.id] ?? 0) / total) * 100)} %</span>}
          <span className="sp" />
          <a href="Catalogue.dc.html" className="btn s">Catalogue</a>
          <a href="Clips.dc.html" className="btn s">Clips</a>
        </div>

        <div className="pn cut" style={{marginTop: 14}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
            <span className="lbl">Répartition des écoutes du label</span>
            <span className="mut" style={{fontSize: 13}}>Vos titres sont mis en ligne automatiquement dès leur sortie sur chaque plateforme accessible.</span>
          </div>
          <div style={{display: 'flex', height: 22, borderRadius: 11, overflow: 'hidden', marginTop: 12, background: '#1A1030'}}>
            {sorted.map((p) => { const w = ((split[p.id] ?? 0) / total) * 100; return w > 0 ? <div key={p.id} title={`${p.name} · ${Math.round(w)} %`} style={{width: w + '%', background: BRAND[p.id], transition: 'width .6s'}} /> : null })}
          </div>
          <div style={{display: 'flex', gap: 22, marginTop: 12, flexWrap: 'wrap'}}>
            {sorted.map((p) => (
              <div key={p.id} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <img src={logo(p.id)} alt="" width={26} height={26} />
                <span style={{fontWeight: 700}}>{p.name}</span>
                <span className="mut" style={{fontSize: 13}}>{compact(split[p.id] ?? 0)} · {Math.round(((split[p.id] ?? 0) / total) * 100)} %</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, marginTop: 14, alignItems: 'start'}}>
          <div className="pn sel" style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <div className="lbl">Vos titres</div>
            {released.length === 0 && <span className="mut" style={{fontSize: 14}}>Aucun titre sorti. Sortez un titre : il sera mis en ligne automatiquement sur les plateformes.</span>}
            <div style={{display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto', maxHeight: 520}}>
              {released.map((s) => {
                const a = g.artists.find((x) => x.id === s.artistId)
                const on = song?.id === s.id
                return (
                  <div key={s.id} role="button" onClick={() => setSongId(s.id)} style={{display: 'flex', gap: 10, alignItems: 'center', padding: 8, borderRadius: 12, cursor: 'pointer', border: '2px solid ' + (on ? '#FF3D9A' : '#3F2B73'), background: on ? 'rgba(255,61,154,.12)' : 'transparent', transition: 'all .2s'}}>
                    <Cover title={s.title} artist={a?.stageName ?? ''} kind="Single" cover={s.cover} size={52} />
                    <div style={{minWidth: 0, flex: 1}}>
                      <div style={{fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{songName(s)}</div>
                      <div className="mut" style={{fontSize: 12}}>{a?.stageName ?? ''} · {compact(s.stats.streams)} écoutes</div>
                      <div style={{display: 'flex', gap: 4, marginTop: 4}}>
                        {PLATFORMS.map((p) => <img key={p.id} src={logo(p.id)} alt={p.name} title={p.name} width={16} height={16} style={{opacity: isOnPlatform(s, p.id) ? 1 : 0.22, filter: isOnPlatform(s, p.id) ? 'none' : 'grayscale(1)'}} />)}
                        <span className="mut" style={{fontSize: 11, marginLeft: 4}}>{onCount(s.id)}/{PLATFORMS.length}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14}}>
            {PLATFORMS.map((p) => {
              const locked = p.minRep > g.reputation
              const online = !!song && isOnPlatform(song, p.id)
              const pr = song ? lastPitch(g, song.id, p.id) : undefined
              const wait = pr ? PITCH_COOLDOWN - (g.week - pr.week) : 0
              const share = (split[p.id] ?? 0) / total
              const songShare = (songSplit[p.id] ?? 0) / songTotal
              const status = !song ? null : online ? { t: 'Titre en ligne', c: 'tg' } : locked ? { t: `Réputation ${p.minRep} requise`, c: 'tr_' } : p.kind === 'video' && song.clip?.status !== 'sorti' ? { t: 'Clip requis', c: 'tr_' } : { t: 'Mise en ligne bientôt', c: 'tc' }
              return (
                <div key={p.id} className="pn cut" style={{display: 'flex', flexDirection: 'column', gap: 10, borderTop: '3px solid ' + BRAND[p.id], opacity: locked ? 0.78 : 1}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <img src={logo(p.id)} alt={p.name} width={56} height={56} style={{filter: locked ? 'grayscale(.7)' : 'none'}} />
                    <div style={{minWidth: 0}}>
                      <div className="h2" style={{fontSize: 24}}>{p.name}</div>
                      <div className="mut" style={{fontSize: 12}}>{p.kind === 'video' ? 'Vidéo' : 'Streaming audio'} · {live(p.id)} titre(s) en ligne</div>
                    </div>
                    <span className="sp" />
                    {status && <span className={'tag ' + status.c}>{status.t}</span>}
                  </div>
                  <div className="mut" style={{fontSize: 13}}>{p.desc}</div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 13}}>
                    <div><span className="mut">Label</span><div><b>{compact(split[p.id] ?? 0)}</b> · {Math.round(share * 100)} %</div></div>
                    <div><span className="mut">Ce titre</span><div><b>{song ? compact(songSplit[p.id] ?? 0) : '—'}</b> · {Math.round(songShare * 100)} %</div></div>
                    <div><span className="mut">Rémunération</span><div><b>{Math.round(p.rate * 100)} %</b> du tarif</div></div>
                  </div>
                  <div className="mt"><i style={{display: 'block', height: '100%', width: Math.max(2, share * 100) + '%', background: BRAND[p.id], borderRadius: 4, transition: 'width .6s'}} /></div>
                  <div className="mut" style={{fontSize: 12}}>Forte en : {CONTINENTS.filter((c) => p.share[c] >= 0.15).map((c) => `${c} ${Math.round(p.share[c] * 100)} %`).join(' · ') || '—'}</div>
                  {song && !locked && online ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto'}}>
                      <button type="button" className="btn sm" disabled={wait > 0} onClick={() => run((st) => pitchPlaylist(st, song.id, p.id))}>
                        {wait > 0 ? `Réessayer dans ${wait} sem.` : `Playlist · ${usd(pitchCost(g, p))}`}
                      </button>
                      <span className="mut" style={{fontSize: 12}}>{Math.round(pitchChance(g, song.id, p.id) * 100)} % de chances{pr ? ` · dernier : ${pr.accepted ? 'accepté' : 'refusé'}` : ''} · +{Math.round(p.hype * 100)} % de buzz</span>
                    </div>
                  ) : <div className="mut" style={{fontSize: 12, marginTop: 'auto'}}>{locked ? 'Montez en réputation pour être référencé ici.' : song ? 'Playlist disponible dès que le titre est en ligne.' : 'Choisissez un titre.'}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
