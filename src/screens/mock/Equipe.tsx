// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Equipe.dc.html).
export default function Equipe() {
  return (
    <div className="scr">
      <nav className="dock" aria-label="Navigation du jeu">
        <div className="lg">LE</div>
        <a className="dk" href="Hub.dc.html" aria-label="Monde"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>Monde</a>
        <a className="dk" href="Artistes.dc.html" aria-label="Artistes"><svg viewBox="0 0 24 24"><circle cx={9} cy={8} r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17.5" cy={9} r="2.5" /><path d="M17 14.2c2.4.3 4 2.2 4 5.3" /></svg>Artistes</a>
        <a className="dk" href="Studio.dc.html" aria-label="Studio"><svg viewBox="0 0 24 24"><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>Studio</a>
        <a className="dk" href="Sortie.dc.html" aria-label="Sorties"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><circle cx={12} cy={12} r={3} /></svg>Sorties</a>
        <a className="dk" href="Classements.dc.html" aria-label="Classements"><svg viewBox="0 0 24 24"><path d="M5 20v-6M12 20V5M19 20v-10" /></svg>Classem.</a>
        <a className="dk" href="Tournee.dc.html" aria-label="Tournées"><svg viewBox="0 0 24 24"><path d="M3 13l18-9-6 17-3-7-9-1z" /></svg>Tournées</a>
        <a className="dk on" href="Equipe.dc.html" aria-label="Équipe"><svg viewBox="0 0 24 24"><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M9 7V5h6v2M3 13h18" /></svg>Équipe</a>
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
        <div style={{width: 760}}>
          <div style={{display: 'flex', alignItems: 'center'}}><h1 className="h1">Équipe</h1><span className="sp" /><span className="tag ti">Salaires : $7 400 / semaine</span></div>
          <div className="pn cut" style={{marginTop: 14, padding: '12px 20px'}}>
            <div className="row th" style={{gridTemplateColumns: '210px 120px 80px 100px 1fr'}}><span>Rôle</span><span>Ville</span><span>Niveau</span><span>Salaire / sem.</span><span>Moral</span></div>
            <div className="row" style={{gridTemplateColumns: '210px 120px 80px 100px 1fr'}}><div><b>Tayo Bello</b><div className="mut" style={{fontSize: 13}}>Producteur</div></div><span>Lagos</span><span style={{color: '#FFC63D'}}>★★★★</span><span>$1 400</span><div className="mt gr"><i style={{width: '82%'}} /></div></div>
            <div className="row" style={{gridTemplateColumns: '210px 120px 80px 100px 1fr'}}><div><b>Zainab Yusuf</b><div className="mut" style={{fontSize: 13}}>Booker</div></div><span>Lagos</span><span style={{color: '#FFC63D'}}>★★★</span><span>$1 100</span><div className="mt gr"><i style={{width: '70%'}} /></div></div>
            <div className="row" style={{gridTemplateColumns: '210px 120px 80px 100px 1fr'}}><div><b>Marc Lefèvre</b><div className="mut" style={{fontSize: 13}}>Directeur artistique</div></div><span>Paris</span><span style={{color: '#FFC63D'}}>★★★</span><span>$1 900</span><div className="mt gd"><i style={{width: '58%'}} /></div></div>
            <div className="row" style={{gridTemplateColumns: '210px 120px 80px 100px 1fr'}}><div><b>Adjoua Koffi</b><div className="mut" style={{fontSize: 13}}>Éclaireuse</div></div><span>Abidjan</span><span style={{color: '#FFC63D'}}>★★</span><span>$700</span><div className="mt gr"><i style={{width: '90%'}} /></div></div>
            <div className="row" style={{gridTemplateColumns: '210px 120px 80px 100px 1fr'}}><div><b>Samuel Ndiaye</b><div className="mut" style={{fontSize: 13}}>Marketing</div></div><span>Dakar</span><span style={{color: '#FFC63D'}}>★★</span><span>$900</span><div className="mt rd"><i style={{width: '34%'}} /></div></div>
            <div className="row" style={{gridTemplateColumns: '210px 120px 80px 100px 1fr'}}><div><b>Poste vacant</b><div className="mut" style={{fontSize: 13}}>Réalisateur de clips</div></div><span>à choisir</span><span className="mut">–</span><span className="mut">–</span><a href="Equipe.dc.html" className="tag tc" style={{justifySelf: 'start'}}>Recruter</a></div>
            <div className="row" style={{gridTemplateColumns: '210px 120px 80px 100px 1fr'}}><div><b>Poste vacant</b><div className="mut" style={{fontSize: 13}}>Comptable</div></div><span>à choisir</span><span className="mut">–</span><span className="mut">–</span><a href="Equipe.dc.html" className="tag tc" style={{justifySelf: 'start'}}>Recruter</a></div>
          </div>
          <div className="bub" style={{marginTop: 14}}><span className="tag tr_" style={{marginRight: 8}}>Alerte</span>Samuel Ndiaye (Dakar) demande une revalorisation. Son moral est bas.</div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
          <h2 className="h2" style={{marginTop: 6}}>Bureaux et partenaires</h2>
          <div className="pn" style={{padding: '12px 18px'}}>
            <div className="row" style={{gridTemplateColumns: '1fr 150px'}}><div><b>Abidjan</b><div className="mut" style={{fontSize: 13}}>Siège · loyer $2 600 / mois</div></div><span className="tag tg">Bureau complet</span></div>
            <div className="row" style={{gridTemplateColumns: '1fr 150px'}}><div><b>Lagos</b><div className="mut" style={{fontSize: 13}}>$4 200 / mois</div></div><span className="tag tc">Représentant local</span></div>
            <div className="row" style={{gridTemplateColumns: '1fr 150px'}}><div><b>Paris</b><div className="mut" style={{fontSize: 13}}>8 % des ventes</div></div><span className="tag tc">Partenaire distribution</span></div>
            <div className="row" style={{gridTemplateColumns: '1fr 150px'}}><div><b>Johannesburg</b><div className="mut" style={{fontSize: 13}}>Aucune présence</div></div><span className="tag te">Disponible</span></div>
          </div>
          <div className="pn cut sel">
            <div className="lbl">Ouvrir un bureau</div>
            <div className="h2" style={{marginTop: 6, fontSize: 28}}>Londres</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 6}}>Coût d'installation : $38 000</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 6}}>Délai : 4 à 8 semaines</div></div>
              <div><span className="tag ti">Seuil de fans</span><div style={{marginTop: 6}}>380 k sur 400 k requis</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 6}}>Loyers et salaires élevés</div></div>
            </div>
            <div className="mt" style={{marginTop: 14}}><i style={{width: '95%'}} /></div>
            <a href="Equipe.dc.html" className="btn s" style={{marginTop: 14, width: '100%'}}>Fans insuffisants : encore 20 k</a>
          </div>
        </div>
      </div>
    </div>
  )
}
