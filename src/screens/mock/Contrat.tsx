// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Contrat.dc.html).
export default function Contrat() {
  return (
    <div className="scr">
      <nav className="dock" aria-label="Navigation du jeu">
        <div className="lg">LE</div>
        <a className="dk" href="Hub.dc.html" aria-label="Monde"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>Monde</a>
        <a className="dk on" href="Artistes.dc.html" aria-label="Artistes"><svg viewBox="0 0 24 24"><circle cx={9} cy={8} r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17.5" cy={9} r="2.5" /><path d="M17 14.2c2.4.3 4 2.2 4 5.3" /></svg>Artistes</a>
        <a className="dk" href="Studio.dc.html" aria-label="Studio"><svg viewBox="0 0 24 24"><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>Studio</a>
        <a className="dk" href="Sortie.dc.html" aria-label="Sorties"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><circle cx={12} cy={12} r={3} /></svg>Sorties</a>
        <a className="dk" href="Classements.dc.html" aria-label="Classements"><svg viewBox="0 0 24 24"><path d="M5 20v-6M12 20V5M19 20v-10" /></svg>Classem.</a>
        <a className="dk" href="Tournee.dc.html" aria-label="Tournées"><svg viewBox="0 0 24 24"><path d="M3 13l18-9-6 17-3-7-9-1z" /></svg>Tournées</a>
        <a className="dk" href="Equipe.dc.html" aria-label="Équipe"><svg viewBox="0 0 24 24"><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M9 7V5h6v2M3 13h18" /></svg>Équipe</a>
        <a className="dk" href="Finances.dc.html" aria-label="Finances"><svg viewBox="0 0 24 24"><path d="M3 7h16a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2V7zM3 7l2-3h12M16 14h2" /></svg>Finances</a>
      </nav>
      <header className="hud">
        <div className="av" style={{background: 'linear-gradient(135deg,#8B5CF6,#FF3D9A)'}}>SR</div>
        <div><div className="disp" style={{fontSize: 22, lineHeight: 1}}>Savane Records</div><div className="lbl" style={{marginTop: 3}}>Palier 2 · Label national</div></div>
        <div className="sp" />
        <div className="coin"><i style={{background: '#FFC63D'}}>$</i><b>128 400</b></div>
        <div className="coin"><i style={{background: '#8B5CF6', color: '#fff'}}>★</i><b>34</b><small>Réputation</small></div>
        <div className="coin"><i style={{background: '#35D3F0'}}>♪</i><b>2,4 M</b><small>Fans</small></div>
        <div className="coin"><i style={{background: '#3DDC97'}}>◆</i><b>4/6</b><small>Actions</small></div>
        <div style={{textAlign: 'right'}}><div className="lbl">Semaine</div><div className="disp" style={{fontSize: 22, lineHeight: 1}}>14 · An 2</div></div>
      </header>
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 470, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div className="pn cut" style={{height: 330, padding: 0, overflow: 'hidden', background: 'radial-gradient(300px 220px at 50% 40%, rgba(139,92,246,0.55), transparent), #1C1236'}}>
            <div className="map" style={{position: 'absolute', inset: 0, opacity: '0.25'}} />
            <div className="av" style={{position: 'absolute', left: 160, top: 52, width: 150, height: 150, fontSize: 56, background: 'linear-gradient(135deg,#35D3F0,#8B5CF6)'}}>ZD</div>
            <div style={{position: 'absolute', left: 24, bottom: 20}}><div className="lbl">Artiste à signer</div><div className="disp" style={{fontSize: 42, lineHeight: 1}}>ZOLA DUBE</div><div className="mut" style={{fontSize: 14}}>Johannesburg, Afrique du Sud · amapiano, house</div></div>
            <span className="tag tc" style={{position: 'absolute', right: 20, top: 20}}>Potentiel : ★★★★★</span>
          </div>
          <div className="bub"><span className="tag ti" style={{marginRight: 8}}>Attentif</span>« Je veux une avance solide et un contrat qui couvre l'Afrique et l'Europe. »</div>
          <div className="pn" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14}}>
            <div><div className="lbl">Ego</div><div style={{marginTop: 4}}>Élevé</div></div>
            <div><div className="lbl">Fiabilité</div><div style={{marginTop: 4}}>Moyenne</div></div>
            <div><div className="lbl">Langues</div><div style={{marginTop: 4}}>Anglais, zoulou</div></div>
            <div><div className="lbl">Fans actuels</div><div style={{marginTop: 4}}>210 k, surtout Afrique australe</div></div>
          </div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
          <h1 className="h1">Négocier le contrat</h1>
          <div className="pn" style={{display: 'grid', gridTemplateColumns: '140px 1fr 110px', gap: '22px 16px', alignItems: 'center'}}>
            <span>Durée</span><div className="sl"><i style={{width: '50%'}} /><u style={{left: '50%'}} /></div><b style={{textAlign: 'right'}}>3 ans</b>
            <span>Avance</span><div className="sl"><i style={{width: '36%'}} /><u style={{left: '36%'}} /></div><b style={{textAlign: 'right', color: '#FFC63D'}}>$18 000</b>
            <span>Part du label</span><div className="sl"><i style={{width: '62%'}} /><u style={{left: '62%'}} /></div><b style={{textAlign: 'right'}}>55 %</b>
            <span>Titres exigés</span><div className="sl"><i style={{width: '56%'}} /><u style={{left: '56%'}} /></div><b style={{textAlign: 'right'}}>8 titres</b>
            <span>Territoires</span><div style={{display: 'flex', gap: 8}}><span className="chip">Un pays</span><span className="chip on">Continent</span><span className="chip">Monde</span></div><b style={{textAlign: 'right'}}>Afrique + Europe</b>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
            <div className="pn"><span className="tag tc">Certain</span><div style={{marginTop: 8}}><b>Coût immédiat</b><div className="mut" style={{fontSize: 14}}>$18 000 versés à la signature</div></div></div>
            <div className="pn"><span className="tag te">Estimé</span><div style={{marginTop: 8}}><b>Revenus sur 3 ans</b><div className="mut" style={{fontSize: 14}}>de $210 000 à $340 000 pour le label</div></div></div>
            <div className="pn"><span className="tag ti">Incertain</span><div style={{marginTop: 8}}><b>Acceptation</b><div className="mut" style={{fontSize: 14}}>Dépend de son ego et d'un label rival intéressé</div></div></div>
            <div className="pn"><span className="tag tr_">Risque moyen</span><div style={{marginTop: 8}}><b>Moral</b><div className="mut" style={{fontSize: 14}}>Une part de 55 % peut réduire sa fidélité</div></div></div>
          </div>
          <div className="sp" />
          <div style={{display: 'flex', gap: 14, justifyContent: 'flex-end', alignItems: 'center'}}>
            <span className="mut" style={{fontSize: 14}}>Cette proposition coûte 1 action sur 4.</span>
            <a href="Artistes.dc.html" className="btn s">Annuler</a>
            <a href="Artistes.dc.html" className="btn" style={{height: 60}}>Proposer le contrat</a>
          </div>
        </div>
      </div>
    </div>
  )
}
