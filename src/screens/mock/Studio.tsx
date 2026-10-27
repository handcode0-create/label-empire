// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Studio.dc.html).
import Hud from '../../components/Hud'

export default function Studio() {
  return (
    <div className="scr">
      <nav className="dock" aria-label="Navigation du jeu">
        <div className="lg">LE</div>
        <a className="dk" href="Hub.dc.html" aria-label="Monde"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>Monde</a>
        <a className="dk" href="Artistes.dc.html" aria-label="Artistes"><svg viewBox="0 0 24 24"><circle cx={9} cy={8} r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17.5" cy={9} r="2.5" /><path d="M17 14.2c2.4.3 4 2.2 4 5.3" /></svg>Artistes</a>
        <a className="dk on" href="Ecriture.dc.html" aria-label="Studio"><svg viewBox="0 0 24 24"><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>Studio</a>
        <a className="dk" href="Sortie.dc.html" aria-label="Sorties"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><circle cx={12} cy={12} r={3} /></svg>Sorties</a>
        <a className="dk" href="Classements.dc.html" aria-label="Classem."><svg viewBox="0 0 24 24"><path d="M5 20v-6M12 20V5M19 20v-10" /></svg>Classem.</a>
        <a className="dk" href="Tournee.dc.html" aria-label="Tournées"><svg viewBox="0 0 24 24"><path d="M3 13l18-9-6 17-3-7-9-1z" /></svg>Tournées</a>
        <a className="dk" href="Equipe.dc.html" aria-label="Équipe"><svg viewBox="0 0 24 24"><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M9 7V5h6v2M3 13h18" /></svg>Équipe</a>
        <a className="dk" href="Finances.dc.html" aria-label="Finances"><svg viewBox="0 0 24 24"><path d="M3 7h16a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2V7zM3 7l2-3h12M16 14h2" /></svg>Finances</a>
      </nav>
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 780, display: 'flex', flexDirection: 'column', gap: 10}}>
          <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}><span className="chip">1 Écrire</span><span className="chip on">2 Enregistrer</span><span className="chip">3 Mixer</span><span className="chip">4 Sortir</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><h1 className="h1" style={{fontSize: 36}}>Choisir le studio</h1><span className="sp" /><span className="tag ti">« Soleil d'Abidjan » · Kozen</span></div>
          <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}><span className="chip on">Tous les continents</span><span className="chip">Afrique</span><span className="chip">Europe</span><span className="chip">Amérique</span><span className="chip">Asie</span><span className="chip">Trié par qualité</span><span className="chip">Budget max $2 000</span></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}><a href="Studio.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '1fr 100px 70px 70px 100px', gap: 12, alignItems: 'center', padding: '9px 16px'}}><div><b>Studio Ébène</b><div className="mut" style={{fontSize: 13}}>Abidjan, Côte d'Ivoire</div></div><span style={{color: '#FFC63D'}}>★★</span><b>$420/j</b><span className="num" style={{fontSize: 22, color: '#35D3F0'}}>62</span><span className="tag tg">Disponible</span></a><a href="Studio.dc.html" className="pn sel" style={{display: 'grid', gridTemplateColumns: '1fr 100px 70px 70px 100px', gap: 12, alignItems: 'center', padding: '9px 16px'}}><div><b>Eko Sound Lab</b><div className="mut" style={{fontSize: 13}}>Lagos, Nigeria</div></div><span style={{color: '#FFC63D'}}>★★★</span><b>$900/j</b><span className="num" style={{fontSize: 22, color: '#35D3F0'}}>74</span><span className="tag tg">Disponible</span></a><a href="Studio.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '1fr 100px 70px 70px 100px', gap: 12, alignItems: 'center', padding: '9px 16px'}}><div><b>Maison Rivoli</b><div className="mut" style={{fontSize: 13}}>Paris, France</div></div><span style={{color: '#FFC63D'}}>★★★★</span><b>$1 800/j</b><span className="num" style={{fontSize: 22, color: '#35D3F0'}}>83</span><span className="tag te">Dans 2 sem.</span></a><a href="Studio.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '1fr 100px 70px 70px 100px', gap: 12, alignItems: 'center', padding: '9px 16px'}}><div><b>Sunset Rec</b><div className="mut" style={{fontSize: 13}}>Los Angeles, États-Unis</div></div><span style={{color: '#FFC63D'}}>★★★★★</span><b>$3 200/j</b><span className="num" style={{fontSize: 22, color: '#35D3F0'}}>92</span><span className="tag te">Dans 5 sem.</span></a><a href="Studio.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '1fr 100px 70px 70px 100px', gap: 12, alignItems: 'center', padding: '9px 16px'}}><div><b>Joburg Tapes</b><div className="mut" style={{fontSize: 13}}>Johannesburg, Afrique du Sud</div></div><span style={{color: '#FFC63D'}}>★★★</span><b>$1 100/j</b><span className="num" style={{fontSize: 22, color: '#35D3F0'}}>78</span><span className="tag tg">Disponible</span></a><a href="Studio.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '1fr 100px 70px 70px 100px', gap: 12, alignItems: 'center', padding: '9px 16px'}}><div><b>Cairo Vox</b><div className="mut" style={{fontSize: 13}}>Le Caire, Égypte</div></div><span style={{color: '#FFC63D'}}>★★★</span><b>$700/j</b><span className="num" style={{fontSize: 22, color: '#35D3F0'}}>70</span><span className="tag tr_">Complet</span></a><a href="Studio.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '1fr 100px 70px 70px 100px', gap: 12, alignItems: 'center', padding: '9px 16px'}}><div><b>Han River Studio</b><div className="mut" style={{fontSize: 13}}>Séoul, Corée du Sud</div></div><span style={{color: '#FFC63D'}}>★★★★</span><b>$2 400/j</b><span className="num" style={{fontSize: 22, color: '#35D3F0'}}>88</span><span className="tag tg">Disponible</span></a><a href="Studio.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '1fr 100px 70px 70px 100px', gap: 12, alignItems: 'center', padding: '9px 16px'}}><div><b>Mix Lab Dakar</b><div className="mut" style={{fontSize: 13}}>Dakar, Sénégal</div></div><span style={{color: '#FFC63D'}}>★★</span><b>$520/j</b><span className="num" style={{fontSize: 22, color: '#35D3F0'}}>66</span><span className="tag tg">Disponible</span></a></div>
          <div className="mut" style={{fontSize: 13}}>8 studios sur 47 affichés. Les studios loin de l'artiste ajoutent voyage, visa et fatigue.</div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div className="map" style={{height: 190, position: 'relative'}}><div className="mk g" style={{left: '48.9%', top: '47.1%'}} /><div className="mk c" style={{left: '50.9%', top: '46.4%'}} /><div className="mk g" style={{left: '50.6%', top: '22.8%'}} /><div className="mk g" style={{left: '17.2%', top: '31.1%'}} /><div className="mk g" style={{left: '57.8%', top: '64.4%'}} /><div className="mk g" style={{left: '55.5%', top: '33%'}} /><div className="mk g" style={{left: '85.3%', top: '29.2%'}} /><div className="mk g" style={{left: '44.5%', top: '41%'}} /></div>
          <div className="pn cut sel">
            <div style={{display: 'flex', alignItems: 'baseline'}}><span className="h2" style={{fontSize: 28}}>Eko Sound Lab</span><span className="sp" /><span className="mut">Lagos</span></div>
            <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}><span className="tag ti">Afrobeats</span><span className="tag ti">R&amp;B</span><span className="tag te">Producteur : Tayo Bello ★★★★</span></div>
            <div className="lbl" style={{marginTop: 12}}>Durée de session</div>
            <div style={{display: 'flex', gap: 8, marginTop: 8}}><span className="chip">2 jours</span><span className="chip on">4 jours</span><span className="chip">1 semaine</span></div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 4}}>Studio $3 600 · voyage $420</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 4}}>Qualité de prise 74 à 78</div></div>
              <div><span className="tag ti">Incertain</span><div style={{marginTop: 4}}>Alchimie avec Tayo Bello</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 4}}>Fatigue +12 après le voyage</div></div>
            </div>
          </div>
          <div className="sp" />
          <div style={{display: 'flex', gap: 12}}><a href="Ecriture.dc.html" className="btn s">Retour</a><a href="Mixage.dc.html" className="btn" style={{flex: 1, height: 60}}>Lancer l'enregistrement</a></div>
        </div>
      </div>
    </div>
  )
}
