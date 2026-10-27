import { ARTIST_LABELS, CITIES, GENRES, LOGOS, NATIONALITIES, STAFF_LABELS } from '../data/world'
import { useGame } from '../store/gameStore'

const total = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0)

function Points({ group, labels }: { group: 'staffSkills' | 'artistSkills'; labels: Record<string, string> }) {
  const skills = useGame((s) => s.config[group])
  const setSkill = useGame((s) => s.setSkill)
  return (
    <>
      <div className="mut">Points restants : <b>{10 - total(skills)}</b> / 10</div>
      {Object.entries(labels).map(([k, label]) => (
        <div className="row" key={k}>
          <b>{label}</b>
          <button className="step" aria-label={`Retirer ${label}`} onClick={() => setSkill(group, k, -1)}>−</button>
          <div className="bar"><i style={{ width: `${(skills[k] ?? 0) * 10}%` }} /></div>
          <button className="step" aria-label={`Ajouter ${label}`} onClick={() => setSkill(group, k, 1)}>+</button>
          <span style={{ width: 20, textAlign: 'right' }}>{skills[k] ?? 0}</span>
        </div>
      ))}
    </>
  )
}

export function NewGameStep1() {
  const { config: c, patch, go, cash } = useGame()
  const ok = c.labelName.trim() && c.founderName.trim()
  return (
    <div>
      <h1>Nouvelle partie · 1. Identité</h1>
      <div className="grid" style={{ marginTop: 20 }}>
        <div className="pn">
          <div className="lbl">Votre label</div>
          <input type="text" aria-label="Nom du label" value={c.labelName} onChange={(e) => patch({ labelName: e.target.value })} />
          <div className="lbl" style={{ marginTop: 16 }}>Logo</div>
          <div className="chips">
            {LOGOS.map((l) => <button key={l} className={'chip' + (c.logoId === l ? ' on' : '')} onClick={() => patch({ logoId: l })}>{l}</button>)}
          </div>
          <p className="mut">Logos provisoires. Les logos du jeu viendront de l'outil interne.</p>
          <div className="lbl" style={{ marginTop: 16 }}>Devise</div>
          <div className="chips">
            {(['USD', 'EUR', 'XOF'] as const).map((d) => <button key={d} className={'chip' + (c.currency === d ? ' on' : '')} onClick={() => patch({ currency: d })}>{d}</button>)}
          </div>
          <div className="lbl" style={{ marginTop: 16 }}>Difficulté</div>
          <div className="chips">
            {(['facile', 'normal', 'difficile'] as const).map((d) => <button key={d} className={'chip' + (c.difficulty === d ? ' on' : '')} onClick={() => patch({ difficulty: d })}>{d}</button>)}
          </div>
        </div>
        <div className="pn">
          <div className="lbl">Fondateur</div>
          <input type="text" aria-label="Nom complet" placeholder="Nom complet" value={c.founderName} onChange={(e) => patch({ founderName: e.target.value })} />
          <label className="mut" htmlFor="nat">Nationalité</label>
          <select id="nat" value={c.nationality} onChange={(e) => patch({ nationality: e.target.value })}>{NATIONALITIES.map((n) => <option key={n}>{n}</option>)}</select>
          <div className="lbl" style={{ marginTop: 16 }}>Genre musical principal</div>
          <div className="chips">{GENRES.map((g) => <button key={g} className={'chip' + (c.mainGenre === g ? ' on' : '')} onClick={() => patch({ mainGenre: g })}>{g}</button>)}</div>
          <div className="lbl" style={{ marginTop: 16 }}>Réputation de départ : {c.startReputation}</div>
          <input type="range" min={0} max={60} value={c.startReputation} onChange={(e) => patch({ startReputation: +e.target.value })} style={{ width: '100%' }} />
          <p className="mut">Plus la réputation est haute, moins vous avez de cash : ${cash().toLocaleString('fr-FR')}.</p>
        </div>
        <div className={'pn' + (c.alsoArtist ? ' sel' : '')}>
          <label style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 20, fontWeight: 700 }}>
            <input type="checkbox" checked={c.alsoArtist} onChange={(e) => patch({ alsoArtist: e.target.checked })} style={{ width: 24, height: 24 }} />
            Je suis aussi artiste
          </label>
          <p className="mut">Vous êtes le premier artiste du label : vous sortez vos titres, montez sur scène et figurez dans les classements.</p>
        </div>
      </div>
      <div className="footer">
        <button className="btn s" onClick={() => go('menu')}>Retour</button>
        <button className="btn" disabled={!ok} onClick={() => go('new2')}>Suivant</button>
      </div>
    </div>
  )
}

export function NewGameStep2() {
  const { config: c, patch, go, start, errors } = useGame()
  const errs = errors()
  return (
    <div>
      <h1>Nouvelle partie · 2. Compétences et siège</h1>
      <div className="grid" style={{ marginTop: 20 }}>
        <div className="pn"><div className="lbl">Compétences du staff</div><Points group="staffSkills" labels={STAFF_LABELS} /></div>
        <div className={'pn' + (c.alsoArtist ? ' sel' : '')} style={{ opacity: c.alsoArtist ? 1 : 0.5 }}>
          <div className="lbl">Compétences d'artiste</div>
          {c.alsoArtist ? <Points group="artistSkills" labels={ARTIST_LABELS} /> : <p className="mut">Désactivé : vous n'êtes pas artiste.</p>}
        </div>
        <div className="pn">
          <div className="lbl">Ville du siège</div>
          <div className="chips">{CITIES.map((v) => <button key={v.id} className={'chip' + (c.hqCityId === v.id ? ' on' : '')} onClick={() => patch({ hqCityId: v.id })}>{v.name}</button>)}</div>
          {CITIES.filter((v) => v.id === c.hqCityId).map((v) => (
            <p key={v.id} className="mut">{v.name}, {v.country} · loyer ${v.rent.toLocaleString('fr-FR')} / mois · marché tier {v.tier}</p>
          ))}
        </div>
      </div>
      <div className="footer">
        {errs.map((e) => <span className="err" key={e}>{e}</span>)}
        <button className="btn s" onClick={() => go('new1')}>Retour</button>
        <button className="btn" disabled={errs.length > 0} onClick={start}>Commencer l'aventure</button>
      </div>
    </div>
  )
}
