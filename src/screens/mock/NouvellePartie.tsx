// Fichier généré par scripts/port-mockups.cjs depuis la maquette (NouvellePartie.dc.html).
export default function NouvellePartie() {
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
          <input id="nm" className="in" style={{marginTop: 6, fontSize: 18, fontWeight: 700}} defaultValue="Savane Records" />
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
          <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}><span className="chip on">Dollar $</span><span className="chip">Euro €</span><span className="chip">Franc CFA</span></div>
          <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}><span className="chip">Facile</span><span className="chip on">Normal</span><span className="chip">Difficile</span></div>
        </div>
      </div>
      <div className="pn cut" style={{position: 'absolute', left: 510, top: 112, width: 470, height: 676}}>
        <div className="lbl">Fondateur du label</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14}}>
          <div className="av" style={{width: 112, height: 112, fontSize: 40, background: 'linear-gradient(135deg,#FF3D9A,#8B5CF6)', boxShadow: '0 0 0 4px var(--ln), 0 0 30px rgba(255,61,154,0.4)'}}>SJ</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}><a href="NouvellePartie.dc.html" className="btn s sm">Choisir une photo</a><span className="mut" style={{fontSize: 13}}>Photo ou avatar. Facultatif.</span></div>
        </div>
        <label htmlFor="fn" className="mut" style={{fontSize: 13, display: 'block', marginTop: 18}}>Nom complet</label>
        <input id="fn" className="in" style={{marginTop: 6}} defaultValue="Smith Junior" />
        <label htmlFor="nat" className="mut" style={{fontSize: 13, display: 'block', marginTop: 14}}>Nationalité</label>
        <input id="nat" className="in" style={{marginTop: 6}} defaultValue="Ivoirienne ▾" />
        <div className="lbl" style={{marginTop: 18}}>Genre musical principal</div>
        <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}><span className="chip on">Afro-pop</span><span className="chip">Coupé-décalé</span><span className="chip">Hip-hop</span><span className="chip">R&amp;B</span><span className="chip">Amapiano</span><span className="chip">Pop</span><span className="chip">Électro</span><span className="chip">Rock</span></div>
        <div style={{display: 'flex', alignItems: 'baseline', marginTop: 20}}><span className="lbl">Réputation de départ</span><span className="sp" /><b className="disp" style={{fontSize: 26, color: '#FF7DBB'}}>15</b></div>
        <div className="sl" style={{marginTop: 14}}><i style={{width: '30%'}} /><u style={{left: '30%'}} /></div>
        <div className="mut" style={{fontSize: 13, marginTop: 12}}>Plus la réputation de départ est haute, moins vous avez de cash : <b style={{color: '#FFC63D'}}>$120 000</b> à 15.</div>
      </div>
      <div style={{position: 'absolute', left: 1004, top: 112, width: 380, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div className="pn sel">
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><input id="art" type="checkbox" defaultChecked style={{width: 26, height: 26, accentColor: '#FF3D9A'}} /><label htmlFor="art" className="h2" style={{fontSize: 22}}>Je suis aussi artiste</label></div>
          <div className="mut" style={{fontSize: 14, marginTop: 10}}>Vous serez le premier artiste du label : vous sortez vos titres, montez sur scène et apparaissez dans les classements. Vous recevrez des points de compétence d'artiste à l'étape suivante.</div>
        </div>
        <div className="pn cut">
          <div className="lbl">Aperçu</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 12}}>
            <div style={{width: 60, height: 60, display: 'grid', placeItems: 'center', background: '#2A1B4D', borderRadius: 14}}><div style={{width: 30, height: 30, borderRadius: '50%', border: '6px solid #FF3D9A'}} /></div>
            <div><div className="disp" style={{fontSize: 26, lineHeight: 1}}>Savane Records</div><div className="mut" style={{fontSize: 13}}>Fondé par Smith Junior · Ivoirienne · afro-pop</div></div>
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
