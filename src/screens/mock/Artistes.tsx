// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Artistes.dc.html).
import Hud from '../../components/Hud'

export default function Artistes() {
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
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 430, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{display: 'flex', alignItems: 'center'}}><h1 className="h1">Mes artistes</h1><span className="sp" /><span className="tag ti">3 sur 5 places</span></div>
          <div className="pn sel" style={{display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px'}}>
            <div className="av" style={{width: 56, height: 56, fontSize: 22, background: 'linear-gradient(135deg,#FF3D9A,#8B5CF6)'}}>KZ</div>
            <div style={{flex: 1}}><b style={{fontSize: 17}}>Kozen</b><div className="mut" style={{fontSize: 13}}>Abidjan · afro-pop, coupé-décalé</div><div className="mt gr" style={{marginTop: 8}}><i style={{width: '78%'}} /></div></div>
            <span className="tag tg">Moral 78</span>
          </div>
          <div className="pn" style={{display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px'}}>
            <div className="av" style={{width: 56, height: 56, fontSize: 22, background: 'linear-gradient(135deg,#35D3F0,#8B5CF6)'}}>NO</div>
            <div style={{flex: 1}}><b style={{fontSize: 17}}>Nia Ora</b><div className="mut" style={{fontSize: 13}}>Lagos · afrobeats, R&amp;B</div><div className="mt rd" style={{marginTop: 8}}><i style={{width: '31%'}} /></div></div>
            <span className="tag tr_">Moral 31</span>
          </div>
          <div className="pn" style={{display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px'}}>
            <div className="av" style={{width: 56, height: 56, fontSize: 22, background: 'linear-gradient(135deg,#FFC63D,#FF3D9A)'}}>LM</div>
            <div style={{flex: 1}}><b style={{fontSize: 17}}>Léa Marée</b><div className="mut" style={{fontSize: 13}}>Paris · pop, chanson urbaine</div><div className="mt gd" style={{marginTop: 8}}><i style={{width: '64%'}} /></div></div>
            <span className="tag te">Moral 64</span>
          </div>
          <a href="Decouverte.dc.html" className="pn" style={{display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, boxShadow: 'inset 0 0 0 2px var(--ln)', background: 'transparent'}}>
            <div className="av" style={{width: 56, height: 56, fontSize: 28, background: '#2A1B4D', color: '#FF7DBB'}}>+</div>
            <div><b style={{fontSize: 17}}>Découvrir un artiste</b><div className="mut" style={{fontSize: 13}}>Éclaireurs, scènes ouvertes, transferts</div></div>
          </a>
        </div>
        <div className="pn cut" style={{flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px', alignContent: 'start'}}>
          <div style={{gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 18}}>
            <div className="av" style={{width: 84, height: 84, fontSize: 32, background: 'linear-gradient(135deg,#FF3D9A,#8B5CF6)'}}>KZ</div>
            <div><div className="h1">Kozen</div><div className="mut">Abidjan, Côte d'Ivoire · français, dioula, anglais · afro-pop, coupé-décalé</div></div>
            <div className="sp" />
            <span className="tag tc">Potentiel : ★★★★☆</span>
          </div>
          <div>
            <div className="lbl">Talents</div>
            <div style={{display: 'grid', gridTemplateColumns: '110px 1fr 36px', gap: 12, alignItems: 'center', marginTop: 12}}>
              <span>Voix / flow</span><div className="mt"><i style={{width: '72%'}} /></div><b>72</b>
              <span>Écriture</span><div className="mt"><i style={{width: '66%'}} /></div><b>66</b>
              <span>Charisme</span><div className="mt"><i style={{width: '81%'}} /></div><b>81</b>
              <span>Image</span><div className="mt"><i style={{width: '58%'}} /></div><b>58</b>
            </div>
            <div className="lbl" style={{marginTop: 22}}>Contrat</div>
            <div style={{marginTop: 8, lineHeight: '1.7', fontSize: 14}}>Fin dans <b>18 mois</b> · part du label <b>50 %</b><br />Territoires : <b>Afrique de l'Ouest + France</b></div>
          </div>
          <div>
            <div className="lbl">Fans par territoire</div>
            <div style={{display: 'grid', gridTemplateColumns: '110px 1fr 56px', gap: 10, alignItems: 'center', marginTop: 12, fontSize: 14}}>
              <span>Côte d'Ivoire</span><div className="mt cy"><i style={{width: '90%'}} /></div><b>620 k</b>
              <span>Sénégal</span><div className="mt cy"><i style={{width: '42%'}} /></div><b>180 k</b>
              <span>France</span><div className="mt cy"><i style={{width: '36%'}} /></div><b>150 k</b>
              <span>Nigeria</span><div className="mt cy"><i style={{width: '18%'}} /></div><b>70 k</b>
              <span>Brésil</span><div className="mt cy"><i style={{width: '2%'}} /></div><b>6 k</b>
            </div>
          </div>
          <div className="bub" style={{gridColumn: '1 / -1'}}>
            <span className="tag ti" style={{marginRight: 8}}>Confiant</span>« Je veux sortir un titre en anglais pour Lagos avant la fin du trimestre. »
          </div>
          <div style={{gridColumn: '1 / -1', display: 'flex', gap: 12}}>
            <a href="Studio.dc.html" className="btn">Nouveau titre</a>
            <a href="Tournee.dc.html" className="btn s">Tournée</a>
            <a href="Contrat.dc.html" className="btn s">Renégocier</a>
          </div>
        </div>
      </div>
    </div>
  )
}
