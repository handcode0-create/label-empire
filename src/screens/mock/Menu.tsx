// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Menu.dc.html).
export default function Menu() {
  return (
    <div className="scr">
      <div className="map" style={{position: 'absolute', left: 520, top: 120, width: 960, height: 480, opacity: '0.5'}} />
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 560, background: 'linear-gradient(90deg, rgba(12,7,25,0.96) 70%, transparent)'}} />
      <div style={{position: 'absolute', left: 80, top: 72, display: 'flex', alignItems: 'center', gap: 16}}>
        <div className="lg" style={{margin: 0}}>LE</div>
        <div className="disp" style={{fontSize: 40, letterSpacing: '0.08em'}}>LABEL EMPIRE</div>
      </div>
      <div style={{position: 'absolute', left: 80, top: 220, width: 400, display: 'flex', flexDirection: 'column', gap: 14}}>
        <a href="Hub.dc.html" className="btn" style={{height: 64, justifyContent: 'space-between', padding: '0 28px'}}>Continuer <span style={{fontSize: 14, letterSpacing: '0.02em', textTransform: 'none'}}>Semaine 14</span></a>
        <a href="NouvellePartie.dc.html" className="btn s">Nouvelle partie</a>
        <a href="Hub.dc.html" className="btn s">Charger une partie</a>
        <a href="Menu.dc.html" className="btn s">Options</a>
        <a href="Menu.dc.html" className="btn s">Crédits</a>
        <a href="Main.dc.html" className="btn s" style={{opacity: '0.8'}}>Quitter</a>
      </div>
      <div className="pn cut" style={{position: 'absolute', left: 640, top: 560, width: 720, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 18}}>
        <div style={{gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12}}><span className="lbl">Dernière partie</span><span className="tag tg">Sauvegarde auto, il y a 12 min</span></div>
        <div><div className="lbl">Label</div><div className="h2" style={{marginTop: 6}}>Savane Records</div><div className="mut" style={{fontSize: 14}}>Siège : Abidjan</div></div>
        <div><div className="lbl">Palier</div><div className="h2" style={{marginTop: 6}}>2 · National</div><div className="mut" style={{fontSize: 14}}>Réputation 34</div></div>
        <div><div className="lbl">Fans</div><div className="h2" style={{marginTop: 6, color: '#35D3F0'}}>2,4 M</div><div className="mut" style={{fontSize: 14}}>9 pays</div></div>
        <div><div className="lbl">Trésorerie</div><div className="h2" style={{marginTop: 6, color: '#FFC63D'}}>$128 400</div><div className="mut" style={{fontSize: 14}}>Semaine 14, an 2</div></div>
      </div>
      <div style={{position: 'absolute', left: 80, bottom: 32, fontSize: 13, color: '#9C90CC'}}>Maquette v0.1 · Les artistes et labels sont fictifs</div>
    </div>
  )
}
