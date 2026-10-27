import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import Avatar from '../../components/Avatar'
import { LabelLogo } from '../../components/Logo'
import { gradientFor, useOpen } from '../../components/useOpen'
import { cityById } from '../../data/world'
import { chartFor } from '../../engine/market'
import { rivalLabel, rivalArtist, rivalTotalPlays } from '../../engine/rivals'
import { sum } from '../../engine/util'
import { useGame } from '../../store/gameStore'
import { compact, songName } from '../../lib'

export default function Label() {
  const g = useGame((s) => s.game)!
  const sel = useGame((s) => s.sel)
  const open = useOpen()
  const name = sel.labelName ?? g.label.name
  const isMine = name === g.label.name
  const rl = !isMine ? rivalLabel(name) : undefined
  if (!isMine && !rl) return (
    <div className="scr"><Dock active="classements" /><Hud /><div className="main"><div className="pn cut" style={{maxWidth: 600}}><div className="h2">Label introuvable</div><a href="Classements.dc.html" className="btn">Classements</a></div></div></div>
  )
  const hq = isMine ? cityById(g.label.hqCityId) : cityById(rl!.hqCityId)
  const roster = isMine
    ? g.artists.map((a) => ({ id: a.id, stage: a.stageName, genre: a.genre, plays: g.songs.filter((s) => s.artistId === a.id).reduce((t, s) => t + s.stats.streams, 0), avatar: a }))
    : rl!.artistIds.map((id) => { const a = rivalArtist(id)!; return { id, stage: a.stageName, genre: a.genre, plays: rivalTotalPlays(a), avatar: { id, stageName: a.stageName, realName: a.realName, originCityId: a.originCityId, gradient: gradientFor(id) } } })
  const catalog = isMine
    ? g.songs.filter((s) => s.stage === 'released').map((s) => ({ id: s.id, title: songName(s), artist: g.artists.find((a) => a.id === s.artistId)?.stageName ?? '', plays: s.stats.streams }))
    : rl!.artistIds.flatMap((id) => { const a = rivalArtist(id)!; return a.songs.map((s) => ({ id: s.id, title: s.title, artist: a.stageName, plays: s.plays })) })
  catalog.sort((a, b) => b.plays - a.plays)
  const inChart = chartFor(g, 'monde', g.label.hqCityId, 'singles').filter((r) => r.label === name).length
  const total = roster.reduce((t, r) => t + r.plays, 0)
  const fans = isMine ? sum(g.artists.reduce((acc, a) => { for (const [k, v] of Object.entries(a.fans)) acc[k] = (acc[k] ?? 0) + v; return acc }, {} as Record<string, number>)) : 0
  return (
    <div className="scr">
      <Dock active="classements" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <LabelLogo name={name} logoId={isMine ? g.label.logoId : undefined} size={110} />
          <div>
            <h1 className="h1" style={{lineHeight: 1}}>{name}</h1>
            <div style={{display: 'flex', gap: 8, marginTop: 8}}><span className="tag tc">Siège : {hq.name}, {hq.country}</span>{isMine ? <span className="tag tg">Votre label</span> : <span className="tag te">Label rival</span>}</div>
          </div>
          <div className="sp" />
          <a href="Classements.dc.html" className="btn s">Classements</a>
        </div>
        <div style={{display: 'flex', gap: 20, marginTop: 18}}>
          <div style={{width: 560, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn" style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14}}>
              <div><div className="mut" style={{fontSize: 13}}>Écoutes totales</div><div className="disp" style={{fontSize: 26}}>{compact(total)}</div></div>
              <div><div className="mut" style={{fontSize: 13}}>Titres au classement</div><div className="disp" style={{fontSize: 26, color: '#FF7DBB'}}>{inChart}</div></div>
              <div><div className="mut" style={{fontSize: 13}}>{isMine ? 'Fans' : 'Artistes'}</div><div className="disp" style={{fontSize: 26, color: '#35D3F0'}}>{isMine ? compact(fans) : roster.length}</div></div>
            </div>
            <div className="pn">
              <div className="lbl">Roster</div>
              {roster.map((r) => (
                <div key={r.id} className="row" role="button" style={{gridTemplateColumns: '48px 1fr 90px', gap: 12, cursor: 'pointer'}} onClick={() => open.artist(r.id)}>
                  <Avatar artist={r.avatar} size={44} /><div><b>{r.stage}</b><div className="mut" style={{fontSize: 12}}>{r.genre}</div></div><b style={{textAlign: 'right'}}>{compact(r.plays)}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="pn" style={{flex: 1, maxHeight: 560, overflow: 'auto'}}>
            <div className="lbl">Catalogue</div>
            {catalog.length === 0 && <p className="mut" style={{fontSize: 14}}>Aucun titre sorti.</p>}
            {catalog.slice(0, 40).map((s, i) => (
              <div key={s.id} className="row" role="button" style={{gridTemplateColumns: '28px 1fr 90px', gap: 10, cursor: 'pointer'}} onClick={() => open.song(s.id)}>
                <span className="mut">{i + 1}</span><div><b>{s.title}</b><div className="mut" style={{fontSize: 12}}>{s.artist}</div></div><b style={{textAlign: 'right'}}>{compact(s.plays)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
