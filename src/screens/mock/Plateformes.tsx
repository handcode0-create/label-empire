import { useState } from 'react'
import { pitchCost } from '../../engine/prices'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { CONTINENTS } from '../../data/world'
import { PITCH_COOLDOWN, PLATFORMS, lastPitch, pitchChance, pitchPlaylist, platformSplit } from '../../engine/platforms'
import { useGame } from '../../store/gameStore'
import { compact, songName, usd } from '../../lib'

export default function Plateformes() {
  const g = useGame((s) => s.game)!
  const { run } = useGame()
  const released = g.songs.filter((s) => s.stage === 'released')
  const [songId, setSongId] = useState<string | null>(released[0]?.id ?? null)
  const song = released.find((x) => x.id === songId) ?? released[0]
  const split = platformSplit(g)
  const total = Object.values(split).reduce((a, b) => a + b, 0) || 1
  const streamsOf = (id: string) => split[id] ?? 0
  return (
    <div className="scr">
      <Dock active="sorties" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <h1 className="h1">Plateformes</h1>
          <span className="tag ti">{compact(total)} écoutes du label réparties</span>
          <span className="sp" />
          <a href="Catalogue.dc.html" className="btn s">Catalogue</a>
          <a href="Clips.dc.html" className="btn s">Clips</a>
        </div>
        <div className="pn sel" style={{marginTop: 14}}>
          <div className="lbl">Titre à proposer aux équipes éditoriales</div>
          <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8}}>
            {released.length === 0 && <span className="mut" style={{fontSize: 14}}>Aucun titre sorti. Sortez un titre pour le proposer aux playlists.</span>}
            {released.map((s) => <span key={s.id} className={'chip' + (song?.id === s.id ? ' on' : '')} role="button" onClick={() => setSongId(s.id)}>{songName(s)}</span>)}
          </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 14, overflow: 'auto', maxHeight: 640}}>
          {PLATFORMS.map((p) => {
            const locked = p.minRep > g.reputation
            const pr = song ? lastPitch(g, song.id, p.id) : undefined
            const wait = pr ? PITCH_COOLDOWN - (g.week - pr.week) : 0
            const share = streamsOf(p.id) / total
            return (
              <div key={p.id} className="pn cut" style={{opacity: locked ? 0.7 : 1, display: 'flex', flexDirection: 'column', gap: 8}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}><span className="h2" style={{fontSize: 22}}>{p.name}</span><span className="sp" /><span className={'tag ' + (p.kind === 'video' ? 'te' : 'tc')}>{p.kind === 'video' ? 'Vidéo' : 'Streaming'}</span></div>
                <div className="mut" style={{fontSize: 13}}>{p.desc}</div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13}}>
                  <div><span className="mut">Vos écoutes</span><div><b>{compact(streamsOf(p.id))}</b> ({Math.round(share * 100)} %)</div></div>
                  <div><span className="mut">Rémunération</span><div><b>{Math.round(p.rate * 100)} %</b> du tarif de base</div></div>
                </div>
                <div className="mut" style={{fontSize: 12}}>Part de marché : {CONTINENTS.filter((c) => p.share[c] >= 0.15).map((c) => `${c} ${Math.round(p.share[c] * 100)} %`).join(' · ') || '—'}</div>
                {locked ? <span className="tag tr_">Réputation {p.minRep} requise</span> : (
                  <button type="button" className="btn sm" disabled={!song || wait > 0} onClick={() => song && run((st) => pitchPlaylist(st, song.id, p.id))}>
                    {wait > 0 ? `Réessayer dans ${wait} sem.` : `Proposer en playlist · ${usd(pitchCost(g, p))}`}
                  </button>
                )}
                {song && !locked && <div className="mut" style={{fontSize: 12}}>Chances estimées : {Math.round(pitchChance(g, song.id, p.id) * 100)} % · {pr ? (pr.accepted ? 'dernier démarchage accepté' : 'dernier démarchage refusé') : 'jamais démarchée'}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
