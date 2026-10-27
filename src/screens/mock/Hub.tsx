// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Hub.dc.html).
export default function Hub() {
  return (
    <div className="scr">
      <nav className="dock" aria-label="Navigation du jeu">
        <div className="lg">LE</div>
        <a className="dk on" href="Hub.dc.html" aria-label="Monde"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>Monde</a>
        <a className="dk" href="Artistes.dc.html" aria-label="Artistes"><svg viewBox="0 0 24 24"><circle cx={9} cy={8} r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17.5" cy={9} r="2.5" /><path d="M17 14.2c2.4.3 4 2.2 4 5.3" /></svg>Artistes</a>
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
        <div className="pn" style={{width: 900, padding: 0, position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 20, top: 18, display: 'flex', gap: 8, alignItems: 'center'}}>
            <span className="chip on">Monde</span><span className="chip">Afrique</span><span className="chip">Europe</span><span className="chip">Amérique du Nord</span><span className="chip">Asie</span>
          </div>
          <div className="map" style={{position: 'absolute', left: 0, top: 76, width: 900, height: 450}}>
            <div className="mk g" style={{left: '48.9%', top: '47.1%'}} /><div className="mn" style={{left: '48.9%', top: '51%', color: '#FFC63D'}}>Abidjan · siège</div>
            <div className="mk c" style={{left: '50.9%', top: '46.4%'}} /><div className="mn" style={{left: '51%', top: '42%'}}>Lagos</div>
            <div className="mk c" style={{left: '50.6%', top: '22.8%'}} /><div className="mn" style={{left: '50.6%', top: '22.8%'}}>Paris</div>
            <div className="mk" style={{left: '50%', top: '21.4%'}} /><div className="mn" style={{left: '46%', top: '17%'}}>Londres</div>
            <div className="mk" style={{left: '29.4%', top: '27.4%'}} /><div className="mn" style={{left: '29.4%', top: '27.4%'}}>New York</div>
            <div className="mk c" style={{left: '57.8%', top: '64.4%'}} /><div className="mn" style={{left: '57.8%', top: '64.4%'}}>Johannesburg</div>
            <div className="mk" style={{left: '65.4%', top: '36%'}} /><div className="mn" style={{left: '65.4%', top: '36%'}}>Dubaï</div>
            <div className="mk d" style={{left: '37.1%', top: '63.1%'}} /><div className="mn" style={{left: '37.1%', top: '63.1%', color: '#9C90CC'}}>São Paulo</div>
            <div className="mk d" style={{left: '85.3%', top: '29.2%'}} /><div className="mn" style={{left: '85.3%', top: '29.2%', color: '#9C90CC'}}>Séoul</div>
            <div className="mk d" style={{left: '70.2%', top: '39.4%'}} /><div className="mn" style={{left: '70.2%', top: '44%', color: '#9C90CC'}}>Mumbai</div>
            <div className="mk d" style={{left: '91.9%', top: '68.8%'}} /><div className="mn" style={{left: '91.9%', top: '68.8%', color: '#9C90CC'}}>Sydney</div>
          </div>
          <div style={{position: 'absolute', left: 20, bottom: 16, right: 20, display: 'flex', gap: 22, fontSize: 13, color: '#B3A6D9', alignItems: 'center'}}>
            <span><i className="mk g" style={{position: 'static', display: 'inline-block', verticalAlign: '-3px', margin: '0 8px 0 0'}} />Siège / bureau</span>
            <span><i className="mk c" style={{position: 'static', display: 'inline-block', verticalAlign: '-3px', margin: '0 8px 0 0'}} />Partenaire local</span>
            <span><i className="mk" style={{position: 'static', display: 'inline-block', verticalAlign: '-3px', margin: '0 8px 0 0'}} />Fans présents</span>
            <span><i className="mk d" style={{position: 'static', display: 'inline-block', verticalAlign: '-1px', margin: '0 8px 0 0'}} />Verrouillé · réputation requise</span>
          </div>
          <div style={{position: 'absolute', left: 20, right: 20, top: 548, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12}}>
            <div><div className="lbl">Afrique</div><div className="disp" style={{fontSize: 22}}>1,9 M</div><div className="mt" style={{marginTop: 6}}><i style={{width: '82%'}} /></div></div>
            <div><div className="lbl">Europe</div><div className="disp" style={{fontSize: 22}}>380 k</div><div className="mt" style={{marginTop: 6}}><i style={{width: '24%'}} /></div></div>
            <div><div className="lbl">Amér. Nord</div><div className="disp" style={{fontSize: 22}}>92 k</div><div className="mt" style={{marginTop: 6}}><i style={{width: '8%'}} /></div></div>
            <div><div className="lbl">Amér. latine</div><div className="disp" style={{fontSize: 22}}>0</div><div className="mt" style={{marginTop: 6}}><i style={{width: '0%'}} /></div></div>
            <div><div className="lbl">Asie</div><div className="disp" style={{fontSize: 22}}>41 k</div><div className="mt" style={{marginTop: 6}}><i style={{width: '4%'}} /></div></div>
            <div><div className="lbl">Océanie</div><div className="disp" style={{fontSize: 22}}>0</div><div className="mt" style={{marginTop: 6}}><i style={{width: '0%'}} /></div></div>
          </div>
          <div style={{position: 'absolute', left: 20, right: 20, bottom: 56, fontSize: 13, color: '#9C90CC'}}>Fans du label par continent. Cliquez un continent pour zoomer, puis un pays pour ouvrir sa fiche.</div>
        </div>
        <div style={{width: 376, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div className="pn cut" style={{paddingBottom: 8}}>
            <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Cette semaine</span><span className="sp" /><span className="tag ti">3 événements</span></div>
            <div style={{marginTop: 8}}>
              <div className="row" style={{gridTemplateColumns: '48px 1fr auto'}}><span className="lbl">Mar</span><div><b>Sortie du single</b><div className="mut" style={{fontSize: 13}}>« Soleil d'Abidjan » · Afrique de l'Ouest</div></div><span className="tag tg">Prêt</span></div>
              <div className="row" style={{gridTemplateColumns: '48px 1fr auto'}}><span className="lbl">Jeu</span><div><b>Concert à Lagos</b><div className="mut" style={{fontSize: 13}}>Kozen · salle 800 places</div></div><span className="tag te">Visa en cours</span></div>
              <div className="row" style={{gridTemplateColumns: '48px 1fr auto'}}><span className="lbl">Ven</span><div><b>Contrat à négocier</b><div className="mut" style={{fontSize: 13}}>Zola Gold · Johannesburg</div></div><a href="Contrat.dc.html" className="tag tc">Ouvrir</a></div>
            </div>
          </div>
          <div className="pn">
            <div className="lbl">Trésorerie projetée sur 8 semaines</div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: 6}}>
              <div className="num" style={{color: '#FFC63D'}}>$142 000</div><span className="up" style={{fontSize: 14, paddingBottom: 4}}>+11 %</span>
            </div>
            <svg viewBox="0 0 320 70" width="100%" height={70} style={{marginTop: 8}} role="img" aria-label="Courbe de trésorerie projetée en hausse">
              <defs><linearGradient id="fa" x1={0} y1={0} x2={0} y2={1}><stop offset={0} stopColor="#FFC63D" stopOpacity="0.35" /><stop offset={1} stopColor="#FFC63D" stopOpacity={0} /></linearGradient></defs>
              <path d="M0 52 L46 48 L92 50 L138 40 L184 34 L230 30 L276 20 L320 14 L320 70 L0 70Z" fill="url(#fa)" />
              <path d="M0 52 L46 48 L92 50 L138 40 L184 34 L230 30 L276 20 L320 14" fill="none" stroke="#FFC63D" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="pn">
            <div className="lbl">Alertes</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10, fontSize: 14}}>
              <div style={{display: 'flex', gap: 10, alignItems: 'center'}}><span className="tag tr_">Risque</span>Moral de Nia Ora à 31</div>
              <div style={{display: 'flex', gap: 10, alignItems: 'center'}}><span className="tag te">Info</span>Un rival sort un titre à Paris mardi</div>
            </div>
          </div>
          <div className="sp" />
          <a href="Rapport.dc.html" className="btn" style={{height: 64, fontSize: 24}}>Valider la semaine</a>
        </div>
      </div>
    </div>
  )
}
