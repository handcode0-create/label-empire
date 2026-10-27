// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Classements.dc.html).
import Hud from '../../components/Hud'

export default function Classements() {
  return (
    <div className="scr">
      <nav className="dock" aria-label="Navigation du jeu">
        <div className="lg">LE</div>
        <a className="dk" href="Hub.dc.html" aria-label="Monde"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>Monde</a>
        <a className="dk" href="Artistes.dc.html" aria-label="Artistes"><svg viewBox="0 0 24 24"><circle cx={9} cy={8} r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17.5" cy={9} r="2.5" /><path d="M17 14.2c2.4.3 4 2.2 4 5.3" /></svg>Artistes</a>
        <a className="dk" href="Studio.dc.html" aria-label="Studio"><svg viewBox="0 0 24 24"><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>Studio</a>
        <a className="dk" href="Sortie.dc.html" aria-label="Sorties"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><circle cx={12} cy={12} r={3} /></svg>Sorties</a>
        <a className="dk on" href="Classements.dc.html" aria-label="Classements"><svg viewBox="0 0 24 24"><path d="M5 20v-6M12 20V5M19 20v-10" /></svg>Classem.</a>
        <a className="dk" href="Tournee.dc.html" aria-label="Tournées"><svg viewBox="0 0 24 24"><path d="M3 13l18-9-6 17-3-7-9-1z" /></svg>Tournées</a>
        <a className="dk" href="Equipe.dc.html" aria-label="Équipe"><svg viewBox="0 0 24 24"><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M9 7V5h6v2M3 13h18" /></svg>Équipe</a>
        <a className="dk" href="Finances.dc.html" aria-label="Finances"><svg viewBox="0 0 24 24"><path d="M3 7h16a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2V7zM3 7l2-3h12M16 14h2" /></svg>Finances</a>
      </nav>
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <h1 className="h1">Classements</h1>
          <div style={{display: 'flex', gap: 8}}><span className="chip">Ville</span><span className="chip on">Pays</span><span className="chip">Continent</span><span className="chip">Monde</span></div>
          <div className="sp" />
          <span className="chip">Côte d'Ivoire ▾</span><span className="chip">Top 100 singles ▾</span>
        </div>
        <div style={{display: 'flex', gap: 20, marginTop: 16}}>
          <div className="pn cut" style={{width: 880, paddingBottom: 8}}>
            <div className="row th" style={{gridTemplateColumns: '50px 1fr 200px 110px 70px', paddingTop: 0}}><span>Rang</span><span>Titre</span><span>Label</span><span>Écoutes</span><span>Évol.</span></div>
            <div className="row" style={{gridTemplateColumns: '50px 1fr 200px 110px 70px'}}><span className="disp" style={{fontSize: 24}}>1</span><div><b>Nuit de Plateau</b><div className="mut" style={{fontSize: 13}}>Dama Keita</div></div><span className="mut">Meridian Group</span><b>1,9 M</b><span className="up">+1</span></div>
            <div className="row" style={{gridTemplateColumns: '50px 1fr 200px 110px 70px'}}><span className="disp" style={{fontSize: 24}}>2</span><div><b>Marcory Sunset</b><div className="mut" style={{fontSize: 13}}>Sika Ouattara</div></div><span className="mut">Harmattan Music</span><b>1,6 M</b><span className="dn">−1</span></div>
            <div className="row" style={{gridTemplateColumns: '50px 1fr 200px 110px 70px', background: 'rgba(255,61,154,0.12)', borderRadius: 8, boxShadow: 'inset 0 0 0 1px var(--mag)'}}><span className="disp" style={{fontSize: 24, color: '#FF7DBB'}}>3</span><div><b>Soleil d'Abidjan</b><div className="mut" style={{fontSize: 13}}>Kozen</div></div><b style={{color: '#FF7DBB'}}>Savane Records</b><b>1,4 M</b><span className="up">+5</span></div>
            <div className="row" style={{gridTemplateColumns: '50px 1fr 200px 110px 70px'}}><span className="disp" style={{fontSize: 24}}>4</span><div><b>Ndjamena Flow</b><div className="mut" style={{fontSize: 13}}>Brice Tamba</div></div><span className="mut">Atlas Sound</span><b>1,2 M</b><span className="up">+2</span></div>
            <div className="row" style={{gridTemplateColumns: '50px 1fr 200px 110px 70px'}}><span className="disp" style={{fontSize: 24}}>5</span><div><b>Lagune</b><div className="mut" style={{fontSize: 13}}>Awa Diallo</div></div><span className="mut">Vox Nova</span><b>1,1 M</b><span className="dn">−2</span></div>
            <div className="row" style={{gridTemplateColumns: '50px 1fr 200px 110px 70px'}}><span className="disp" style={{fontSize: 24}}>6</span><div><b>Route de Bassam</b><div className="mut" style={{fontSize: 13}}>Yao Kassi</div></div><span className="mut">Harmattan Music</span><b>980 k</b><span className="up">+1</span></div>
            <div className="row" style={{gridTemplateColumns: '50px 1fr 200px 110px 70px'}}><span className="disp" style={{fontSize: 24}}>7</span><div><b>Plateau 2000</b><div className="mut" style={{fontSize: 13}}>Mia Soro</div></div><span className="mut">Meridian Group</span><b>910 k</b><span className="dn">−1</span></div>
            <div className="row" style={{gridTemplateColumns: '50px 1fr 200px 110px 70px'}}><span className="disp" style={{fontSize: 24}}>8</span><div><b>Quartier Haut</b><div className="mut" style={{fontSize: 13}}>Lucas Bamba</div></div><span className="mut">Atlas Sound</span><b>860 k</b><span className="mut">=</span></div>
          </div>
          <div style={{width: 420, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn">
              <div className="lbl">Vos positions cette semaine</div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12}}>
                <div><div className="mut" style={{fontSize: 13}}>Côte d'Ivoire</div><div className="num" style={{color: '#FF7DBB'}}>n°3</div></div>
                <div><div className="mut" style={{fontSize: 13}}>Afrique, top 50</div><div className="num" style={{color: '#35D3F0'}}>n°21</div></div>
                <div><div className="mut" style={{fontSize: 13}}>Nigeria</div><div className="num">n°38</div></div>
                <div><div className="mut" style={{fontSize: 13}}>Monde, top 100</div><div className="num" style={{color: '#9C90CC'}}>hors</div></div>
              </div>
            </div>
            <div className="pn">
              <div className="lbl">Diffusion du titre</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, fontSize: 14}}>
                <div style={{display: 'grid', gridTemplateColumns: '110px 1fr 56px', gap: 10, alignItems: 'center'}}><span>Côte d'Ivoire</span><div className="mt"><i style={{width: '100%'}} /></div><b>690 k</b></div>
                <div style={{display: 'grid', gridTemplateColumns: '110px 1fr 56px', gap: 10, alignItems: 'center'}}><span>Sénégal</span><div className="mt"><i style={{width: '46%'}} /></div><b>320 k</b></div>
                <div style={{display: 'grid', gridTemplateColumns: '110px 1fr 56px', gap: 10, alignItems: 'center'}}><span>France</span><div className="mt"><i style={{width: '28%'}} /></div><b>190 k</b></div>
                <div style={{display: 'grid', gridTemplateColumns: '110px 1fr 56px', gap: 10, alignItems: 'center'}}><span>Nigeria</span><div className="mt"><i style={{width: '14%'}} /></div><b>95 k</b></div>
              </div>
              <div className="tag te" style={{marginTop: 14}}>Effet de région : 3 pays voisins sur 4 atteints</div>
            </div>
            <div className="pn">
              <div className="lbl">Genres dominants du pays</div>
              <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}><span className="tag tg">1 Coupé-décalé</span><span className="tag tc">2 Afro-pop</span><span className="tag ti">3 Hip-hop</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
