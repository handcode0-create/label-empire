import { useEffect, useState, type ReactNode } from 'react'
import Avatar from '../../components/Avatar'
import Chip from '../../components/Chip'
import Dock from '../../components/Dock'
import Hud from '../../components/Hud'
import { LabelLogo } from '../../components/Logo'
import { FOUNDER_AVATARS } from '../../data/avatars'
import { GENRES, NATIONALITIES, cityById, palierFor } from '../../data/world'
import { credOf, credTier } from '../../engine/credibility'
import { REBRAND_COST, editIdentity } from '../../engine/player'
import { totalFans } from '../../engine/util'
import { compact, usd } from '../../lib'
import { useGame } from '../../store/gameStore'

const readFile = (f: File | undefined, cb: (d: string) => void) => { if (!f) return; if (f.size > 1_500_000) { useGame.getState().say('Image trop lourde (1,5 Mo maximum).', 'err'); return } const r = new FileReader(); r.onload = () => cb(String(r.result)); r.readAsDataURL(f) }

function Toggle({ on, onChange, title, hint }: { on: boolean; onChange: (v: boolean) => void; title: string; hint: string }) {
  return (
    <div role="switch" aria-checked={on} aria-label={title} tabIndex={0} className="row" onClick={() => onChange(!on)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange(!on)} style={{ gridTemplateColumns: '1fr 52px', cursor: 'pointer', alignItems: 'center' }}>
      <div><b>{title}</b><div className="mut" style={{ fontSize: 12 }}>{hint}</div></div>
      <span style={{ width: 48, height: 26, borderRadius: 13, position: 'relative', background: on ? 'linear-gradient(90deg,#FF3D9A,#8B5CF6)' : '#2A1B4D', boxShadow: 'inset 0 0 0 1px var(--ln)', transition: 'background .2s' }}>
        <i style={{ position: 'absolute', top: 3, left: on ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
      </span>
    </div>
  )
}

const Stat = ({ k, v, c }: { k: string; v: ReactNode; c?: string }) => <div className="pn" style={{ padding: '10px 14px' }}><div className="lbl">{k}</div><div className="num" style={{ fontSize: 24, color: c }}>{v}</div></div>

export default function Joueur() {
  const g = useGame((s) => s.game)!
  const { run, options, setOption, saveNow, exportSave, importSave, deleteSave, quit, go, say } = useGame()
  const L = g.label
  const [founder, setFounder] = useState(L.founder)
  const [labelName, setLabelName] = useState(L.name)
  const [nat, setNat] = useState(L.nationality)
  const [pack, setPack] = useState<{ id: string; icon: string; name: string }[]>([])
  const [danger, setDanger] = useState<'' | 'new' | 'del'>('')
  useEffect(() => { fetch('/logos/manifest.json').then((r) => r.json()).then(setPack).catch(() => setPack([])) }, [])
  useEffect(() => { if (!danger) return; const t = setTimeout(() => setDanger(''), 6000); return () => clearTimeout(t) }, [danger])
  const dirty = founder.trim() !== L.founder || labelName.trim() !== L.name || nat.trim() !== L.nationality
  const rebrand = labelName.trim() !== L.name
  const me = g.artists.find((a) => a.isFounder)
  const pal = palierFor(g.reputation)
  const cred = credOf(g)
  const tier = credTier(cred)
  const released = g.songs.filter((s) => s.stage === 'released')
  const streams = released.reduce((t, s) => t + s.stats.streams, 0)
  const curAvatar = L.founderAvatar ?? (L.founderLook === 'm' ? 'story-joueur-m' : 'story-joueur')
  const save = () => {
    if (run((s) => editIdentity(s, { founder, labelName, nationality: nat }))) { /* les champs se resynchronisent via L */ }
  }
  const diff = { facile: 'Facile', normal: 'Normal', difficile: 'Difficile' }[L.difficulty] ?? L.difficulty
  return (
    <div className="scr">
      <Dock active="joueur" />
      <Hud />
      <div className="main" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Identité */}
        <div style={{ width: 440, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="pn cut an-rise">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Avatar artist={me ? { ...me, isFounder: true } : undefined} keyName={curAvatar} src={L.photo} name={L.founder} gradient="#FF3D9A,#8B5CF6" size={104} style={{ boxShadow: '0 0 0 4px var(--ln), 0 0 30px rgba(255,61,154,0.4)', fontSize: 38 }} />
              <div style={{ minWidth: 0 }}>
                <div className="lbl">Fondateur</div>
                <div className="disp" style={{ fontSize: 32, lineHeight: 1.05, overflowWrap: 'anywhere' }}>{L.founder}</div>
                <div className="mut" style={{ fontSize: 13, marginTop: 4 }}>{L.nationality} · {cityById(L.hqCityId).name}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}><span className="tag ti">{pal.name}</span><span className={'tag ' + (tier.tone === 'g' ? 'tg' : tier.tone === 'r' ? 'tr_' : 'te')}>{tier.name}</span></div>
              </div>
            </div>
            <div className="lbl" style={{ marginTop: 18 }}>Nom du fondateur</div>
            <input className="in" style={{ marginTop: 6 }} maxLength={28} value={founder} onChange={(e) => setFounder(e.target.value)} aria-label="Nom du fondateur" />
            <div className="lbl" style={{ marginTop: 14 }}>Nom du label {rebrand && <span style={{ color: '#FFC63D' }}>· changement facturé {usd(REBRAND_COST)}</span>}</div>
            <input className="in" style={{ marginTop: 6 }} maxLength={24} value={labelName} onChange={(e) => setLabelName(e.target.value)} aria-label="Nom du label" />
            <div className="lbl" style={{ marginTop: 14 }}>Nationalité</div>
            <input className="in" style={{ marginTop: 6 }} maxLength={24} value={nat} onChange={(e) => setNat(e.target.value)} aria-label="Nationalité" />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>{NATIONALITIES.filter((n) => n !== 'Autre').map((n) => <Chip key={n} on={nat === n} onClick={() => setNat(n)}>{n}</Chip>)}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
              <button className="btn" style={{ border: 0, cursor: dirty ? 'pointer' : 'default', opacity: dirty ? 1 : 0.45 }} disabled={!dirty} onClick={save}>Enregistrer</button>
              {dirty && <button className="btn s" style={{ cursor: 'pointer' }} onClick={() => { setFounder(L.founder); setLabelName(L.name); setNat(L.nationality) }}>Annuler</button>}
            </div>
          </div>
          <div className="pn cut">
            <div className="lbl">Genre musical principal</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>{GENRES.map((x) => <Chip key={x} on={L.mainGenre === x} onClick={() => run((s) => editIdentity(s, { mainGenre: x }))}>{x}</Chip>)}</div>
          </div>
        </div>
        {/* Apparence + carrière */}
        <div style={{ width: 440, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="pn cut">
            <div className="lbl">Votre avatar</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, marginTop: 12 }}>
              {FOUNDER_AVATARS.map((k) => {
                const on = curAvatar === k && !L.photo
                return (
                  <button key={k} type="button" aria-label={'Avatar ' + k} aria-pressed={on} onClick={() => run((s) => editIdentity(s, { avatar: k, look: k.endsWith('m') || /-m\d$/.test(k) ? 'm' : 'f', photo: null }))} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%', boxShadow: on ? '0 0 0 3px #FF3D9A, 0 0 14px rgba(255,61,154,0.6)' : '0 0 0 2px var(--ln)' }}>
                    <Avatar keyName={k} name={k} gradient="#FF3D9A,#8B5CF6" size={40} />
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <label className="btn s sm" style={{ cursor: 'pointer' }}>Importer ma photo<input type="file" accept="image/*" hidden onChange={(e) => readFile(e.target.files?.[0], (d) => run((s) => editIdentity(s, { photo: d })))} /></label>
              {L.photo && <button className="btn s sm" style={{ cursor: 'pointer' }} onClick={() => run((s) => editIdentity(s, { photo: null }))}>Retirer la photo</button>}
            </div>
          </div>
          <div className="pn cut">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><LabelLogo name={L.name} logoId={L.logoId} size={48} /><div><div className="lbl">Logo du label</div><div className="mut" style={{ fontSize: 12 }}>Changer de logo est gratuit.</div></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginTop: 12, maxHeight: 118, overflow: 'auto' }}>
              {pack.map((l) => <img key={l.id} src={'/logos/' + l.icon} alt={l.name} title={l.name} onClick={() => run((s) => editIdentity(s, { logoId: '/logos/' + l.icon }))} style={{ width: '100%', aspectRatio: '1', borderRadius: 8, cursor: 'pointer', boxShadow: L.logoId === '/logos/' + l.icon ? '0 0 0 2px #FF3D9A' : 'none' }} />)}
            </div>
            <label className="btn s sm" style={{ cursor: 'pointer', marginTop: 12 }}>Importer mon logo<input type="file" accept="image/*" hidden onChange={(e) => readFile(e.target.files?.[0], (d) => run((s) => editIdentity(s, { logoId: d })))} /></label>
          </div>
          <div className="pn cut">
            <div className="lbl">Carrière</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
              <Stat k="Semaine" v={`${(g.week - 1) % 52 + 1} · An ${Math.floor((g.week - 1) / 52) + 1}`} />
              <Stat k="Réputation" v={Math.floor(g.reputation)} c="#B79CFF" />
              <Stat k="Crédibilité" v={Math.round(cred)} c={cred >= 58 ? '#3DDC97' : cred < 40 ? '#FF5470' : undefined} />
              <Stat k="Trésorerie" v={usd(g.cash)} c="#FFC63D" />
              <Stat k="Fans" v={compact(totalFans(g))} c="#35D3F0" />
              <Stat k="Écoutes" v={compact(streams)} />
              <Stat k="Titres sortis" v={released.length} />
              <Stat k="Certifs" v={g.certs.length} c="#FFC63D" />
              <Stat k="Récompenses" v={g.awards.length} />
            </div>
          </div>
        </div>
        {/* Paramètres */}
        <div style={{ flex: 1, minWidth: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="pn cut">
            <div className="h2">Paramètres</div>
            <Toggle on={options.autosave} onChange={(v) => setOption('autosave', v)} title="Sauvegarde automatique" hint="À chaque action et à chaque semaine." />
            <Toggle on={options.reduceMotion} onChange={(v) => setOption('reduceMotion', v)} title="Animations réduites" hint="Supprime transitions et mouvements." />
            <Toggle on={options.sound} onChange={(v) => setOption('sound', v)} title="Sons du jeu" hint="Bientôt disponible." />
            <div className="row" style={{ gridTemplateColumns: '1fr auto' }}><span className="mut">Difficulté</span><span className="tag ti">{diff}</span></div>
            <div className="row" style={{ gridTemplateColumns: '1fr auto' }}><span className="mut">Siège du label</span><b>{cityById(L.hqCityId).name}</b></div>
          </div>
          <div className="pn cut">
            <div className="lbl">Sauvegarde</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              <button className="btn sm" style={{ border: 0, cursor: 'pointer' }} onClick={saveNow}>Sauvegarder maintenant</button>
              <button className="btn s sm" style={{ cursor: 'pointer' }} onClick={exportSave}>Exporter (.json)</button>
              <label className="btn s sm" style={{ cursor: 'pointer' }}>Importer une sauvegarde<input type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { if (importSave(String(r.result))) setTimeout(() => go('Hub'), 300) }; r.readAsText(f); e.target.value = '' }} /></label>
            </div>
            <div className="mut" style={{ fontSize: 12, marginTop: 10 }}>La sauvegarde est stockée dans ce navigateur : exportez-la pour la garder ou la jouer ailleurs.</div>
          </div>
          <div className="pn cut" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,84,112,.4)' }}>
            <div className="lbl" style={{ color: '#FF8EA0' }}>Zone sensible</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              <button className="btn s sm" style={{ cursor: 'pointer' }} onClick={() => { quit(); go('Menu') }}>Menu principal</button>
              <button className="btn s sm" style={{ cursor: 'pointer', boxShadow: danger === 'new' ? 'inset 0 0 0 2px #FF5470' : undefined }} onClick={() => { if (danger !== 'new') { setDanger('new'); say('Cliquez encore pour abandonner cette partie et en créer une nouvelle.', 'err'); return } quit(); go('NouvellePartie') }}>{danger === 'new' ? 'Confirmer : abandonner' : 'Nouvelle partie'}</button>
              <button className="btn s sm" style={{ cursor: 'pointer', boxShadow: danger === 'del' ? 'inset 0 0 0 2px #FF5470' : undefined }} onClick={() => { if (danger !== 'del') { setDanger('del'); say('Cliquez encore pour supprimer définitivement la sauvegarde.', 'err'); return } deleteSave(); go('Menu') }}>{danger === 'del' ? 'Confirmer la suppression' : 'Supprimer la sauvegarde'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
