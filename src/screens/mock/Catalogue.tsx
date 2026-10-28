import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import Avatar from '../../components/Avatar'
import Cover, { CoverPicker, defaultCover } from '../../components/Cover'
import { generateProjectName } from '../../data/titles'
import { createRng } from '../../engine/rng'
import { rivalProjectNames } from '../../engine/rivals'
import { PROJECT_RULES, assignSong, setCover, createProject, deleteProject, projectOf, projectQuality, projectSongs, projectStreams, releaseProject, removeSong, setStandby } from '../../engine/projects'
import type { Project, ProjectKind } from '../../engine/types'
import { useGame } from '../../store/gameStore'
import { compact, songName, usd } from '../../lib'

const STAGE: Record<string, string> = { written: 'Écrit', recorded: 'Enregistré', mixed: 'Mixé', scheduled: 'Programmé', released: 'Sorti' }

export default function Catalogue() {
  const g = useGame((s) => s.game)!
  const { run, sel, select } = useGame()
  const [artistId, setArtistId] = useState(sel.artistId && g.artists.some((a) => a.id === sel.artistId) ? sel.artistId : g.artists[0]?.id ?? '')
  const [name, setName] = useState('')
  const [kind, setKind] = useState<ProjectKind>('EP')
  const [adding, setAdding] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const a = g.artists.find((x) => x.id === artistId) ?? g.artists[0]
  if (!a) return (
    <div className="scr"><Dock active="sorties" /><Hud /><div className="main"><div className="pn cut" style={{maxWidth: 640}}><div className="h2">Catalogue vide</div><p className="mut">Signez un artiste pour constituer son catalogue.</p><a href="Decouverte.dc.html" className="btn">Découvrir un artiste</a></div></div></div>
  )
  const projects = g.projects.filter((p) => p.artistId === a.id)
  const mine = g.songs.filter((s) => s.artistId === a.id)
  const free = mine.filter((s) => !projectOf(g, s.id))
  const standby = free.filter((s) => s.standby && s.stage === 'mixed')
  const singles = mine.filter((s) => !projectOf(g, s.id) && (s.stage === 'released' || s.stage === 'scheduled'))
  const mixedFree = free.filter((s) => s.stage === 'mixed' && !s.standby)
  const suggest = () => setName(generateProjectName(createRng((Date.now() ^ (name.length * 7919)) >>> 0), { kind, artist: a.stageName }, [...g.projects.map((p) => p.name), ...rivalProjectNames()]))
  const create = () => { if (run((s) => createProject(s, name, kind, a.id))) setName('') }
  const cover = (p: Project) => (
    <div style={{display: 'flex', gap: 14, alignItems: 'flex-end'}}>
      <Cover title={p.name} artist={a.stageName} kind={p.kind} cover={p.cover} size={132} />
      <div style={{flex: 1}}>
        <span className={'tag ' + (p.status === 'sorti' ? 'tg' : 'te')}>{p.status === 'sorti' ? `Sorti S${p.releaseWeek}` : 'En préparation'}</span>
        <div className="h2" style={{fontSize: 22, marginTop: 6}}>{p.name}</div>
        <span className="chip" role="button" style={{marginTop: 6}} onClick={() => setEditing(editing === p.id ? null : p.id)}>{editing === p.id ? 'Fermer' : 'Pochette'}</span>
      </div>
    </div>
  )
  return (
    <div className="scr">
      <Dock active="sorties" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 300, display: 'flex', flexDirection: 'column', gap: 10}}>
          <h1 className="h1">Sorties</h1>
          <div className="lbl">Catalogue par artiste</div>
          {g.artists.map((x) => {
            const n = g.projects.filter((p) => p.artistId === x.id).length
            const sb = g.songs.filter((s) => s.artistId === x.id && s.standby && s.stage === 'mixed').length
            return (
              <div key={x.id} className={'pn' + (x.id === a.id ? ' sel' : '')} role="button" tabIndex={0} onClick={() => { setArtistId(x.id); select({ artistId: x.id }) }} style={{display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', cursor: 'pointer'}}>
                <Avatar artist={x} size={48} />
                <div style={{flex: 1}}><b>{x.stageName}</b><div className="mut" style={{fontSize: 12}}>{n} projet(s){sb ? ` · ${sb} en standby` : ''}</div></div>
              </div>
            )
          })}
          <a href="Clips.dc.html" className="btn s sm" style={{whiteSpace: 'nowrap'}}>Clips vidéo</a>
          <a href="Plateformes.dc.html" className="btn s sm" style={{whiteSpace: 'nowrap'}}>Plateformes</a>
          <a href="Certifications.dc.html" className="btn s sm" style={{whiteSpace: 'nowrap'}}>Certifications SNEP · {(g.certs ?? []).length}</a>
          <a href="Sortie.dc.html" className="btn sm" style={{marginTop: 6, whiteSpace: 'nowrap'}}>Programmer un single</a>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto', maxHeight: 790}}>
          <div className="pn sel" style={{display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap'}}>
            <b style={{fontSize: 18}}>Projets de {a.stageName}</b>
            <span className="sp" />
            <input className="in" style={{width: 260, fontWeight: 700}} aria-label="Nom du projet" placeholder="Nom de l'EP ou de l'album" value={name} onChange={(e) => setName(e.target.value)} />
            <button type="button" className="btn g sm" aria-label="Suggérer un nom" title="Suggérer un nom d'EP ou d'album" onClick={suggest}>🎲</button>
            {(['EP', 'Album'] as ProjectKind[]).map((k) => <span key={k} className={'chip' + (kind === k ? ' on' : '')} role="button" onClick={() => setKind(k)}>{k}</span>)}
            <button type="button" className="btn sm" onClick={create}>Créer</button>
          </div>
          {projects.length === 0 && <div className="pn cut mut">Aucun EP ni album pour {a.stageName}. Créez-en un ci-dessus, puis ajoutez-y des titres inédits (écrits, enregistrés ou mixés, en standby) ou déjà sortis.</div>}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
            {projects.map((p) => {
              const rule = PROJECT_RULES[p.kind]
              const open = p.status === 'brouillon'
              const candidates = free.filter((s) => s.stage !== 'scheduled')
              return (
                <div key={p.id} className="pn cut" style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  {cover(p)}
                  {editing === p.id && <CoverPicker title={p.name} artist={a.stageName} kind={p.kind} value={p.cover ?? defaultCover(p.name + a.stageName)} onChange={(c) => run((st) => setCover(st, 'project', p.id, c))} />}
                  <div className="mut" style={{fontSize: 12}}>{p.songIds.length}/{rule.min} titres min · qualité {projectQuality(g, p)}{p.status === 'sorti' ? ` · ${compact(projectStreams(g, p))} écoutes` : ` · publication ${usd(rule.cost)}`}</div>
                  <div>
                    {projectSongs(g, p).map((s, i) => (
                      <div key={s.id} className="row" style={{gridTemplateColumns: '22px 1fr auto auto', gap: 8, padding: '6px 0'}}>
                        <span className="mut">{i + 1}</span><b style={{fontSize: 14}}>{songName(s)}</b>
                        <span className={'tag ' + (s.stage === 'released' ? 'tg' : 'te')}>{s.exclusive ? 'Inédit' : s.standby ? 'Standby · inédit' : s.stage === 'written' || s.stage === 'recorded' ? 'À finaliser' : STAGE[s.stage]}</span>
                        {open ? <span className="chip" role="button" onClick={() => run((st) => removeSong(st, p.id, s.id))}>Retirer</span> : <span />}
                      </div>
                    ))}
                    {p.songIds.length === 0 && <div className="mut" style={{fontSize: 13}}>Aucun titre.</div>}
                  </div>
                  {open && (
                    <>
                      {adding === p.id && (
                        <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                          {candidates.length === 0 && <span className="mut" style={{fontSize: 13}}>Aucun titre disponible : écrivez-en dans le Studio.</span>}
                          {candidates.map((s) => <span key={s.id} className="chip" role="button" onClick={() => run((st) => assignSong(st, p.id, s.id))}>+ {songName(s)}</span>)}
                        </div>
                      )}
                      <div style={{display: 'flex', gap: 8}}>
                        <button type="button" className="btn s sm" onClick={() => setAdding(adding === p.id ? null : p.id)}>{adding === p.id ? 'Fermer' : 'Ajouter un titre'}</button>
                        <button type="button" className="btn sm" style={{flex: 1}} onClick={() => run((st) => releaseProject(st, p.id))}>Publier</button>
                        <button type="button" className="btn s sm" onClick={() => run((st) => deleteProject(st, p.id))}>✕</button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
          <div className="pn cut">
            <div className="lbl">Réserve · titres en standby</div>
            {standby.length === 0 && mixedFree.length === 0 && <p className="mut" style={{fontSize: 14}}>Aucun titre en attente. Écrivez-en dans le Studio pour les garder inédits.</p>}
            {standby.map((s) => (
              <div key={s.id} className="row" style={{gridTemplateColumns: '1fr auto auto', gap: 10}}>
                <div><b>{songName(s)}</b><div className="mut" style={{fontSize: 12}}>Q{s.quality ?? '–'} · prêt à rejoindre un EP / album</div></div>
                <span className="tag te">Standby</span><span className="chip" role="button" onClick={() => run((st) => setStandby(st, s.id, false))}>Libérer</span>
              </div>
            ))}
            {mixedFree.map((s) => (
              <div key={s.id} className="row" style={{gridTemplateColumns: '1fr auto auto', gap: 10}}>
                <b>{songName(s)}</b><span className="tag ti">Mixé</span><span className="chip" role="button" onClick={() => run((st) => setStandby(st, s.id, true))}>Mettre en standby</span>
              </div>
            ))}
            {singles.length > 0 && (
              <div style={{marginTop: 12}}>
                <div className="lbl">Singles</div>
                <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8}}>
                  {singles.map((sg) => (
                    <div key={sg.id} style={{width: 96}}>
                      <div role="button" style={{cursor: 'pointer'}} onClick={() => setEditing(editing === sg.id ? null : sg.id)} title="Changer la pochette"><Cover title={sg.title} artist={a.stageName} kind="Single" cover={sg.cover} size={96} radius={10} /></div>
                      <div style={{fontSize: 12, fontWeight: 700, marginTop: 4}}>{songName(sg)}</div>
                      <div className="mut" style={{fontSize: 11}}>{sg.stage === 'released' ? compact(sg.stats.streams) + ' écoutes' : 'programmé'}</div>
                    </div>
                  ))}
                </div>
                {singles.filter((sg) => sg.id === editing).map((sg) => <div key={sg.id} style={{marginTop: 10}}><CoverPicker title={sg.title} artist={a.stageName} kind="Single" value={sg.cover ?? defaultCover(sg.title + a.stageName)} onChange={(c) => run((st) => setCover(st, 'song', sg.id, c))} /></div>)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
