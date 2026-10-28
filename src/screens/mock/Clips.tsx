import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { CLIP_TIERS, clipCandidates, commissionClip } from '../../engine/clips'
import type { Clip } from '../../engine/types'
import { useGame } from '../../store/gameStore'
import { compact, songName, usd, wk } from '../../lib'

export default function Clips() {
  const g = useGame((s) => s.game)!
  const { run } = useGame()
  const cands = clipCandidates(g)
  const [songId, setSongId] = useState<string | null>(cands[0]?.id ?? null)
  const sel = cands.find((x) => x.id === songId) ?? cands[0]
  const made = g.songs.filter((s) => s.clip).sort((a, b) => (b.clip!.startWeek - a.clip!.startWeek))
  const artist = (id: string) => g.artists.find((a) => a.id === id)?.stageName ?? ''
  return (
    <div className="scr">
      <Dock active="sorties" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <h1 className="h1">Clips vidéo</h1>
          <span className="tag ti">{made.length} clip(s) · {compact(made.reduce((t, s) => t + (s.clip?.views ?? 0), 0))} vues</span>
          <span className="sp" />
          <a href="Catalogue.dc.html" className="btn s">Catalogue</a>
          <a href="Plateformes.dc.html" className="btn s">Plateformes</a>
        </div>
        <div style={{display: 'flex', gap: 20, marginTop: 16}}>
          <div style={{width: 600, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn sel">
              <div className="lbl">1 · Choisir le titre</div>
              <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10}}>
                {cands.length === 0 && <span className="mut" style={{fontSize: 14}}>Aucun titre disponible : mixez ou sortez un titre d'abord (un titre n'a qu'un seul clip).</span>}
                {cands.map((s) => <span key={s.id} className={'chip' + (sel?.id === s.id ? ' on' : '')} role="button" onClick={() => setSongId(s.id)}>{songName(s)} · {artist(s.artistId)}</span>)}
              </div>
            </div>
            <div className="pn">
              <div className="lbl">2 · Choisir la production</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10}}>
                {(Object.keys(CLIP_TIERS) as Clip['tier'][]).map((k) => {
                  const t = CLIP_TIERS[k]
                  return (
                    <div key={k} className="pn cut" style={{display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', padding: '14px 16px'}}>
                      <div>
                        <b style={{fontSize: 17}}>{t.label}</b> <span className="tag te">{t.weeks} sem.</span> <span className="tag tc">qualité {t.q[0]}–{t.q[1]}</span>
                        <div className="mut" style={{fontSize: 13, marginTop: 4}}>{t.desc} Prestige +{t.rep}.</div>
                      </div>
                      <button type="button" className="btn sm" disabled={!sel} onClick={() => sel && run((st) => commissionClip(st, sel.id, k))}>{usd(t.cost)}</button>
                    </div>
                  )
                })}
              </div>
              <div className="mut" style={{fontSize: 12, marginTop: 10}}>Un clip sorti donne du buzz au titre, de la réputation, et rapporte des revenus publicitaires selon les vues.</div>
            </div>
          </div>
          <div className="pn" style={{flex: 1, maxHeight: 700, overflow: 'auto'}}>
            <div className="lbl">Mes clips</div>
            {made.length === 0 && <p className="mut" style={{fontSize: 14}}>Aucun clip pour l'instant.</p>}
            {made.map((s) => {
              const c = s.clip!
              return (
                <div key={s.id} className="row" style={{gridTemplateColumns: '1fr auto', gap: 12}}>
                  <div>
                    <b>{songName(s)}</b> <span className="tag ti">{CLIP_TIERS[c.tier].label}</span>
                    <div className="mut" style={{fontSize: 12, marginTop: 2}}>{artist(s.artistId)} · qualité {c.quality}{c.status === 'sorti' ? ` · ${compact(c.views)} vues · ${usd(c.revenue)} de revenus` : ` · tournage jusqu'en ${wk(c.readyWeek)}`}</div>
                  </div>
                  <span className={'tag ' + (c.status === 'sorti' ? 'tg' : 'te')}>{c.status === 'sorti' ? 'En ligne' : 'Tournage'}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
