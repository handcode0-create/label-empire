import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { useOpen } from '../../components/useOpen'
import { CERT_LEVELS, CERT_THRESHOLDS, SNEP_REF, SNEP_SCALE, albumEquivalent, certOf, ladder, levelFor, levelInfo, nextLevel, type CertLevel } from '../../engine/certifications'
import { projectSongs } from '../../engine/projects'
import { useGame } from '../../store/gameStore'
import { compact, songName, wk } from '../../lib'

function Disc({ level, size = 64 }: { level: CertLevel | null; size?: number }) {
  const c = level ? levelInfo(level).color : '#3A3270'
  return (
    <div aria-hidden="true" style={{ width: size, height: size, borderRadius: '50%', flex: 'none', background: `radial-gradient(circle at 35% 30%, #fff9 0, transparent 35%), conic-gradient(from 20deg, ${c}, #0C0719 25%, ${c} 50%, #0C0719 75%, ${c})`, boxShadow: level ? `0 0 ${size / 3}px ${c}88` : 'none', display: 'grid', placeItems: 'center' }}>
      <div style={{ width: size * 0.26, height: size * 0.26, borderRadius: '50%', background: '#120B24', boxShadow: `0 0 0 2px ${c}` }} />
    </div>
  )
}

export default function Certifications() {
  const g = useGame((s) => s.game)!
  const open = useOpen()
  const rows = [
    ...g.songs.filter((s) => s.stage === 'released').map((s) => ({ id: s.id, kind: 'titre' as const, name: songName(s), streams: s.stats.streams, openIt: () => open.song(s.id) })),
    ...g.projects.filter((p) => p.status === 'sorti').map((p) => ({ id: p.id, kind: 'projet' as const, name: `${p.kind} · ${p.name}`, streams: Math.round(albumEquivalent(projectSongs(g, p).map((x) => x.stats.streams))), openIt: undefined })),
  ].sort((a, b) => b.streams - a.streams)
  const earned = (g.certs ?? []).length
  return (
    <div className="scr">
      <Dock active="sorties" />
      <Hud />
      <div className="main" style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 900, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto', maxHeight: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><a href="Hub.dc.html" className="btn s sm">Retour</a><h1 className="h1" style={{ fontSize: 36 }}>Chambre des certifications</h1><span className="tag te">Référence SNEP</span></div>
          {rows.length === 0 && <div className="pn cut mut">Aucun titre sorti pour l’instant. Sortez un titre et accumulez des écoutes : les disques d’or, de platine et de diamant récompensent les gros succès.</div>}
          {rows.map((r) => {
            const lvl = levelFor(r.kind, r.streams)
            const nx = nextLevel(r.kind, lvl)
            const goal = nx ? CERT_THRESHOLDS[r.kind][nx]! : null
            const c = certOf(g, r.id)
            return (
              <div key={r.id} className="pn" style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 16px' }}>
                <Disc level={lvl} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {r.openIt ? <a href="Titre.dc.html" onClick={(e) => { e.preventDefault(); r.openIt?.() }}><b style={{ fontSize: 17 }}>{r.name}</b></a> : <b style={{ fontSize: 17 }}>{r.name}</b>}
                    <span className="tag ti">{r.kind === 'titre' ? 'Titre' : 'Projet'}</span>
                    {lvl && <span className="tag" style={{ background: levelInfo(lvl).color + '33', color: levelInfo(lvl).color }}>{levelInfo(lvl).label}{c ? ` · ${wk(c.week).replace('semaine', 'sem.')}` : ''}</span>}
                  </div>
                  <div className="mut" style={{ fontSize: 13, marginTop: 2 }}>{compact(r.streams)} {r.kind === 'titre' ? 'écoutes' : 'écoutes éq. album'}{goal ? ` · prochain palier : ${levelInfo(nx!).label.toLowerCase()} à ${compact(goal)}` : ' · palier maximal atteint'}</div>
                  {goal && <div className="mt" style={{ marginTop: 6 }}><i style={{ width: Math.min(100, Math.round((r.streams / goal) * 100)) + '%' }} /></div>}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ width: 376, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="pn sel">
            <div className="lbl">Disques obtenus</div>
            <div className="num" style={{ marginTop: 6 }}>{earned}</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
              {CERT_LEVELS.map((l) => <div key={l.level} style={{ textAlign: 'center' }}><Disc level={(g.certs ?? []).some((c) => c.level === l.level) ? l.level : null} size={46} /><div style={{ fontSize: 12, marginTop: 4 }}>{(g.certs ?? []).filter((c) => c.level === l.level).length}</div></div>)}
            </div>
          </div>
          <div className="pn cut">
            <div className="lbl">Seuils d’écoutes</div>
            {CERT_LEVELS.map((l) => (
              <div key={l.level} className="row" style={{ gridTemplateColumns: '1fr auto' }}>
                <div><b>{l.label}</b><div className="mut" style={{ fontSize: 12 }}>{CERT_THRESHOLDS.titre[l.level] ? `Titre ${compact(CERT_THRESHOLDS.titre[l.level]!)} · ` : ''}{ladder('projet').includes(l.level) ? `EP/Album ${compact(CERT_THRESHOLDS.projet[l.level]!)}` : ''}</div><div className="mut" style={{ fontSize: 11 }}>SNEP : {SNEP_REF.titre[l.level] ? `single ${compact(SNEP_REF.titre[l.level]!)} · ` : ''}{SNEP_REF.projetUnites[l.level] ? `album ${SNEP_REF.projetUnites[l.level]!.toLocaleString('fr-FR')} unités` : ''}</div></div>
                <span className="tag te">+${l.cash.toLocaleString('fr-FR')}</span>
              </div>
            ))}
            <div className="mut" style={{ fontSize: 12, marginTop: 8 }}>Chaque certification verse une prime et augmente la réputation du label.</div>
            <div className="mut" style={{ fontSize: 12, marginTop: 6 }}>Barème SNEP (France) : singles 15 M / 30 M / 50 M d’écoutes ; albums 50 000 / 100 000 / 200 000 / 300 000 / 500 000 unités (écoutes de toutes les pistes, la plus écoutée comptée pour moitié, ÷ 1 000). {SNEP_SCALE !== 1 ? `Les seuils de Bakoma sont ×${SNEP_SCALE}.` : 'Les seuils du jeu sont ceux de la SNEP.'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
