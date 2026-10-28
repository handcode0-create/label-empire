import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import Avatar from '../../components/Avatar'
import { PROJECT_RULES, projectOf, projectQuality, projectSongs, projectStreams, setStandby } from '../../engine/projects'
import { useGame } from '../../store/gameStore'
import { compact, songName } from '../../lib'

const STAGE: Record<string, string> = { written: 'Écrit', recorded: 'Enregistré', mixed: 'Mixé', scheduled: 'Programmé', released: 'Sorti' }

export default function Catalogue() {
  const g = useGame((s) => s.game)!
  const { run, select, go } = useGame()
  const open = (projectId?: string) => { go('Projets'); void projectId }
  return (
    <div className="scr">
      <Dock active="sorties" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <h1 className="h1">Catalogue du label</h1>
          <span className="tag ti">{g.projects.length} projet(s) · {g.songs.filter((s) => s.standby).length} titre(s) en standby</span>
          <span className="sp" />
          <a href="Projets.dc.html" className="btn s">EP & albums</a>
          <a href="Sortie.dc.html" className="btn">Programmer une sortie</a>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16, overflow: 'auto', maxHeight: 740}}>
          {g.artists.map((a) => {
            const projects = g.projects.filter((p) => p.artistId === a.id)
            const mine = g.songs.filter((s) => s.artistId === a.id)
            const singles = mine.filter((s) => s.stage === 'released' && !projectOf(g, s.id))
            const standby = mine.filter((s) => s.standby && s.stage === 'mixed')
            const waiting = mine.filter((s) => s.stage === 'mixed' && !s.standby || s.stage === 'scheduled')
            return (
              <div key={a.id} className="pn cut">
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <Avatar artist={a} size={52} />
                  <div><b style={{fontSize: 20}}>{a.stageName}</b><div className="mut" style={{fontSize: 13}}>{projects.length} projet(s) · {singles.length} single(s) · {standby.length} en standby</div></div>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginTop: 12}}>
                  <div>
                    <div className="lbl">Projets</div>
                    {projects.length === 0 && <p className="mut" style={{fontSize: 14}}>Aucun EP ni album pour cet artiste.</p>}
                    {projects.map((p) => (
                      <div key={p.id} className="row" role="button" style={{gridTemplateColumns: '1fr auto', gap: 10, cursor: 'pointer'}} onClick={() => open(p.id)}>
                        <div>
                          <b>{p.name}</b> <span className="tag ti">{p.kind}</span>
                          <div className="mut" style={{fontSize: 12, marginTop: 2}}>{projectSongs(g, p).map((s, i) => `${i + 1}. ${s.title}${s.standby ? ' (standby)' : ''}`).join(' · ') || 'Aucun titre'}</div>
                          <div className="mut" style={{fontSize: 12}}>{p.songIds.length}/{PROJECT_RULES[p.kind].min} titres min · qualité {projectQuality(g, p)}{p.status === 'sorti' ? ` · ${compact(projectStreams(g, p))} écoutes` : ''}</div>
                        </div>
                        <span className={'tag ' + (p.status === 'sorti' ? 'tg' : 'te')}>{p.status === 'sorti' ? `Sorti S${p.releaseWeek}` : 'En préparation'}</span>
                      </div>
                    ))}
                    {singles.length > 0 && <div className="mut" style={{fontSize: 13, marginTop: 10}}>Singles : {singles.map((s) => `${songName(s)} (${compact(s.stats.streams)})`).join(' · ')}</div>}
                  </div>
                  <div>
                    <div className="lbl">Standby et titres en attente</div>
                    {standby.length === 0 && waiting.length === 0 && <p className="mut" style={{fontSize: 14}}>Aucun titre en attente. Mixez un titre, puis mettez-le en standby pour le garder pour un EP ou un album.</p>}
                    {standby.map((s) => (
                      <div key={s.id} className="row" style={{gridTemplateColumns: '1fr auto auto', gap: 8}}>
                        <div><b>{songName(s)}</b><div className="mut" style={{fontSize: 12}}>Q{s.quality ?? '–'}{projectOf(g, s.id) ? ` · dans « ${projectOf(g, s.id)!.name} »` : ' · pas encore dans un projet'}</div></div>
                        <span className="tag te">Standby</span>
                        {!projectOf(g, s.id) ? <span className="chip" role="button" onClick={() => run((st) => setStandby(st, s.id, false))}>Libérer</span> : <span />}
                      </div>
                    ))}
                    {waiting.map((s) => (
                      <div key={s.id} className="row" style={{gridTemplateColumns: '1fr auto auto', gap: 8}}>
                        <b>{songName(s)}</b><span className="tag ti">{STAGE[s.stage]}</span>
                        {s.stage === 'mixed' ? <span className="chip" role="button" onClick={() => run((st) => setStandby(st, s.id, true))}>Standby</span> : <span />}
                      </div>
                    ))}
                    {(standby.length > 0 || waiting.length > 0) && <a href="Projets.dc.html" className="btn s sm" style={{marginTop: 8}} onClick={() => select({ artistId: a.id })}>Ajouter à un EP / album</a>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
