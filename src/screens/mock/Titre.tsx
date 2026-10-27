import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import Avatar from '../../components/Avatar'
import { LabelLogo } from '../../components/Logo'
import { gradientFor, useOpen } from '../../components/useOpen'
import { cityById } from '../../data/world'
import { chartFor } from '../../engine/market'
import { projectOf } from '../../engine/projects'
import { rivalArtist, rivalSong } from '../../engine/rivals'
import { useGame } from '../../store/gameStore'
import { compact, songName } from '../../lib'

export default function Titre() {
  const g = useGame((s) => s.game)!
  const sel = useGame((s) => s.sel)
  const open = useOpen()
  const mine = g.songs.find((s) => s.id === sel.viewSongId)
  const rs = !mine ? rivalSong(sel.viewSongId ?? '') : undefined
  if (!mine && !rs) return (
    <div className="scr"><Dock active="classements" /><Hud /><div className="main"><div className="pn cut" style={{maxWidth: 600}}><div className="h2">Titre introuvable</div><a href="Classements.dc.html" className="btn">Classements</a></div></div></div>
  )
  const artistId = (mine ?? rs)!.artistId
  const ma = g.artists.find((a) => a.id === artistId)
  const ra = !ma ? rivalArtist(artistId) : undefined
  const stage = ma?.stageName ?? ra?.stageName ?? ''
  const labelName = ma ? g.label.name : ra?.labelName ?? ''
  const title = mine ? songName(mine) : rs!.title
  const genre = (mine ?? rs)!.genre
  const total = mine ? mine.stats.streams : rs!.plays
  const proj = mine ? projectOf(g, mine.id)?.name : ra?.projects.find((p) => p.id === rs!.projectId)?.name
  const avatar = { id: artistId, stageName: stage, realName: ma?.realName ?? ra?.realName, originCityId: ma?.originCityId ?? ra!.originCityId, gradient: ma?.gradient ?? gradientFor(artistId), isFounder: ma?.isFounder }
  const rank = (lv: 'monde' | 'pays') => { const r = chartFor(g, lv, g.label.hqCityId, 'singles').find((x) => x.songId === sel.viewSongId); return r ? `n°${r.rank}` : 'hors' }
  const byCity = mine ? Object.entries(mine.stats.lastByCity).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 6) : []
  const maxS = Math.max(1, ...byCity.map((x) => x[1]))
  return (
    <div className="scr">
      <Dock active="classements" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div>
            <div className="lbl">Titre</div>
            <h1 className="h1" style={{lineHeight: 1.05}}>{title}</h1>
            <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}><span className="tag ti">{genre}</span>{proj && <span className="tag tc">{proj}</span>}{mine?.feat && <span className="tag te">Feat. {mine.feat.name}</span>}{ma ? <span className="tag tg">Votre label</span> : <span className="tag te">Label rival</span>}</div>
          </div>
          <div className="sp" />
          <a href="Classements.dc.html" className="btn s">Classements</a>
        </div>
        <div style={{display: 'flex', gap: 20, marginTop: 18}}>
          <div style={{width: 520, display: 'flex', flexDirection: 'column', gap: 14}}>
            <a href="Artiste.dc.html" className="pn" style={{display: 'flex', alignItems: 'center', gap: 14}} onClick={(e) => { e.preventDefault(); open.artist(artistId) }}>
              <Avatar artist={avatar} size={72} /><div><div className="lbl">Artiste</div><b style={{fontSize: 20}}>{stage}</b><div className="mut" style={{fontSize: 13}}>Voir le profil, la discographie et le contrat</div></div>
            </a>
            <a href="Label.dc.html" className="pn" style={{display: 'flex', alignItems: 'center', gap: 14}} onClick={(e) => { e.preventDefault(); open.label(labelName) }}>
              <LabelLogo name={labelName} logoId={ma ? g.label.logoId : undefined} size={72} /><div><div className="lbl">Label</div><b style={{fontSize: 20}}>{labelName}</b><div className="mut" style={{fontSize: 13}}>Voir le roster et le catalogue</div></div>
            </a>
          </div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn" style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14}}>
              <div><div className="mut" style={{fontSize: 13}}>Écoutes totales</div><div className="disp" style={{fontSize: 28}}>{compact(total)}</div></div>
              <div><div className="mut" style={{fontSize: 13}}>Rang monde</div><div className="num" style={{fontSize: 34, color: '#FF7DBB'}}>{rank('monde')}</div></div>
              <div><div className="mut" style={{fontSize: 13}}>Rang {cityById(g.label.hqCityId).country}</div><div className="num" style={{fontSize: 34, color: '#35D3F0'}}>{rank('pays')}</div></div>
            </div>
            {mine && (
              <div className="pn">
                <div className="lbl">Écoutes par ville (dernière semaine)</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, fontSize: 14}}>
                  {byCity.length === 0 && <span className="mut">Pas encore d'écoutes.</span>}
                  {byCity.map(([id, v]) => <div key={id} style={{display: 'grid', gridTemplateColumns: '120px 1fr 56px', gap: 10, alignItems: 'center'}}><span>{cityById(id).name}</span><div className="mt"><i style={{width: Math.max(3, Math.round((v / maxS) * 100)) + '%'}} /></div><b>{compact(v)}</b></div>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
