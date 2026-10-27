// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Decouverte.dc.html).
import Hud from '../../components/Hud'

export default function Decouverte() {
  return (
    <div className="scr">
      <nav className="dock" aria-label="Navigation du jeu">
        <div className="lg">LE</div>
        <a className="dk" href="Hub.dc.html" aria-label="Monde"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>Monde</a>
        <a className="dk on" href="Artistes.dc.html" aria-label="Artistes"><svg viewBox="0 0 24 24"><circle cx={9} cy={8} r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17.5" cy={9} r="2.5" /><path d="M17 14.2c2.4.3 4 2.2 4 5.3" /></svg>Artistes</a>
        <a className="dk" href="Ecriture.dc.html" aria-label="Studio"><svg viewBox="0 0 24 24"><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>Studio</a>
        <a className="dk" href="Sortie.dc.html" aria-label="Sorties"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><circle cx={12} cy={12} r={3} /></svg>Sorties</a>
        <a className="dk" href="Classements.dc.html" aria-label="Classem."><svg viewBox="0 0 24 24"><path d="M5 20v-6M12 20V5M19 20v-10" /></svg>Classem.</a>
        <a className="dk" href="Tournee.dc.html" aria-label="Tournées"><svg viewBox="0 0 24 24"><path d="M3 13l18-9-6 17-3-7-9-1z" /></svg>Tournées</a>
        <a className="dk" href="Equipe.dc.html" aria-label="Équipe"><svg viewBox="0 0 24 24"><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M9 7V5h6v2M3 13h18" /></svg>Équipe</a>
        <a className="dk" href="Finances.dc.html" aria-label="Finances"><svg viewBox="0 0 24 24"><path d="M3 7h16a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2V7zM3 7l2-3h12M16 14h2" /></svg>Finances</a>
      </nav>
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 850, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{position: 'relative', height: 150, borderRadius: 16, overflow: 'hidden', background: 'radial-gradient(500px 200px at 20% 120%, rgba(255,61,154,0.55), transparent), radial-gradient(500px 220px at 85% -20%, rgba(53,211,240,0.4), transparent), linear-gradient(135deg,#2A1B4D,#150C2A)'}}>
            <div className="map" style={{position: 'absolute', inset: 0, opacity: '0.35'}}><div className="mk c" style={{left: '50.9%', top: '46.4%'}} /><div className="mk c" style={{left: '48.9%', top: '47.1%'}} /><div className="mk c" style={{left: '57.8%', top: '64.4%'}} /></div>
            <div style={{position: 'absolute', left: 24, bottom: 18}}><div className="lbl">Scouting · Afrique de l'Ouest et du Sud</div><h1 className="h1" style={{fontSize: 40}}>Découvrir un artiste</h1></div>
            <div style={{position: 'absolute', right: 20, top: 16, display: 'flex', gap: 8}}><span className="tag ti">Éclaireuse : Adjoua Koffi ★★</span><span className="tag tg">34 artistes repérés</span></div>
          </div>
          <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}><span className="chip on">Tous les pays</span><span className="chip">Côte d'Ivoire</span><span className="chip">Nigeria</span><span className="chip">Ghana</span><span className="chip">Afrique du Sud</span><span className="chip">Tous les genres</span><span className="chip">Potentiel ★★★★+</span><span className="chip">Disponibles</span></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}><a href="Profil.dc.html" className="pn sel" style={{display: 'grid', gridTemplateColumns: '64px 1fr 110px 90px 90px 110px', gap: 14, alignItems: 'center', padding: '12px 18px'}}><div className="av" style={{width: 56, height: 56, fontSize: 20, background: 'linear-gradient(135deg,#35D3F0,#8B5CF6)'}}>ZG</div><div><b style={{fontSize: 17}}>Zola Gold</b><div className="mut" style={{fontSize: 13}}>Johannesburg, Afrique du Sud · Amapiano</div></div><span style={{color: '#FFC63D'}}>★★★★☆</span><span><b>380 k</b><div className="mut" style={{fontSize: 12}}>fans</div></span><b>$18 000</b><span className="tag tg">Disponible</span></a><a href="Profil.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '64px 1fr 110px 90px 90px 110px', gap: 14, alignItems: 'center', padding: '12px 18px'}}><div className="av" style={{width: 56, height: 56, fontSize: 20, background: 'linear-gradient(135deg,#FF3D9A,#FFC63D)'}}>AN</div><div><b style={{fontSize: 17}}>Aïcha Nova</b><div className="mut" style={{fontSize: 13}}>Bamako, Mali · Afro-pop</div></div><span style={{color: '#FFC63D'}}>★★★☆☆</span><span><b>210 k</b><div className="mut" style={{fontSize: 12}}>fans</div></span><b>$9 000</b><span className="tag tg">Disponible</span></a><a href="Profil.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '64px 1fr 110px 90px 90px 110px', gap: 14, alignItems: 'center', padding: '12px 18px'}}><div className="av" style={{width: 56, height: 56, fontSize: 20, background: 'linear-gradient(135deg,#8B5CF6,#FF5470)'}}>BK</div><div><b style={{fontSize: 17}}>Boa Kwame</b><div className="mut" style={{fontSize: 13}}>Accra, Ghana · Hip-hop</div></div><span style={{color: '#FFC63D'}}>★★★★☆</span><span><b>520 k</b><div className="mut" style={{fontSize: 12}}>fans</div></span><b>$26 000</b><span className="tag te">Concours</span></a><a href="Profil.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '64px 1fr 110px 90px 90px 110px', gap: 14, alignItems: 'center', padding: '12px 18px'}}><div className="av" style={{width: 56, height: 56, fontSize: 20, background: 'linear-gradient(135deg,#FFC63D,#FF3D9A)'}}>AL</div><div><b style={{fontSize: 17}}>Adé Luna</b><div className="mut" style={{fontSize: 13}}>Lagos, Nigeria · R&amp;B</div></div><span style={{color: '#FFC63D'}}>★★★★★</span><span><b>1,1 M</b><div className="mut" style={{fontSize: 12}}>fans</div></span><b>$60 000</b><span className="tag tr_">Concurrence</span></a><a href="Profil.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '64px 1fr 110px 90px 90px 110px', gap: 14, alignItems: 'center', padding: '12px 18px'}}><div className="av" style={{width: 56, height: 56, fontSize: 20, background: 'linear-gradient(135deg,#3DDC97,#35D3F0)'}}>MD</div><div><b style={{fontSize: 17}}>Mouss Diamant</b><div className="mut" style={{fontSize: 13}}>Dakar, Sénégal · Mbalax</div></div><span style={{color: '#FFC63D'}}>★★★☆☆</span><span><b>150 k</b><div className="mut" style={{fontSize: 12}}>fans</div></span><b>$7 500</b><span className="tag tg">Disponible</span></a><a href="Profil.dc.html" className="pn" style={{display: 'grid', gridTemplateColumns: '64px 1fr 110px 90px 90px 110px', gap: 14, alignItems: 'center', padding: '12px 18px'}}><div className="av" style={{width: 56, height: 56, fontSize: 20, background: 'linear-gradient(135deg,#FF5470,#8B5CF6)'}}>YF</div><div><b style={{fontSize: 17}}>Yara Fogo</b><div className="mut" style={{fontSize: 13}}>Luanda, Angola · Kuduro</div></div><span style={{color: '#FFC63D'}}>★★★☆☆</span><span><b>260 k</b><div className="mut" style={{fontSize: 12}}>fans</div></span><b>$11 000</b><span className="tag te">Concours</span></a></div>
          <div className="mut" style={{fontSize: 13}}>Cliquez sur un artiste pour ouvrir son profil complet et ses coordonnées.</div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div className="pn cut sel">
            <span className="tag te">Nouveau</span>
            <div className="h2" style={{marginTop: 10, fontSize: 28}}>Concours de talents</div>
            <p className="mut" style={{margin: '8px 0 14px'}}>Organisez une audition publique dans un pays. Les meilleurs candidats vous sont présentés, avant la concurrence.</p>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 6}}>Dès $6 000</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 6}}>40 à 120 candidats</div></div>
              <div><span className="tag ti">Incertain</span><div style={{marginTop: 6}}>Qualité des finalistes</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 6}}>Rival sur le même pays</div></div>
            </div>
            <a href="Concours.dc.html" className="btn" style={{marginTop: 16, width: '100%'}}>Organiser un concours</a>
          </div>
          <div className="pn">
            <div className="lbl">Concours en cours</div>
            <div className="row" style={{gridTemplateColumns: '1fr 90px'}}><div><b>Révélation Accra</b><div className="mut" style={{fontSize: 13}}>Finale dans 2 semaines</div></div><span className="tag te">86 candidats</span></div>
            <div className="row" style={{gridTemplateColumns: '1fr 90px'}}><div><b>Nuit de Luanda</b><div className="mut" style={{fontSize: 13}}>Inscriptions ouvertes</div></div><span className="tag ti">31 candidats</span></div>
          </div>
          <div className="sp" />
          <a href="Artistes.dc.html" className="btn s">Retour à mes artistes</a>
        </div>
      </div>
    </div>
  )
}
