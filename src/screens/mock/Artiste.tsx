import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import Avatar from '../../components/Avatar'
import { LabelLogo } from '../../components/Logo'
import { gradientFor, useOpen } from '../../components/useOpen'
import { cityById } from '../../data/world'
import { chartFor } from '../../engine/market'
import { projectOf, projectSongs, projectStreams } from '../../engine/projects'
import { rivalArtist, rivalOrigin, rivalTotalPlays } from '../../engine/rivals'
import { sum } from '../../engine/util'
import { egoOf, loyaltyOf, relKey } from '../../engine/dynamics'
import { useGame } from '../../store/gameStore'
import { compact, songName, usd, weekNo } from '../../lib'

interface SongRow { id: string; title: string; plays: number; project?: string; mine: boolean }
interface ProjRow { id: string; name: string; kind: string; when: string; tracks: string[]; plays: number }

export default function Artiste() {
  const g = useGame((s) => s.game)!
  const sel = useGame((s) => s.sel)
  const open = useOpen()
  const mine = g.artists.find((a) => a.id === sel.artistId)
  const rival = !mine ? rivalArtist(sel.rivalId ?? '') : undefined
  if (!mine && !rival) return (
    <div className="scr"><Dock active="classements" /><Hud /><div className="main"><div className="pn cut" style={{maxWidth: 600}}><div className="h2">Artiste introuvable</div><a href="Classements.dc.html" className="btn">Classements</a></div></div></div>
  )
  const id = (mine ?? rival)!.id
  const stage = (mine ?? rival)!.stageName
  const city = mine ? cityById(mine.originCityId) : rivalOrigin(rival!)
  const genre = (mine ?? rival)!.genre
  const labelName = mine ? g.label.name : rival!.labelName
  const logoId = mine ? g.label.logoId : undefined
  const avatar = { id, stageName: stage, realName: mine?.realName ?? rival!.realName, originCityId: city.id, gradient: mine?.gradient ?? gradientFor(id), isFounder: mine?.isFounder }

  const songs: SongRow[] = mine
    ? g.songs.filter((s) => s.artistId === id && s.stage === 'released').map((s) => ({ id: s.id, title: songName(s), plays: s.stats.streams, project: projectOf(g, s.id)?.name, mine: true }))
    : rival!.songs.map((s) => ({ id: s.id, title: s.title, plays: s.plays, project: rival!.projects.find((p) => p.id === s.projectId)?.name, mine: false }))
  songs.sort((a, b) => b.plays - a.plays)
  const projects: ProjRow[] = mine
    ? g.projects.filter((p) => p.artistId === id).map((p) => ({ id: p.id, name: p.name, kind: p.kind, when: p.status === 'sorti' ? `Sorti S${weekNo(p.releaseWeek ?? 0)}` : 'En préparation', tracks: projectSongs(g, p).map(songName), plays: projectStreams(g, p) }))
    : rival!.projects.map((p) => ({ id: p.id, name: p.name, kind: p.kind, when: `Il y a ${p.year} an${p.year > 1 ? 's' : ''}`, tracks: p.songIds.map((sid) => rival!.songs.find((s) => s.id === sid)!.title), plays: p.songIds.reduce((t, sid) => t + rival!.songs.find((s) => s.id === sid)!.plays, 0) }))
  const total = mine ? songs.reduce((t, s) => t + s.plays, 0) : rivalTotalPlays(rival!)
  const bestOf = (kind: 'singles' | 'artistes' | 'eps' | 'albums') => { const r = chartFor(g, 'monde', g.label.hqCityId, kind).find((x) => x.artistId === id); return r ? 'n°' + r.rank : 'hors' }
  const fans = mine ? sum(mine.fans) : Math.round(rival!.popularity * 4_000_000)
  const contract = mine?.contract
  const singles = songs.filter((s) => !s.project)
  const byRegion: [string, number][] = mine ? Object.entries(Object.entries(mine.fans).reduce<Record<string, number>>((m, [cid, v]) => { const r = cityById(cid).continent; m[r] = (m[r] ?? 0) + v; return m }, {})).sort((a, b) => b[1] - a[1]) : []
  const topCities: [string, number][] = mine ? Object.entries(mine.fans).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 8) : []
  const maxCity = Math.max(1, ...topCities.map((x) => x[1]))
  const gauges: [string, number, string][] = mine ? [
    ['Moral', mine.morale, '#3DDC97'], ['Énergie', 100 - mine.fatigue, '#35D3F0'],
    ['Voix', mine.skills.voix, '#FF7DBB'], ['Charisme', mine.skills.charisme * 10, '#8B5CF6'],
    ['Scène', mine.skills.scene, '#FFC63D'], ['Créativité', mine.skills.creativite * 10, '#F43F9D'],
  ] : []

  return (
    <div className="scr">
      <Dock active="classements" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <Avatar artist={avatar} size={96} />
          <div>
            <h1 className="h1" style={{lineHeight: 1}}>{stage}</h1>
            <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}><span className="tag ti">{genre}</span><span className="tag tc">{city.name}, {city.country}</span>{mine ? <span className="tag tg">Artiste de votre label</span> : <span className="tag te">Artiste rival</span>}</div>
          </div>
          <div className="sp" />
          <a href="Label.dc.html" className="pn" style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px'}} onClick={(e) => { e.preventDefault(); open.label(labelName) }}>
            <LabelLogo name={labelName} logoId={logoId} size={48} /><div><div className="lbl">Label</div><b>{labelName}</b></div>
          </a>
          <a href="Classements.dc.html" className="btn s">Classements</a>
        </div>
        <div style={{display: 'flex', gap: 20, marginTop: 18}}>
          <div style={{width: 640, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn" style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14}}>
              <div><div className="mut" style={{fontSize: 13}}>Écoutes totales</div><div className="disp" style={{fontSize: 26}}>{compact(total)}</div></div>
              <div><div className="mut" style={{fontSize: 13}}>Fans{mine ? '' : ' (estim.)'}</div><div className="disp" style={{fontSize: 26, color: '#35D3F0'}}>{compact(fans)}</div></div>
              <div><div className="mut" style={{fontSize: 13}}>Titres</div><div className="disp" style={{fontSize: 26}}>{songs.length}</div></div>
              <div><div className="mut" style={{fontSize: 13}}>Projets</div><div className="disp" style={{fontSize: 26, color: '#FFC63D'}}>{projects.length}</div></div>
            </div>
            <div className="pn" style={{maxHeight: 440, overflow: 'auto'}}>
              <div className="lbl">Catalogue</div>
              {songs.length === 0 && <p className="mut" style={{fontSize: 14}}>Aucun titre sorti pour l'instant.</p>}
              {songs.map((s, i) => (
                <div key={s.id} className="row" role="button" style={{gridTemplateColumns: '28px 1fr 100px 80px', gap: 10, cursor: 'pointer'}} onClick={() => open.song(s.id)}>
                  <span className="mut">{i + 1}</span><div><b>{s.title}</b>{s.project && <div className="mut" style={{fontSize: 12}}>{s.project}</div>}</div><span className="tag ti">{s.project ? 'Projet' : 'Single'}</span><b style={{textAlign: 'right'}}>{compact(s.plays)}</b>
                </div>
              ))}
            </div>
          </div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn">
              <div className="lbl">Positions dans les classements mondiaux</div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 10}}>
                {([['singles', 'Singles'], ['artistes', 'Artistes'], ['eps', 'EP'], ['albums', 'Albums']] as const).map(([k, l]) => <div key={k}><div className="mut" style={{fontSize: 13}}>{l}</div><div className="num" style={{fontSize: 30, color: bestOf(k) === 'hors' ? '#9C90CC' : '#FF7DBB'}}>{bestOf(k)}</div></div>)}
              </div>
            </div>
            {mine && (
              <div className="pn">
                <div className="lbl">Jauges de l’artiste</div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px', marginTop: 10}}>
                  {gauges.map(([l, v, c]) => <div key={l}><div style={{display: 'flex', fontSize: 13}}><span>{l}</span><span className="sp" /><b>{Math.round(Math.min(100, v))}</b></div><div className="mt"><i style={{width: Math.max(2, Math.min(100, v)) + '%', background: c}} /></div></div>)}
                </div>
              </div>
            )}
            {mine && !mine.isFounder && (
              <div className="pn">
                <div className="lbl">Vie de l’artiste</div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px', marginTop: 10}}>
                  {([['Fidélité au label', loyaltyOf(mine), loyaltyOf(mine) < 35 ? '#FF5470' : '#3DDC97'], ['Ego', egoOf(mine), '#FFC63D']] as const).map(([l, v, c]) => <div key={l}><div style={{display: 'flex', fontSize: 13}}><span>{l}</span><span className="sp" /><b>{Math.round(v)}</b></div><div className="mt"><i style={{width: Math.max(2, Math.min(100, v)) + '%', background: c}} /></div></div>)}
                </div>
                <div className="mut" style={{fontSize: 12, marginTop: 8}}>{loyaltyOf(mine) < 35 ? 'Risque élevé de départ : les rivaux le courtisent.' : loyaltyOf(mine) < 55 ? 'Fidélité fragile : soignez son moral et ses sorties.' : 'Relation solide avec le label.'}</div>
                {g.artists.filter((o) => o.id !== mine.id).map((o) => { const r = g.relations?.[relKey(mine.id, o.id)] ?? 0; return <div key={o.id} className="row" style={{gridTemplateColumns: '1fr auto'}}><span>Relation avec {o.stageName}</span><span className={'tag ' + (r > 10 ? 'tg' : r < -10 ? 'tr_' : 'ti')}>{r > 10 ? 'Complices' : r < -10 ? 'Tendue' : 'Neutre'}</span></div> })}
              </div>
            )}
            {mine && (
              <div className="pn">
                <div className="lbl">Popularité par région</div>
                {byRegion.length === 0 ? <p className="mut" style={{fontSize: 14}}>Aucun fan pour l’instant : sortez un titre.</p> : (
                  <>
                    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8}}>{byRegion.map(([r, v]) => <span key={r} className="tag tc">{r} · {compact(v)}</span>)}</div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 18px', marginTop: 12, fontSize: 13}}>
                      {topCities.map(([cid, v]) => <div key={cid} style={{display: 'grid', gridTemplateColumns: '84px 1fr 48px', gap: 8, alignItems: 'center'}}><span>{cityById(cid).name}</span><div className="mt"><i style={{width: Math.max(3, Math.round((v / maxCity) * 100)) + '%'}} /></div><b>{compact(v)}</b></div>)}
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="pn">
              <div className="lbl">Contrat</div>
              {mine && !mine.isFounder && contract ? (
                <div style={{marginTop: 8, fontSize: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
                  <div><span className="mut">Redevance artiste</span><div><b>{Math.round(contract.royalty * 100)} %</b></div></div>
                  <div><span className="mut">Avance versée</span><div><b>{usd(contract.advance)}</b></div></div>
                  <div><span className="mut">Durée restante</span><div><b>{Math.max(0, contract.signedWeek + contract.weeks - g.week)} sem.</b></div></div>
                  <div><span className="mut">Territoire</span><div><b>{{ local: 'Un pays', region: 'Continent', monde: 'Monde' }[contract.scope]}</b></div></div>
                  <a href="Contrat.dc.html" className="btn s" style={{gridColumn: '1 / -1'}} onClick={(e) => { e.preventDefault(); useGame.getState().select({ artistId: id, candidateId: null }); useGame.getState().go('Contrat') }}>Voir / renégocier le contrat</a>
                </div>
              ) : mine ? <p className="mut" style={{fontSize: 14}}>Vous êtes cet artiste : aucun contrat.</p> : (
                <div style={{marginTop: 8, fontSize: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
                  <div><span className="mut">Label</span><div><b>{labelName}</b></div></div>
                  <div><span className="mut">Redevance artiste</span><div><b>{Math.round(rival!.contract.royalty * 100)} %</b></div></div>
                  <div><span className="mut">Années restantes</span><div><b>{rival!.contract.yearsLeft} an{rival!.contract.yearsLeft > 1 ? 's' : ''}</b></div></div>
                  <div><span className="mut">Territoire</span><div><b>{{ local: 'Un pays', region: 'Continent', monde: 'Monde' }[rival!.contract.scope]}</b></div></div>
                  <div className="mut" style={{gridColumn: '1 / -1', fontSize: 12}}>Sous contrat avec un label rival : il ne peut pas être recruté avant la fin de ce contrat.</div>
                </div>
              )}
            </div>
            <div className="pn" style={{maxHeight: 330, overflow: 'auto'}}>
              <div className="lbl">Discographie</div>
              {projects.length === 0 && <p className="mut" style={{fontSize: 14}}>Aucun EP ni album. {singles.length} single(s).</p>}
              {projects.map((p) => (
                <div key={p.id} style={{padding: '10px 0', borderBottom: '1px solid var(--ln)'}}>
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}><b>{p.name}</b><span className="tag ti">{p.kind}</span><span className="sp" /><span className="mut" style={{fontSize: 13}}>{p.when}{p.plays ? ` · ${compact(p.plays)} écoutes` : ''}</span></div>
                  <div className="mut" style={{fontSize: 12, marginTop: 4}}>{p.tracks.map((t, i) => `${i + 1}. ${t}`).join(' · ') || 'Aucun titre'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
