import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import Slider from '../../components/Slider'
import { CITIES } from '../../data/world'
import { PROJECT_RULES, assignSong, createProject, deleteProject, projectOf, projectQuality, projectSongs, projectStreams, releaseProject, removeSong } from '../../engine/projects'
import type { ProjectKind } from '../../engine/types'
import { useGame } from '../../store/gameStore'
import { compact, songName, usd } from '../../lib'

const STAGE: Record<string, string> = { standby: 'Standby', written: 'Écrit', recorded: 'Enregistré', mixed: 'Mixé', scheduled: 'Programmé', released: 'Sorti' }

export default function Projets() {
  const g = useGame((s) => s.game)!
  const { run } = useGame()
  const [selId, setSelId] = useState<string | null>(g.projects[0]?.id ?? null)
  const [name, setName] = useState('')
  const [kind, setKind] = useState<ProjectKind>('EP')
  const [artistId, setArtistId] = useState(g.artists[0]?.id ?? '')
  const unlocked = CITIES.filter((c) => c.minRep <= g.reputation)
  const [cityIds, setCityIds] = useState<string[]>([])
  const [promo, setPromo] = useState(0)
  const sel = g.projects.find((p) => p.id === selId) ?? null
  const rule = sel ? PROJECT_RULES[sel.kind] : null
  const artist = (id: string) => g.artists.find((a) => a.id === id)
  const free = sel ? g.songs.filter((s) => s.artistId === sel.artistId && !projectOf(g, s.id)) : []
  const create = () => { if (run((s) => createProject(s, name, kind, artistId))) { setName('') ; setTimeout(() => { const p = useGame.getState().game!.projects.at(-1); if (p) setSelId(p.id) }, 0) } }
  return (
    <div className="scr">
      <Dock active="studio" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}><h1 className="h1">EP & albums</h1><span className="tag ti">{g.projects.filter((p) => p.status === 'sorti').length} sorti(s) · {g.projects.filter((p) => p.status === 'brouillon').length} en préparation</span><span className="sp" /><a href="Ecriture.dc.html" className="btn s">Studio</a></div>
        <div style={{display: 'flex', gap: 20, marginTop: 16}}>
          <div style={{width: 560, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn">
              <div className="lbl">Nouveau projet</div>
              <div style={{display: 'flex', gap: 8, marginTop: 10}}>
                <input className="in" style={{fontWeight: 700}} aria-label="Nom du projet" placeholder="Nom de l'EP ou de l'album" value={name} onChange={(e) => setName(e.target.value)} />
                <button type="button" className="btn" style={{height: 48, flex: 'none'}} onClick={create}>Créer</button>
              </div>
              <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}>
                {(['EP', 'Album'] as ProjectKind[]).map((k) => <span key={k} className={'chip' + (kind === k ? ' on' : '')} role="button" onClick={() => setKind(k)}>{k} · {PROJECT_RULES[k].min}–{PROJECT_RULES[k].max} titres</span>)}
                {g.artists.map((a) => <span key={a.id} className={'chip' + (artistId === a.id ? ' on' : '')} role="button" onClick={() => setArtistId(a.id)}>{a.stageName}</span>)}
              </div>
            </div>
            <div className="pn" style={{maxHeight: 480, overflow: 'auto'}}>
              <div className="lbl">Discographie du label</div>
              {g.projects.length === 0 && <p className="mut" style={{fontSize: 14}}>Aucun projet. Créez un EP ou un album, puis ajoutez-y vos titres.</p>}
              {g.projects.map((p) => (
                <div key={p.id} className={'row' + (p.id === selId ? ' sel' : '')} role="button" style={{gridTemplateColumns: '1fr auto auto', gap: 12, cursor: 'pointer', background: p.id === selId ? '#3A1B52' : undefined}} onClick={() => setSelId(p.id)}>
                  <div><b>{p.name}</b><div className="mut" style={{fontSize: 12}}>{p.kind} · {artist(p.artistId)?.stageName} · {p.songIds.length} titre(s){p.status === 'sorti' ? ` · ${compact(projectStreams(g, p))} écoutes` : ''}</div></div>
                  <span className={'tag ' + (p.status === 'sorti' ? 'tg' : 'te')}>{p.status === 'sorti' ? `Sorti S${p.releaseWeek}` : 'En préparation'}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
            {sel && rule ? (
              <>
                <div className="pn cut sel">
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}><span className="h2" style={{fontSize: 28}}>{sel.name}</span><span className="tag ti">{sel.kind}</span><span className="sp" /><span className="mut">{artist(sel.artistId)?.stageName}</span></div>
                  <div className="mut" style={{fontSize: 13, marginTop: 6}}>{sel.songIds.length}/{rule.min} titres minimum · qualité moyenne {projectQuality(g, sel)} · coût de publication {usd(rule.cost)}</div>
                  <div style={{marginTop: 10}}>
                    {projectSongs(g, sel).map((s, i) => (
                      <div key={s.id} className="row" style={{gridTemplateColumns: '28px 1fr 90px 80px auto', gap: 10}}>
                        <span className="mut">{i + 1}</span><b>{songName(s)}</b><span className={'tag ' + (s.stage === 'released' ? 'tg' : 'te')}>{s.standby ? STAGE.standby : STAGE[s.stage]}</span><span className="mut" style={{fontSize: 13}}>Q{s.quality ?? '–'}</span>
                        {sel.status === 'brouillon' ? <span className="chip" role="button" onClick={() => run((st) => removeSong(st, sel.id, s.id))}>Retirer</span> : <span />}
                      </div>
                    ))}
                    {sel.songIds.length === 0 && <p className="mut" style={{fontSize: 14}}>Aucun titre assigné.</p>}
                  </div>
                  {sel.status === 'brouillon' && projectSongs(g, sel).some((s) => s.stage === 'mixed') && (
                    <div style={{marginTop: 14, borderTop: '1px solid var(--ln)', paddingTop: 12}}>
                      <div className="lbl">Sortie des titres en standby (max. 6 territoires)</div>
                      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8}}>
                        {unlocked.map((c) => { const on = cityIds.includes(c.id); return <span key={c.id} className={'chip' + (on ? ' on' : '')} role="button" onClick={() => setCityIds(on ? cityIds.filter((x) => x !== c.id) : cityIds.length >= 6 ? cityIds : [...cityIds, c.id])}>{c.name}</span> })}
                      </div>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 100px', gap: 16, alignItems: 'center', marginTop: 12}}><Slider min={0} max={30000} step={500} value={promo} onChange={setPromo} /><b style={{textAlign: 'right', color: '#FFC63D'}}>{usd(promo)}</b></div>
                      <div className="mut" style={{fontSize: 12, marginTop: 6}}>{cityIds.length ? `${cityIds.length} territoire(s) choisi(s)` : 'Aucun choix : les 6 premiers territoires débloqués'} · promotion répartie sur les titres en standby.</div>
                    </div>
                  )}
                  {sel.status === 'brouillon' && (
                    <div style={{display: 'flex', gap: 10, marginTop: 14}}>
                      <button type="button" className="btn" style={{flex: 1}} onClick={() => run((st) => releaseProject(st, sel.id, { cityIds, promo }))}>Publier le {sel.kind}</button>
                      <button type="button" className="btn s" onClick={() => { run((st) => deleteProject(st, sel.id)); setSelId(null) }}>Supprimer</button>
                    </div>
                  )}
                </div>
                {sel.status === 'brouillon' && (
                  <div className="pn">
                    <div className="lbl">Assigner un titre</div>
                    <div style={{maxHeight: 220, overflow: 'auto', marginTop: 6}}>
                      {free.map((s) => (
                        <div key={s.id} className="row" role="button" style={{gridTemplateColumns: '1fr 90px auto', gap: 10, cursor: 'pointer'}} onClick={() => run((st) => assignSong(st, sel.id, s.id))}>
                          <b>{songName(s)}</b><span className={'tag ' + (s.stage === 'released' ? 'tg' : 'te')}>{s.standby ? STAGE.standby : STAGE[s.stage]}</span><span className="tag tc">Ajouter</span>
                        </div>
                      ))}
                      {free.length === 0 && <p className="mut" style={{fontSize: 14}}>Aucun titre libre pour cet artiste. Écrivez-en de nouveaux dans le Studio.</p>}
                    </div>
                    <div className="mut" style={{fontSize: 12, marginTop: 8}}>Les titres mixés ajoutés ici passent en standby et sortent avec le projet (semaine suivante). Les titres non mixés doivent d'abord être terminés.</div>
                  </div>
                )}
              </>
            ) : <div className="pn cut"><div className="h2">Choisissez ou créez un projet</div><p className="mut">Un EP regroupe 3 à 6 titres, un album 7 titres ou plus.</p></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
