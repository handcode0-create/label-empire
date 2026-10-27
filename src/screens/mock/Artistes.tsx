import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { ARTIST_LABELS, cityById } from '../../data/world'
import { artistSlots, signedCount, sum } from '../../engine/util'
import { useGame } from '../../store/gameStore'
import { compact, initials, stars } from '../../lib'

const tone = (m: number) => (m >= 70 ? 'tg' : m >= 45 ? 'te' : 'tr_')
const barc = (m: number) => (m >= 70 ? 'gr' : m >= 45 ? 'gd' : 'rd')

function wish(g: ReturnType<typeof useGame.getState>['game'], a: NonNullable<ReturnType<typeof useGame.getState>['game']>['artists'][number]) {
  if (a.morale < 40) return ['Inquiet', 'Je me sens oublié. J’ai besoin d’un projet, ou d’un geste du label.']
  const mine = g!.songs.filter((s) => s.artistId === a.id)
  if (!mine.length) return ['Confiant', 'Je suis prêt à écrire mon premier titre. Donnez-moi une semaine de studio.']
  if (!g!.tours.some((t) => t.artistId === a.id)) return ['Confiant', 'Mes fans veulent me voir sur scène. Une tournée serait une bonne idée.']
  return ['Confiant', 'Je veux sortir un nouveau titre avant la fin du trimestre.']
}

export default function Artistes() {
  const g = useGame((s) => s.game)!
  const { sel, select } = useGame()
  const a = g.artists.find((x) => x.id === sel.artistId) ?? g.artists[0]
  const grad = (x: string) => `linear-gradient(135deg,${x})`
  const [mood, line] = a ? wish(g, a) : ['', '']
  const fansList = a ? Object.entries(a.fans).sort((x, y) => y[1] - x[1]).slice(0, 5) : []
  const maxF = Math.max(1, ...fansList.map((f) => f[1]))
  const weeksLeft = a?.contract ? Math.max(0, a.contract.weeks - (g.week - a.contract.signedWeek)) : 0
  const scope = { local: 'Ville et région proche', region: 'Région du monde', monde: 'Monde entier' }
  return (
    <div className="scr">
      <Dock active="artistes" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 430, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{display: 'flex', alignItems: 'center'}}><h1 className="h1">Mes artistes</h1><span className="sp" /><span className="tag ti">{signedCount(g)} sur {artistSlots(g)} places</span></div>
          {g.artists.map((x) => (
            <div key={x.id} className={'pn' + (a && x.id === a.id ? ' sel' : '')} role="button" tabIndex={0} onClick={() => select({ artistId: x.id })} style={{display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px', cursor: 'pointer'}}>
              <div className="av" style={{width: 56, height: 56, fontSize: 22, background: grad(x.gradient)}}>{initials(x.stageName)}</div>
              <div style={{flex: 1}}><b style={{fontSize: 17}}>{x.stageName}</b><div className="mut" style={{fontSize: 13}}>{cityById(x.originCityId).name} · {x.genre.toLowerCase()}{x.isFounder ? ' · fondateur' : ''}</div><div className={'mt ' + barc(x.morale)} style={{marginTop: 8}}><i style={{width: Math.round(x.morale) + '%'}} /></div></div>
              <span className={'tag ' + tone(x.morale)}>Moral {Math.round(x.morale)}</span>
            </div>
          ))}
          <a href="Decouverte.dc.html" className="pn" style={{display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, boxShadow: 'inset 0 0 0 2px var(--ln)', background: 'transparent'}}>
            <div className="av" style={{width: 56, height: 56, fontSize: 28, background: '#2A1B4D', color: '#FF7DBB'}}>+</div>
            <div><b style={{fontSize: 17}}>Découvrir un artiste</b><div className="mut" style={{fontSize: 13}}>Éclaireurs, scènes ouvertes, concours</div></div>
          </a>
        </div>
        {a ? (
          <div className="pn cut" style={{flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px', alignContent: 'start'}}>
            <div style={{gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 18}}>
              <div className="av" style={{width: 84, height: 84, fontSize: 32, background: grad(a.gradient)}}>{initials(a.stageName)}</div>
              <div><div className="h1">{a.stageName}</div><div className="mut">{cityById(a.originCityId).name}, {cityById(a.originCityId).country} · {a.lang} · {a.genre.toLowerCase()}</div></div>
              <div className="sp" />
              <span className="tag tc">Potentiel : {stars(a.potential)}</span>
            </div>
            <div>
              <div className="lbl">Talents</div>
              <div style={{display: 'grid', gridTemplateColumns: '110px 1fr 36px', gap: 12, alignItems: 'center', marginTop: 12}}>
                {Object.entries(ARTIST_LABELS).map(([k, label]) => { const v = Math.round(a.skills[k] ?? 0); return (<span key={k} style={{display: 'contents'}}><span>{label}</span><div className="mt"><i style={{width: Math.min(100, v) + '%'}} /></div><b>{v}</b></span>) })}
              </div>
              <div className="lbl" style={{marginTop: 22}}>Contrat</div>
              <div style={{marginTop: 8, lineHeight: '1.7', fontSize: 14}}>
                {a.contract ? <>Fin dans <b>{weeksLeft} semaines</b> · part du label <b>{Math.round((1 - a.contract.royalty) * 100)} %</b><br />Territoires : <b>{scope[a.contract.scope]}</b></> : <>Fondateur du label : pas de contrat.</>}
              </div>
            </div>
            <div>
              <div className="lbl">Fans par territoire · {compact(sum(a.fans))}</div>
              <div style={{display: 'grid', gridTemplateColumns: '110px 1fr 56px', gap: 10, alignItems: 'center', marginTop: 12, fontSize: 14}}>
                {fansList.length === 0 && <span className="mut" style={{gridColumn: '1 / -1'}}>Pas encore de fans.</span>}
                {fansList.map(([id, f]) => (<span key={id} style={{display: 'contents'}}><span>{cityById(id).name}</span><div className="mt cy"><i style={{width: Math.max(2, Math.round((f / maxF) * 100)) + '%'}} /></div><b>{compact(f)}</b></span>))}
              </div>
            </div>
            <div className="bub" style={{gridColumn: '1 / -1'}}>
              <span className="tag ti" style={{marginRight: 8}}>{mood}</span>« {line} »
            </div>
            <div style={{gridColumn: '1 / -1', display: 'flex', gap: 12}}>
              <a href="Ecriture.dc.html" className="btn" onClick={() => select({ artistId: a.id })}>Nouveau titre</a>
              <a href="Tournee.dc.html" className="btn s" onClick={() => select({ artistId: a.id })}>Tournée</a>
              {a.contract && <a href="Contrat.dc.html" className="btn s" onClick={() => select({ artistId: a.id, candidateId: null })}>Renégocier</a>}
            </div>
          </div>
        ) : (
          <div className="pn cut" style={{flex: 1}}><div className="h2">Aucun artiste</div><p className="mut">Signez votre premier artiste depuis « Découvrir un artiste ».</p></div>
        )}
      </div>
    </div>
  )
}
