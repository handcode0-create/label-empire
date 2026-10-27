// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Pays.dc.html).
import Hud from '../../components/Hud'

export default function Pays() {
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
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#B3A6D9'}}>
          <a href="Hub.dc.html" className="chip">Monde</a><span>›</span><a href="Hub.dc.html" className="chip">Afrique</a><span>›</span><span className="chip on">Nigeria</span>
        </div>
        <div style={{display: 'flex', gap: 20, marginTop: 16}}>
          <div style={{width: 800}}>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 16}}>
              <h1 className="h1" style={{fontSize: 52}}>Nigeria</h1>
              <span className="tag tc" style={{marginBottom: 10}}>Partenaire de distribution</span>
            </div>
            <div className="mut" style={{marginTop: 4, fontSize: 14}}>Afrique de l'Ouest · anglais, yoruba, igbo, haoussa · devise locale : naira</div>
            <div className="lbl" style={{marginTop: 22}}>Fiche du marché</div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 10}}>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Audience</div><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><span className="ab a">A</span><span className="mut" style={{fontSize: 13}}>Très vaste</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Pouvoir d'achat</div><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><span className="ab c">C</span><span className="mut" style={{fontSize: 13}}>Modéré</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Streaming</div><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><span className="ab c">C</span><span className="mut" style={{fontSize: 13}}>En croissance</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Piratage</div><div style={{marginTop: 8}}><span className="tag tr_">Fort</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Langues</div><div style={{marginTop: 8, fontWeight: 700}}>4</div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Genres dominants</div><div style={{marginTop: 8, fontSize: 14, fontWeight: 700}}>Afrobeats, hip-hop</div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Ouverture</div><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><span className="ab b">B</span><span className="mut" style={{fontSize: 13}}>Accueille l'import</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><div className="lbl">Coûts et règles</div><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><span className="ab b">B</span><span className="mut" style={{fontSize: 13}}>Taxes moyennes</span></div></div>
            </div>
            <div className="pn" style={{marginTop: 18}}>
              <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Affinité avec votre catalogue</span><span className="sp" /><span className="mut" style={{fontSize: 13}}>de 0,2 à 1,5</span></div>
              <div style={{display: 'grid', gridTemplateColumns: '120px 1fr 48px', gap: '12px 14px', alignItems: 'center', marginTop: 14}}>
                <span>Afrobeats</span><div className="mt gr"><i style={{width: '93%'}} /></div><b>1,4</b>
                <span>Hip-hop</span><div className="mt cy"><i style={{width: '60%'}} /></div><b>0,9</b>
                <span>Coupé-décalé</span><div className="mt gd"><i style={{width: '40%'}} /></div><b>0,6</b>
                <span>R&amp;B</span><div className="mt rd"><i style={{width: '32%'}} /></div><b>0,5</b>
              </div>
            </div>
          </div>
          <div style={{width: 456, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn cut">
              <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Villes et scènes</span><span className="sp" /><span className="lbl">Fans : 310 k</span></div>
              <div style={{marginTop: 6}}>
                <div className="row" style={{gridTemplateColumns: '1fr 120px 70px'}}><div><b>Lagos</b><div className="mut" style={{fontSize: 13}}>4 studios · 8 salles</div></div><div className="mt gr"><i style={{width: '90%'}} /></div><span className="tag tg">Grand public</span></div>
                <div className="row" style={{gridTemplateColumns: '1fr 120px 70px'}}><div><b>Abuja</b><div className="mut" style={{fontSize: 13}}>2 studios · 3 salles</div></div><div className="mt cy"><i style={{width: '55%'}} /></div><span className="tag tc">Émergente</span></div>
                <div className="row" style={{gridTemplateColumns: '1fr 120px 70px'}}><div><b>Port Harcourt</b><div className="mut" style={{fontSize: 13}}>1 studio · 2 salles</div></div><div className="mt gd"><i style={{width: '30%'}} /></div><span className="tag te">Underground</span></div>
              </div>
            </div>
            <div className="pn">
              <div className="lbl">Classement du pays</div>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6}}><span className="num" style={{color: '#FF7DBB'}}>n°38</span><span className="mut" style={{fontSize: 14}}>« Soleil d'Abidjan » · Top 100 des singles</span></div>
            </div>
            <div className="pn" style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              <div className="lbl">Actions possibles</div>
              <a href="Equipe.dc.html" className="btn s" style={{justifyContent: 'space-between', height: 48, fontSize: 17}}>Représentant local <span style={{fontSize: 14, letterSpacing: 0, textTransform: 'none', color: '#FFC63D'}}>$4 200 / mois</span></a>
              <a href="Sortie.dc.html" className="btn s" style={{justifyContent: 'space-between', height: 48, fontSize: 17}}>Sortie locale <span style={{fontSize: 14, letterSpacing: 0, textTransform: 'none'}} className="mut">version anglaise conseillée</span></a>
              <a href="Tournee.dc.html" className="btn" style={{height: 52}}>Planifier une tournée</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
