import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { Trophy, CertDisc, discLabel, type Metal } from '../../components/Trophies'
import { AWARD_CATEGORIES, AWARD_LABEL, AWARD_PRIZES, awardCalendar, nomineesFor } from '../../engine/awards'
import { levelInfo } from '../../engine/certifications'
import { useGame } from '../../store/gameStore'
import { usd, wk, weekNo } from '../../lib'

const METAL_OF = ['or', 'argent', 'bronze'] as Metal[]

export default function Awards() {
  const g = useGame((s) => s.game)!
  const { go } = useGame()
  const cal = awardCalendar(g.week)
  const noms = g.nominations?.year === cal.year ? g.nominations.cats : cal.announced ? AWARD_CATEGORIES.map((category) => ({ category, nominees: nomineesFor(g, category) })) : []
  const total = 52
  const into = Math.max(0, Math.min(total, total - cal.ceremonyIn))
  const mineNoms = noms.flatMap((c) => c.nominees.filter((n) => n.mine).map((n) => ({ category: c.category, n })))
  const awards = [...(g.awards ?? [])].reverse()
  const wins = awards.filter((a) => a.mine)
  const certs = [...(g.certs ?? [])].sort((a, b) => b.week - a.week)
  const nameOfCert = (id: string) => g.songs.find((s) => s.id === id)?.title ?? g.projects.find((p) => p.id === id)?.name ?? '—'
  return (
    <div className="scr">
      <Dock active="classements" />
      <Hud />
      <div className="main" style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 880, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto', maxHeight: 790 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="Hub.dc.html" className="btn s sm" onClick={(e) => { e.preventDefault(); go('Hub') }}>Retour</a>
            <h1 className="h1" style={{ fontSize: 36 }}>Awards</h1>
            <span className="tag te">Cérémonie An {cal.year}</span>
            <span className="sp" />
            <a href="Certifications.dc.html" className="btn s sm" onClick={(e) => { e.preventDefault(); go('Certifications') }}>Certifications</a>
          </div>
          {/* calendrier */}
          <div className="pn cut" data-testid="award-calendar" style={{ background: 'radial-gradient(500px 200px at 85% 0%,rgba(255,198,61,.25),transparent),rgba(20,12,42,.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Trophy kind="artiste" size={84} />
              <div style={{ flex: 1 }}>
                <div className="lbl">Calendrier des Awards</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 8 }}>
                  <div>
                    <span className={'tag ' + (cal.announced ? 'tg' : 'te')}>{cal.announced ? 'Nominations annoncées' : 'Nominations'}</span>
                    <div className="disp" style={{ fontSize: 24, marginTop: 4 }}>Semaine {weekNo(cal.nominationsWeek)}</div>
                    <div className="mut" style={{ fontSize: 13 }}>{cal.announced ? 'annoncées' : `dans ${cal.nominationsIn} semaine${cal.nominationsIn > 1 ? 's' : ''}`} · {wk(cal.nominationsWeek)}</div>
                  </div>
                  <div>
                    <span className="tag te">Remise des trophées</span>
                    <div className="disp" style={{ fontSize: 24, marginTop: 4 }}>Semaine {weekNo(cal.ceremonyWeek)}</div>
                    <div className="mut" style={{ fontSize: 13 }}>dans {cal.ceremonyIn} semaine{cal.ceremonyIn > 1 ? 's' : ''} · {wk(cal.ceremonyWeek)}</div>
                  </div>
                </div>
                <div className="mt" style={{ marginTop: 10 }}><i style={{ width: Math.round((into / total) * 100) + '%' }} /></div>
              </div>
            </div>
          </div>
          {/* nominations */}
          <div className="lbl">Nominations</div>
          {noms.length === 0 && <div className="pn mut">Les nominations seront annoncées en semaine {weekNo(cal.nominationsWeek)} (dans {cal.nominationsIn} semaine{cal.nominationsIn > 1 ? 's' : ''}), d'après les classements mondiaux. La cérémonie a lieu en semaine {weekNo(cal.ceremonyWeek)}.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {noms.map((c) => (
              <div key={c.category} className="pn" data-testid={'nom-' + c.category} style={{ display: 'flex', gap: 12 }}>
                <Trophy kind={c.category} size={64} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}><b>{AWARD_LABEL[c.category]}</b><span className="sp" /><span className="mut" style={{ fontSize: 11 }}>{usd(AWARD_PRIZES[c.category].cash)}</span></div>
                  {c.nominees.map((n) => (
                    <div key={n.name + n.artist} style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: '22px', alignItems: 'baseline', color: n.mine ? '#FFC63D' : undefined, fontWeight: n.mine ? 800 : 400 }}>
                      <span className="mut" style={{ width: 14 }}>{n.rank}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.name}{n.name !== n.artist ? <span className="mut"> · {n.artist}</span> : null}</span>
                      {n.mine && <span className="tag tg" style={{ marginLeft: 'auto' }}>Vous</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {noms.length > 0 && <div className="mut" style={{ fontSize: 13 }}>{mineNoms.length ? `Vous avez ${mineNoms.length} nomination${mineNoms.length > 1 ? 's' : ''}. Le gagnant est le nominé le mieux classé le soir de la cérémonie : continuez à faire monter vos titres.` : 'Aucune nomination pour vous cette année. Montez dans les classements mondiaux avant les nominations.'}</div>}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto', maxHeight: 790 }}>
          <div className="pn cut">
            <div className="lbl">Votre vitrine · {wins.length} trophée{wins.length > 1 ? 's' : ''}</div>
            {wins.length === 0 && <div className="mut" style={{ fontSize: 13, marginTop: 8 }}>Aucun trophée pour l'instant.</div>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              {wins.slice(0, 8).map((w, i) => <div key={i} style={{ textAlign: 'center', width: 92 }}><Trophy kind={w.category} size={64} /><div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>{w.winner}</div><div className="mut" style={{ fontSize: 10 }}>An {w.year}</div></div>)}
            </div>
          </div>
          <div className="pn cut">
            <div className="lbl">Palmarès des cérémonies</div>
            {awards.length === 0 && <div className="mut" style={{ fontSize: 13, marginTop: 8 }}>La première cérémonie aura lieu en semaine {weekNo(cal.ceremonyWeek)}.</div>}
            {awards.slice(0, 12).map((w, i) => (
              <div key={i} className="row" style={{ gridTemplateColumns: '40px 1fr auto', gap: 10, alignItems: 'center' }}>
                <Trophy kind={w.category} size={34} metal={w.mine ? 'or' : METAL_OF[i % 2 ? 1 : 2]} />
                <div><b style={{ fontSize: 13 }}>{AWARD_LABEL[w.category] ?? w.category} · An {w.year}</b><div className="mut" style={{ fontSize: 12 }}>{w.winner}{w.artist && w.artist !== w.winner ? ` · ${w.artist}` : ''}</div></div>
                <span className={'tag ' + (w.mine ? 'tg' : w.nominated ? 'te' : 'ti')}>{w.mine ? 'Gagné' : w.nominated ? 'Nominé' : '—'}</span>
              </div>
            ))}
          </div>
          <div className="pn cut">
            <div className="lbl">Disques certifiés · {certs.length}</div>
            {certs.length === 0 && <div className="mut" style={{ fontSize: 13, marginTop: 8 }}>Aucun disque certifié pour l'instant.</div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {certs.slice(0, 8).map((c) => <div key={c.id} style={{ textAlign: 'center', width: 92 }}><CertDisc level={c.level} size={72} /><div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>{nameOfCert(c.id)}</div><div className="mut" style={{ fontSize: 10 }}>{discLabel(c.level)} · {levelInfo(c.level).label.split(' ')[0]}</div></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
