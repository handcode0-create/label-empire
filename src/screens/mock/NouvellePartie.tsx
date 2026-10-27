import Chip from '../../components/Chip'
import { useGame } from '../../store/gameStore'

// Fichier généré par scripts/port-mockups.cjs depuis la maquette (NouvellePartie.dc.html).
export default function NouvellePartie() {
  const c = useGame((st) => st.config)
  const patch = useGame((st) => st.patch)
  const cash = useGame((st) => st.cash)()
  return (
    <div className="scr">
      <div style={{position: 'absolute', left: 56, top: 36, right: 56, display: 'flex', alignItems: 'center', gap: 16}}>
        <a href="Menu.dc.html" className="btn s sm">Retour</a>
        <h1 className="h1">Nouvelle partie</h1>
        <div className="sp" />
        <span className="chip on">1 Identité</span><span className="chip">2 Compétences et siège</span>
      </div>
      <div style={{position: 'absolute', left: 56, top: 112, width: 430, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div className="pn cut">
          <div className="lbl">Votre label</div>
          <label htmlFor="nm" className="mut" style={{fontSize: 13, display: 'block', marginTop: 12}}>Nom du label</label>
          <input id="nm" className="in" style={{marginTop: 6, fontSize: 18, fontWeight: 700}} value={c.labelName} onChange={(e) => patch({ labelName: e.target.value })} />
          <div className="lbl" style={{marginTop: 18}}>Logo</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 10}}>
            <div className="pn" style={{height: 76, display: 'grid', placeItems: 'center', padding: 0}}><div style={{width: 38, height: 38, background: 'linear-gradient(135deg,#FFC63D,#FF3D9A)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)'}} /></div>
            <div className="pn sel" style={{height: 76, display: 'grid', placeItems: 'center', padding: 0}}><div style={{width: 38, height: 38, borderRadius: '50%', border: '7px solid #FF3D9A', boxShadow: '0 0 14px rgba(255,61,154,0.6)'}} /></div>
            <div className="pn" style={{height: 76, display: 'grid', placeItems: 'center', padding: 0}}><div style={{width: 40, height: 40, background: 'linear-gradient(135deg,#35D3F0,#8B5CF6)', clipPath: 'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0 50%)'}} /></div>
            <div className="pn" style={{height: 76, display: 'grid', placeItems: 'center', padding: 0}}><div style={{width: 38, height: 38, background: 'linear-gradient(135deg,#3DDC97,#35D3F0)', clipPath: 'polygon(50% 0,100% 100%,0 100%)'}} /></div>
            <div className="pn" style={{height: 76, display: 'grid', placeItems: 'center', padding: 0}}><div style={{width: 38, height: 38, background: 'linear-gradient(135deg,#FF5470,#FFC63D)', borderRadius: 10, transform: 'rotate(45deg)'}} /></div>
            <div className="pn" style={{height: 76, display: 'grid', placeItems: 'center', padding: 0}}><div className="disp" style={{fontSize: 30, color: '#FFC63D'}}>SR</div></div>
            <div className="pn" style={{height: 76, display: 'grid', placeItems: 'center', padding: 0}}><div style={{width: 38, height: 38, background: 'linear-gradient(135deg,#8B5CF6,#FF3D9A)', clipPath: 'polygon(0 0,100% 0,100% 70%,50% 100%,0 70%)'}} /></div>
            <a href="NouvellePartie.dc.html" className="pn" style={{height: 76, display: 'grid', placeItems: 'center', padding: 0, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#B3A6D9', boxShadow: 'inset 0 0 0 2px var(--ln)', background: 'transparent'}}>Importer<br />mon logo</a>
          </div>
          <div className="mut" style={{fontSize: 13, marginTop: 10}}>Logos provisoires. Les logos du jeu seront ajoutés plus tard avec l'outil interne du studio.</div>
        </div>
        <div className="pn">
          <div className="lbl">Réglages de la partie</div>
          <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}><Chip on={c.currency === 'USD'} onClick={() => patch({ currency: 'USD' })}>Dollar $</Chip><Chip on={c.currency === 'EUR'} onClick={() => patch({ currency: 'EUR' })}>Euro €</Chip><Chip on={c.currency === 'XOF'} onClick={() => patch({ currency: 'XOF' })}>Franc CFA</Chip></div>
          <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}><Chip on={c.difficulty === 'facile'} onClick={() => patch({ difficulty: 'facile' })}>Facile</Chip><Chip on={c.difficulty === 'normal'} onClick={() => patch({ difficulty: 'normal' })}>Normal</Chip><Chip on={c.difficulty === 'difficile'} onClick={() => patch({ difficulty: 'difficile' })}>Difficile</Chip></div>
        </div>
      </div>
      <div className="pn cut" style={{position: 'absolute', left: 510, top: 112, width: 470, height: 676}}>
        <div className="lbl">Fondateur du label</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14}}>
          <div className="av" style={{width: 112, height: 112, fontSize: 40, background: 'linear-gradient(135deg,#FF3D9A,#8B5CF6)', boxShadow: '0 0 0 4px var(--ln), 0 0 30px rgba(255,61,154,0.4)'}}>{c.founderName.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}><a href="NouvellePartie.dc.html" className="btn s sm">Choisir une photo</a><span className="mut" style={{fontSize: 13}}>Photo ou avatar. Facultatif.</span></div>
        </div>
        <label htmlFor="fn" className="mut" style={{fontSize: 13, display: 'block', marginTop: 18}}>Nom complet</label>
        <input id="fn" className="in" style={{marginTop: 6}} value={c.founderName} onChange={(e) => patch({ founderName: e.target.value })} />
        <label htmlFor="nat" className="mut" style={{fontSize: 13, display: 'block', marginTop: 14}}>Nationalité</label>
        <input id="nat" className="in" style={{marginTop: 6}} value={c.nationality} onChange={(e) => patch({ nationality: e.target.value })} />
        <div className="lbl" style={{marginTop: 18}}>Genre musical principal</div>
        <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}><Chip on={c.mainGenre === 'Afro-pop'} onClick={() => patch({ mainGenre: 'Afro-pop' })}>Afro-pop</Chip><Chip on={c.mainGenre === 'Coupé-décalé'} onClick={() => patch({ mainGenre: 'Coupé-décalé' })}>Coupé-décalé</Chip><Chip on={c.mainGenre === 'Hip-hop'} onClick={() => patch({ mainGenre: 'Hip-hop' })}>Hip-hop</Chip><Chip on={c.mainGenre === 'R&B'} onClick={() => patch({ mainGenre: 'R&B' })}>R&amp;B</Chip><Chip on={c.mainGenre === 'Amapiano'} onClick={() => patch({ mainGenre: 'Amapiano' })}>Amapiano</Chip><Chip on={c.mainGenre === 'Pop'} onClick={() => patch({ mainGenre: 'Pop' })}>Pop</Chip><Chip on={c.mainGenre === 'Électro'} onClick={() => patch({ mainGenre: 'Électro' })}>Électro</Chip><Chip on={c.mainGenre === 'Rock'} onClick={() => patch({ mainGenre: 'Rock' })}>Rock</Chip></div>
        <div style={{display: 'flex', alignItems: 'baseline', marginTop: 20}}><span className="lbl">Réputation de départ</span><span className="sp" /><b className="disp" style={{fontSize: 26, color: '#FF7DBB'}}>{c.startReputation}</b></div>
        <div style={{position: 'relative', marginTop: 14}}><div className="sl"><i style={{width: `${c.startReputation / 0.5}%`}} /><u style={{left: `${c.startReputation / 0.5}%`}} /></div><input type="range" aria-label="Réputation de départ" min={0} max={50} value={c.startReputation} onChange={(e) => patch({ startReputation: +e.target.value })} style={{position: 'absolute', left: 0, top: -10, width: '100%', height: 28, opacity: 0, cursor: 'pointer'}} /></div>
        <div className="mut" style={{fontSize: 13, marginTop: 12}}>Plus la réputation de départ est haute, moins vous avez de cash : <b style={{color: '#FFC63D'}}>${cash.toLocaleString('fr-FR')}</b> à {c.startReputation}.</div>
      </div>
      <div style={{position: 'absolute', left: 1004, top: 112, width: 380, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div className="pn sel">
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><input id="art" type="checkbox" checked={c.alsoArtist} onChange={(e) => patch({ alsoArtist: e.target.checked })} style={{width: 26, height: 26, accentColor: '#FF3D9A'}} /><label htmlFor="art" className="h2" style={{fontSize: 22}}>Je suis aussi artiste</label></div>
          <div className="mut" style={{fontSize: 14, marginTop: 10}}>Vous serez le premier artiste du label : vous sortez vos titres, montez sur scène et apparaissez dans les classements. Vous recevrez des points de compétence d'artiste à l'étape suivante.</div>
        </div>
        <div className="pn cut">
          <div className="lbl">Aperçu</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 12}}>
            <div style={{width: 60, height: 60, display: 'grid', placeItems: 'center', background: '#2A1B4D', borderRadius: 14}}><div style={{width: 30, height: 30, borderRadius: '50%', border: '6px solid #FF3D9A'}} /></div>
            <div><div className="disp" style={{fontSize: 26, lineHeight: 1}}>{c.labelName}</div><div className="mut" style={{fontSize: 13}}>Fondé par {c.founderName} · {c.nationality} · {c.mainGenre.toLowerCase()}</div></div>
          </div>
          <div style={{display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap'}}><span className="tag ti">Réputation 15</span><span className="tag te">Artiste fondateur</span><span className="tag tg">Cash $120 000</span></div>
        </div>
        <div className="sp" />
      </div>
      <div style={{position: 'absolute', left: 56, right: 56, bottom: 30, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 20}}>
        <span className="mut" style={{fontSize: 14}}>Étape suivante : répartir vos points et choisir la ville du siège.</span>
        <a href="NouvellePartie2.dc.html" className="btn" style={{height: 60}}>Suivant</a>
      </div>
    </div>
  )
}
