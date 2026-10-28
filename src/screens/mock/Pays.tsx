import Hud from '../../components/Hud'
import { fxRate, liveCity } from '../../engine/prices'
import Dock from '../../components/Dock'
import { CITIES, TIER_LABEL, affinity, cityById } from '../../data/world'
import { STUDIOS, venuesFor } from '../../data/people'
import { openOffice, officeRequirement } from '../../engine/economy'
import { bestRank } from '../../engine/market'
import { fansByCity } from '../../engine/selectors'
import { sum } from '../../engine/util'
import { guard, useGame } from '../../store/gameStore'
import { compact, usd } from '../../lib'

const grade = (v: number) => (v >= 0.8 ? 'a' : v >= 0.5 ? 'b' : 'c')
const letter = (v: number) => grade(v).toUpperCase()

export default function Pays() {
  const g = useGame((s) => s.game)!
  const { sel, run, select } = useGame()
  const c = liveCity(g, cityById(sel.cityId ?? g.label.hqCityId))
  const fans = fansByCity(g)
  const sameCountry = CITIES.filter((x) => x.country === c.country)
  const around = (sameCountry.length > 1 ? sameCountry : CITIES.filter((x) => x.region === c.region)).slice(0, 4)
  const countryFans = sum(Object.fromEntries(sameCountry.map((x) => [x.id, fans[x.id] ?? 0])))
  const genres = [...new Set([...g.artists.map((a) => a.genre), ...c.strong])].slice(0, 5)
  const office = g.offices.find((o) => o.cityId === c.id)
  const req = officeRequirement(g, c.id, 'partenaire')
  const rank = bestRank(g, 'ville', c.id)
  const audience = Math.min(1, c.base / 3_000_000)
  const power = c.tax > 0.18 ? 0.9 : 0.5
  const open = 1 - c.piracy
  const bar = (v: number) => (v >= 1.2 ? 'gr' : v >= 0.9 ? 'cy' : v >= 0.7 ? 'gd' : 'rd')
  return (
    <div className="scr">
      <Dock active="monde" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#B3A6D9'}}>
          <a href="Hub.dc.html" className="chip">Monde</a><span>›</span><a href="Hub.dc.html" className="chip">{c.continent}</a><span>›</span><span className="chip on">{c.name}</span>
        </div>
        <div style={{display: 'flex', gap: 20, marginTop: 16}}>
          <div style={{width: 800}}>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 16}}>
              <h1 className="h1" style={{fontSize: 52}}>{c.country}</h1>
              {office && <span className="tag tc" style={{marginBottom: 10}}>{office.kind === 'partenaire' ? 'Partenaire de distribution' : office.kind === 'siege' ? 'Siège du label' : 'Bureau du label'}</span>}
              {!office && c.minRep > g.reputation && <span className="tag tr_" style={{marginBottom: 10}}>Réputation {c.minRep} requise</span>}
            </div>
            <div className="mut" style={{marginTop: 4, fontSize: 14}}>{c.name} · {TIER_LABEL[c.tier]} · {c.lang} · devise : {c.currency}</div>
            <div className="lbl" style={{marginTop: 22}}>Fiche du marché</div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 10}}>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Audience</div><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><span className={'ab ' + grade(audience * 2)}>{letter(audience * 2)}</span><span className="mut" style={{fontSize: 13}}>{compact(c.base)} écoutes/sem.</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Pouvoir d'achat</div><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><span className={'ab ' + grade(power)}>{letter(power)}</span><span className="mut" style={{fontSize: 13}}>{c.tier === 'A' ? 'Élevé' : 'Modéré'}</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Paiement</div><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><span className={'ab ' + (c.delay <= 3 ? 'a' : c.delay <= 4 ? 'b' : 'c')}>{c.delay <= 3 ? 'A' : c.delay <= 4 ? 'B' : 'C'}</span><span className="mut" style={{fontSize: 13}}>{c.delay} semaines</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Piratage · change {c.currency}</div><div style={{marginTop: 8}}><span className={'tag ' + (fxRate(g, c.currency) < 0.92 ? 'tr_' : fxRate(g, c.currency) > 1.08 ? 'tg' : 'ti')} style={{marginRight: 6}}>{c.currency} {fxRate(g, c.currency).toFixed(2)}</span><span className={'tag ' + (c.piracy > 0.25 ? 'tr_' : c.piracy > 0.12 ? 'te' : 'tg')}>{c.piracy > 0.25 ? 'Fort' : c.piracy > 0.12 ? 'Moyen' : 'Faible'} · {Math.round(c.piracy * 100)} %</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Langue</div><div style={{marginTop: 8, fontWeight: 700}}>{c.lang}</div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Genres dominants</div><div style={{marginTop: 8, fontSize: 14, fontWeight: 700}}>{c.strong.slice(0, 2).join(', ')}</div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Ouverture</div><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><span className={'ab ' + grade(open)}>{letter(open)}</span><span className="mut" style={{fontSize: 13}}>{c.visa ? 'Visa requis' : 'Sans visa'}</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Coûts et règles</div><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><span className={'ab ' + grade(1 - c.tax * 2)}>{letter(1 - c.tax * 2)}</span><span className="mut" style={{fontSize: 13}}>Taxe {Math.round(c.tax * 100)} %</span></div></div>
            </div>
            <div className="pn" style={{marginTop: 18}}>
              <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Affinité avec votre catalogue</span><span className="sp" /><span className="mut" style={{fontSize: 13}}>de 0,8 à 1,35</span></div>
              <div style={{display: 'grid', gridTemplateColumns: '120px 1fr 48px', gap: '12px 14px', alignItems: 'center', marginTop: 14}}>
                {genres.map((gn) => { const a = affinity(gn, c); return (<span key={gn} style={{display: 'contents'}}><span>{gn}</span><div className={'mt ' + bar(a)}><i style={{width: Math.round((a / 1.4) * 100) + '%'}} /></div><b>{a.toFixed(2).replace('.', ',')}</b></span>) })}
              </div>
            </div>
          </div>
          <div style={{width: 456, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn cut">
              <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Villes et scènes</span><span className="sp" /><span className="lbl">Fans : {compact(countryFans)}</span></div>
              <div style={{marginTop: 6}}>
                {around.map((x) => {
                  const f = fans[x.id] ?? 0
                  return (
                    <div key={x.id} className="row" onClick={() => select({ cityId: x.id })} style={{gridTemplateColumns: '1fr 120px 70px', cursor: 'pointer'}}><div><b>{x.name}</b><div className="mut" style={{fontSize: 13}}>{STUDIOS.filter((s) => s.cityId === x.id).length} studio(s) · {venuesFor(x).length} salles</div></div><div className="mt gr"><i style={{width: Math.min(100, Math.round((f / Math.max(1, x.base * 0.15)) * 100)) + '%'}} /></div><span className={'tag ' + (f > 0 ? 'tg' : 'te')}>{compact(f)}</span></div>
                  )
                })}
              </div>
            </div>
            <div className="pn">
              <div className="lbl">Classement de {c.name}</div>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6}}><span className="num" style={{color: '#FF7DBB'}}>{rank ? 'n°' + rank : '—'}</span><span className="mut" style={{fontSize: 14}}>{rank ? 'Meilleur titre du label' : 'Aucun titre classé ici'}</span></div>
              <a href="Classements.dc.html" className="mut" style={{fontSize: 13, textDecoration: 'underline'}}>Voir les classements</a>
            </div>
            <div className="pn" style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              <div className="lbl">Actions possibles</div>
              <a href="Pays.dc.html" className="btn s" onClick={guard(() => { if (office) { useGame.getState().say('Vous êtes déjà présent à ' + c.name + '.', 'err'); return false } run((s) => openOffice(s, c.id, 'partenaire')); return false })} style={{justifyContent: 'space-between', height: 48, fontSize: 17, opacity: office ? 0.55 : 1}}>Représentant local <span style={{fontSize: 14, letterSpacing: 0, textTransform: 'none', color: '#FFC63D'}}>{office ? 'En place' : usd(req.cost)}</span></a>
              <a href="Sortie.dc.html" className="btn s" onClick={() => select({ cityId: c.id })} style={{justifyContent: 'space-between', height: 48, fontSize: 17}}>Sortie locale <span style={{fontSize: 14, letterSpacing: 0, textTransform: 'none'}} className="mut">{c.lang !== 'français' ? 'version ' + c.lang + ' conseillée' : 'aucun obstacle de langue'}</span></a>
              <a href="Tournee.dc.html" className="btn" style={{height: 52}} onClick={() => select({ cityId: c.id })}>Planifier une tournée</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
