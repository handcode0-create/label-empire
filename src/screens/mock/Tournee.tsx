// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Tournee.dc.html).
export default function Tournee() {
  return (
    <div className="scr">
      <nav className="dock" aria-label="Navigation du jeu">
        <div className="lg">LE</div>
        <a className="dk" href="Hub.dc.html" aria-label="Monde"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>Monde</a>
        <a className="dk" href="Artistes.dc.html" aria-label="Artistes"><svg viewBox="0 0 24 24"><circle cx={9} cy={8} r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17.5" cy={9} r="2.5" /><path d="M17 14.2c2.4.3 4 2.2 4 5.3" /></svg>Artistes</a>
        <a className="dk" href="Ecriture.dc.html" aria-label="Studio"><svg viewBox="0 0 24 24"><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>Studio</a>
        <a className="dk" href="Sortie.dc.html" aria-label="Sorties"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><circle cx={12} cy={12} r={3} /></svg>Sorties</a>
        <a className="dk" href="Classements.dc.html" aria-label="Classem."><svg viewBox="0 0 24 24"><path d="M5 20v-6M12 20V5M19 20v-10" /></svg>Classem.</a>
        <a className="dk on" href="Tournee.dc.html" aria-label="Tournées"><svg viewBox="0 0 24 24"><path d="M3 13l18-9-6 17-3-7-9-1z" /></svg>Tournées</a>
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
        <div style={{width: 700, display: 'flex', flexDirection: 'column', gap: 10}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><h1 className="h1" style={{fontSize: 36}}>Nouvelle tournée</h1><span className="sp" /><span className="tag tg">Artiste : Kozen</span></div>
          <div className="pn cut" style={{padding: '14px 18px'}}><label htmlFor="tn" className="lbl">Nom de la tournée</label><input id="tn" className="in" style={{marginTop: 8, fontSize: 20, fontWeight: 700}} defaultValue="Soleil Tour 2026" /></div>
          <div className="map" style={{height: 190, position: 'relative'}}><div className="mk c" style={{left: '50.9%', top: '46.4%'}} /><div className="mn" style={{left: '50.9%', top: '46.4%'}}>Lagos</div><div className="mk c" style={{left: '50.6%', top: '22.8%'}} /><div className="mk c" style={{left: '50%', top: '21.4%'}} /><div className="mk c" style={{left: '53.7%', top: '20.8%'}} /><div className="mk g" style={{left: '57.8%', top: '64.4%'}} /></div>
          <div style={{display: 'flex', alignItems: 'center'}}><span className="lbl">Étapes et prix des billets</span><span className="sp" /><a href="Tournee.dc.html" className="btn s sm">+ Ajouter une étape</a></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}><div className="pn" style={{display: 'grid', gridTemplateColumns: '28px 1fr 90px 130px 64px', gap: 12, alignItems: 'center', padding: '10px 16px'}}><b className="disp" style={{fontSize: 22, color: '#FF7DBB'}}>1</b><div><b>Lagos, Nigeria</b><div className="mut" style={{fontSize: 13}}>Eko Convention Hall · 8 000 places</div></div><span className="tag ti">Sem. 16</span><div style={{display: 'flex', alignItems: 'center', gap: 6}}><a href="Tournee.dc.html" className="chip" style={{height: 28, padding: '0 10px'}}>−</a><b style={{minWidth: 40, textAlign: 'center', fontSize: 17}}>$28</b><a href="Tournee.dc.html" className="chip on" style={{height: 28, padding: '0 10px'}}>+</a></div><b className="up">74 %</b></div><div className="pn sel" style={{display: 'grid', gridTemplateColumns: '28px 1fr 90px 130px 64px', gap: 12, alignItems: 'center', padding: '10px 16px'}}><b className="disp" style={{fontSize: 22, color: '#FF7DBB'}}>2</b><div><b>Paris, France</b><div className="mut" style={{fontSize: 13}}>La Cigale · 1 900 places</div></div><span className="tag ti">Sem. 17</span><div style={{display: 'flex', alignItems: 'center', gap: 6}}><a href="Tournee.dc.html" className="chip" style={{height: 28, padding: '0 10px'}}>−</a><b style={{minWidth: 40, textAlign: 'center', fontSize: 17}}>$34</b><a href="Tournee.dc.html" className="chip on" style={{height: 28, padding: '0 10px'}}>+</a></div><b className="up">92 %</b></div><div className="pn" style={{display: 'grid', gridTemplateColumns: '28px 1fr 90px 130px 64px', gap: 12, alignItems: 'center', padding: '10px 16px'}}><b className="disp" style={{fontSize: 22, color: '#FF7DBB'}}>3</b><div><b>Londres, Royaume-Uni</b><div className="mut" style={{fontSize: 13}}>Roundhouse · 3 300 places</div></div><span className="tag ti">Sem. 18</span><div style={{display: 'flex', alignItems: 'center', gap: 6}}><a href="Tournee.dc.html" className="chip" style={{height: 28, padding: '0 10px'}}>−</a><b style={{minWidth: 40, textAlign: 'center', fontSize: 17}}>$38</b><a href="Tournee.dc.html" className="chip on" style={{height: 28, padding: '0 10px'}}>+</a></div><b className="up">81 %</b></div><div className="pn" style={{display: 'grid', gridTemplateColumns: '28px 1fr 90px 130px 64px', gap: 12, alignItems: 'center', padding: '10px 16px'}}><b className="disp" style={{fontSize: 22, color: '#FF7DBB'}}>4</b><div><b>Berlin, Allemagne</b><div className="mut" style={{fontSize: 13}}>Columbiahalle · 3 500 places</div></div><span className="tag ti">Sem. 19</span><div style={{display: 'flex', alignItems: 'center', gap: 6}}><a href="Tournee.dc.html" className="chip" style={{height: 28, padding: '0 10px'}}>−</a><b style={{minWidth: 40, textAlign: 'center', fontSize: 17}}>$32</b><a href="Tournee.dc.html" className="chip on" style={{height: 28, padding: '0 10px'}}>+</a></div><b className="up">58 %</b></div></div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 10}}>
          <div className="lbl">Partenaires</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}><div className="pn sel" style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px'}}><div style={{flex: 1}}><b>Promoteur : Nova Live</b><div className="mut" style={{fontSize: 13}}>Réduit les risques, prend 12 % de la billetterie.</div></div><span className="tag tg">Choisi</span></div><div className="pn sel" style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px'}}><div style={{flex: 1}}><b>Sponsor : Kola Fizz</b><div className="mut" style={{fontSize: 13}}>$15 000 garantis, logo sur scène.</div></div><span className="tag te">Choisi</span></div><div className="pn" style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px'}}><div style={{flex: 1}}><b>Billetterie : TicketAfrik</b><div className="mut" style={{fontSize: 13}}>Vente en ligne dans 3 pays, frais 5 %.</div></div><span className="tag ti">Option</span></div><div className="pn" style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px'}}><div style={{flex: 1}}><b>Transport : AirSavane</b><div className="mut" style={{fontSize: 13}}>Jets régionaux, −2 fatigue.</div></div><span className="tag ti">Option</span></div></div>
          <div className="pn cut">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 6}}>Coûts : $48 000</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 6}}>Recettes : $96 000</div></div>
              <div><span className="tag ti">Incertain</span><div style={{marginTop: 6}}>Berlin : salle à 58 %</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 6}}>Fatigue et visa UK</div></div>
            </div>
            <div className="lbl" style={{marginTop: 12}}>Bénéfice estimé</div><div className="num" style={{color: '#3DDC97'}}>+$63 000</div>
          </div>
          <div className="sp" />
          <a href="Rapport.dc.html" className="btn" style={{height: 60}}>Lancer la tournée</a>
        </div>
      </div>
    </div>
  )
}
