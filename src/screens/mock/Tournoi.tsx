import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import Avatar from '../../components/Avatar'
import { cityById } from '../../data/world'
import { TOURNAMENT, abandonTournament, chooseWinner, countryOf, currentRound, entrantOf, openTournament, playRound, recruitCost, recruitEntrant, recruitableCities, startTournament } from '../../engine/tournament'
import type { Artist, Duel, Tournament } from '../../engine/types'
import { useGame } from '../../store/gameStore'
import { usd, wk } from '../../lib'

const Side = ({ a, win, dim, score }: { a: Artist; win?: boolean; dim?: boolean; score?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: dim ? 0.45 : 1 }}>
    <Avatar artist={a} size={46} style={win ? { boxShadow: '0 0 0 3px #3DDC97' } : undefined} />
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.stageName}</div>
      <div className="mut" style={{ fontSize: 12 }}>{countryOf(a)} · {a.genre}</div>
    </div>
    {score !== undefined && <b className="disp" style={{ fontSize: 22, color: win ? '#3DDC97' : undefined }}>{Math.round(score)}</b>}
  </div>
)

function DuelCard({ t, d, canCoach, onCoach }: { t: Tournament; d: Duel; canCoach: boolean; onCoach: () => void }) {
  const a = entrantOf(t, d.a), b = entrantOf(t, d.b)
  const played = !!d.winner
  return (
    <div className={'pn an-pop' + (played ? '' : ' lift')} style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, width: 300 }}>
      <Side a={a} win={d.winner === d.a} dim={played && d.winner !== d.a} score={d.scoreA} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ flex: 1, height: 1, background: 'var(--ln)' }} /><span className="lbl">contre</span><div style={{ flex: 1, height: 1, background: 'var(--ln)' }} /></div>
      <Side a={b} win={d.winner === d.b} dim={played && d.winner !== d.b} score={d.scoreB} />
      {!played && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          {d.coached ? <span className="tag tg">Préparé · {d.coachPoints! >= 0 ? '+' : ''}{d.coachPoints} pour {entrantOf(t, d.coached).stageName}</span> : <span className="mut" style={{ fontSize: 12 }}>Non coaché</span>}
          <span className="sp" />
          {canCoach && <button className="btn sm s" style={{ height: 34, fontSize: 14, padding: '0 14px' }} onClick={onCoach}>{d.coached ? 'Rejouer' : 'Coacher'}</button>}
        </div>
      )}
    </div>
  )
}

export default function Tournoi() {
  const g = useGame((s) => s.game)!
  const { run, select, say, go } = useGame()
  const t = g.tournament
  const cities = recruitableCities(g)
  const [name, setName] = useState('Révélation mondiale')
  const [hostId, setHostId] = useState(g.label.hqCityId)
  const [pick, setPick] = useState<string | null>(null)
  const hosts = cities.filter((c) => c.tier === 'A' || c.tier === 'B').slice(0, 8)
  const open = t && t.status !== 'termine'

  return (
    <div className="scr">
      <Dock active="artistes" />
      <Hud />
      <div className="main" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="Concours.dc.html" className="btn s sm">Retour</a>
          <h1 className="h1" style={{ fontSize: 36 }}>Grand Tournoi mondial</h1>
          {t && <span className="tag ti">{t.name} · {cityById(t.cityId).name}</span>}
          <span className="sp" />
          {open && <button className="btn s sm" onClick={() => { if (run(abandonTournament)) say('Tournoi abandonné.') }}>Abandonner</button>}
        </div>

        {/* ---------- aucun tournoi (ou terminé) : création ---------- */}
        {(!t || t.status === 'termine') && (
          <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
            <div className="pn cut" style={{ width: 470, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="h2">{t ? 'Organiser un nouveau tournoi' : 'Ouvrir un tournoi'}</div>
              <label htmlFor="tn" className="lbl">Nom du tournoi</label>
              <input id="tn" className="in" value={name} onChange={(e) => setName(e.target.value)} />
              <div className="lbl">Ville hôte (la finale s'y joue)</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{hosts.map((c) => <span key={c.id} className={'chip' + (c.id === hostId ? ' on' : '')} onClick={() => setHostId(c.id)}>{c.name}</span>)}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14, marginTop: 6 }}>
                <div><span className="tag tc">Certain</span><div style={{ marginTop: 6 }}>Ouverture : {usd(TOURNAMENT.openCost)}</div></div>
                <div><span className="tag te">Estimé</span><div style={{ marginTop: 6 }}>Voyages : ~{usd(recruitCost(hostId) * 6)} pour 6 candidats</div></div>
                <div><span className="tag ti">Incertain</span><div style={{ marginTop: 6 }}>Le vainqueur n'est pas toujours le favori</div></div>
                <div><span className="tag tr_">Risque</span><div style={{ marginTop: 6 }}>Un rival peut repérer le vainqueur</div></div>
              </div>
              <div className="sp" />
              <button className="btn" style={{ height: 60 }} onClick={() => { if (run((s) => openTournament(s, { name, cityId: hostId }))) select({ duelId: null }) }}>Ouvrir le tournoi</button>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {t?.status === 'termine' && t.winnerId && (
                <div className="pn sel an-pop" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <Avatar artist={entrantOf(t, t.winnerId)} size={110} />
                  <div style={{ flex: 1 }}>
                    <span className="tag te">Dernier vainqueur · {t.name}</span>
                    <div className="disp" style={{ fontSize: 40, lineHeight: 1.05, marginTop: 6 }}>{entrantOf(t, t.winnerId).stageName}</div>
                    <div className="mut">{countryOf(entrantOf(t, t.winnerId))} · {entrantOf(t, t.winnerId).genre} · exclusivité jusqu'à la {wk(Math.round((entrantOf(t, t.winnerId).exclusiveUntil ?? 0)))}</div>
                  </div>
                  <a href="Profil.dc.html" className="btn" onClick={() => select({ candidateId: t.winnerId! })}>Voir le profil</a>
                </div>
              )}
              <div className="pn" style={{ flex: 1 }}>
                <div className="h2">Comment ça se joue</div>
                <ol style={{ margin: '14px 0 0', paddingLeft: 22, lineHeight: 1.9, fontSize: 16 }}>
                  <li><b>Recrutement</b> : partez dans plusieurs pays, jusqu'à {TOURNAMENT.maxEntrants} candidats, {TOURNAMENT.maxPerCountry} par pays au maximum.</li>
                  <li><b>Tirage au sort</b> : les nationalités se mélangent. Un barrage ramène le groupe à 8, 4 puis 2.</li>
                  <li><b>Battles</b> : coachez un duel de votre choix dans un battle de punchlines animé.</li>
                  <li><b>Finale</b> : le public vote, mais c'est vous qui couronnez le vainqueur.</li>
                </ol>
                <div className="mut" style={{ marginTop: 16, fontSize: 14 }}>Le vainqueur est à vous en exclusivité pendant 4 semaines. Les autres rejoignent la liste de découverte.</div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- recrutement ---------- */}
        {t?.status === 'recrutement' && (
          <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
            <div className="pn cut" style={{ width: 520, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="h2">Recruter dans le monde</div>
              <div className="mut" style={{ fontSize: 14 }}>Chaque voyage coûte une action et des frais selon le marché. Maximum {TOURNAMENT.maxPerCountry} candidats par pays.</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxHeight: 250, overflow: 'auto' }}>
                {cities.map((c) => {
                  const n = t.entrants.filter((a) => countryOf(a) === c.country).length
                  const full = n >= TOURNAMENT.maxPerCountry
                  return <span key={c.id} className={'chip' + (c.id === pick ? ' on' : '')} style={{ opacity: full ? 0.4 : 1 }} onClick={() => setPick(c.id)}>{c.country} · {c.name}{n ? ` (${n})` : ''}</span>
                })}
              </div>
              {pick && <div className="pn" style={{ padding: '12px 16px' }}><b>{cityById(pick).name}</b> · {cityById(pick).country}<div className="mut" style={{ fontSize: 13, marginTop: 4 }}>Genres porteurs : {cityById(pick).strong.join(', ')} · Frais : {usd(recruitCost(pick))}</div></div>}
              <button className="btn g" style={{ height: 56 }} disabled={!pick} onClick={() => { if (pick && run((s) => recruitEntrant(s, pick))) setPick(null) }}>Recruter un candidat</button>
              <div className="sp" />
              <button className="btn" style={{ height: 60 }} onClick={() => { if (run(startTournament)) say('Que le tournoi commence !') }}>Lancer le tirage ({t.entrants.length}/{TOURNAMENT.maxEntrants})</button>
              <div className="mut" style={{ fontSize: 12 }}>Minimum {TOURNAMENT.minEntrants} candidats pour démarrer.</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="lbl" style={{ marginBottom: 10 }}>Candidats recrutés · {t.entrants.length}/{TOURNAMENT.maxEntrants}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {Array.from({ length: TOURNAMENT.maxEntrants }, (_, i) => {
                  const a = t.entrants[i]
                  return a ? (
                    <div key={a.id} className="pn an-pop" style={{ textAlign: 'center', padding: '16px 8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}><Avatar artist={a} size={84} /></div>
                      <b style={{ display: 'block', marginTop: 8, fontSize: 16 }}>{a.stageName}</b>
                      <div className="mut" style={{ fontSize: 12 }}>{countryOf(a)}</div>
                      <div className="mut" style={{ fontSize: 12 }}>{a.genre}</div>
                      <div style={{ marginTop: 6 }}><span className="tag te">Potentiel {a.potential}★</span></div>
                    </div>
                  ) : (
                    <div key={i} style={{ borderRadius: 14, border: '2px dashed var(--ln)', minHeight: 188, display: 'grid', placeItems: 'center', color: 'var(--dim)', fontSize: 13 }}>Place libre</div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------- phases ---------- */}
        {t?.status === 'en_cours' && (() => {
          const r = currentRound(t)!
          const alive = r.duels.length * 2 + r.byes.length
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="disp" style={{ fontSize: 34 }}>{r.name}</div>
                <span className="tag te">{alive} candidats en lice</span>
                {t.rounds.length > 1 && <span className="mut" style={{ fontSize: 13 }}>{t.eliminated.length} éliminés</span>}
                <span className="sp" />
                <button className="btn" onClick={() => { if (run(playRound)) select({ duelId: null }) }}>Lancer la phase</button>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignContent: 'flex-start', overflow: 'auto' }}>
                {r.duels.map((d) => <DuelCard key={d.id} t={t} d={d} canCoach onCoach={() => { select({ duelId: d.id }); go('Battle') }} />)}
                {r.byes.length > 0 && (
                  <div className="pn" style={{ width: 300 }}>
                    <span className="tag tg">Exempts</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>{r.byes.map((id) => <Side key={id} a={entrantOf(t, id)} />)}</div>
                    <div className="mut" style={{ fontSize: 12, marginTop: 8 }}>Qualifiés directement pour la phase suivante.</div>
                  </div>
                )}
              </div>
              {t.rounds.length > 1 && (
                <div style={{ marginTop: 'auto' }}>
                  <div className="lbl">Phases jouées</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                    {t.rounds.slice(0, -1).map((rr, i) => <span key={i} className="chip">{rr.name} : {rr.duels.map((d) => entrantOf(t, d.winner!).stageName).join(', ')}</span>)}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* ---------- choix du vainqueur ---------- */}
        {t?.status === 'choix' && (() => {
          const d = currentRound(t)!.duels[0]
          const sides = [{ a: entrantOf(t, d.a), score: d.scoreA! }, { a: entrantOf(t, d.b), score: d.scoreB! }]
          return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="bub"><span className="tag te" style={{ marginRight: 8 }}>Kwame Baro</span>« Le public et le jury ont voté. Mais le dernier mot est le vôtre, {g.label.founder}. »</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                {sides.map(({ a, score }) => {
                  const fav = a.id === t.favoriteId
                  return (
                    <div key={a.id} className={'pn an-pop' + (fav ? ' sel' : '')} style={{ textAlign: 'center', padding: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}><Avatar artist={a} size={190} /></div>
                      <div className="disp" style={{ fontSize: 38, marginTop: 12 }}>{a.stageName}</div>
                      <div className="mut">{countryOf(a)} · {a.genre}</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 14 }}>
                        <div><div className="num" style={{ color: '#FFC63D' }}>{Math.round(score)}</div><div className="mut" style={{ fontSize: 12 }}>score de la finale</div></div>
                        <div><div className="num">{a.potential}<span style={{ fontSize: 22 }}>★</span></div><div className="mut" style={{ fontSize: 12 }}>potentiel</div></div>
                      </div>
                      <div style={{ marginTop: 12, minHeight: 28 }}>{fav ? <span className="tag tg">Favori du public et du jury</span> : <span className="tag ti">Outsider</span>}</div>
                      <button className="btn g" style={{ height: 56, marginTop: 14 }} onClick={() => { if (run((s) => chooseWinner(s, a.id))) select({ candidateId: a.id }) }}>Couronner {a.stageName}</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
