// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Sortie.dc.html).
import Hud from '../../components/Hud'

export default function Sortie() {
  return (
    <div className="scr">
      <nav className="dock" aria-label="Navigation du jeu">
        <div className="lg">LE</div>
        <a className="dk" href="Hub.dc.html" aria-label="Monde"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>Monde</a>
        <a className="dk" href="Artistes.dc.html" aria-label="Artistes"><svg viewBox="0 0 24 24"><circle cx={9} cy={8} r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17.5" cy={9} r="2.5" /><path d="M17 14.2c2.4.3 4 2.2 4 5.3" /></svg>Artistes</a>
        <a className="dk" href="Studio.dc.html" aria-label="Studio"><svg viewBox="0 0 24 24"><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>Studio</a>
        <a className="dk on" href="Sortie.dc.html" aria-label="Sorties"><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><circle cx={12} cy={12} r={3} /></svg>Sorties</a>
        <a className="dk" href="Classements.dc.html" aria-label="Classements"><svg viewBox="0 0 24 24"><path d="M5 20v-6M12 20V5M19 20v-10" /></svg>Classem.</a>
        <a className="dk" href="Tournee.dc.html" aria-label="Tournées"><svg viewBox="0 0 24 24"><path d="M3 13l18-9-6 17-3-7-9-1z" /></svg>Tournées</a>
        <a className="dk" href="Equipe.dc.html" aria-label="Équipe"><svg viewBox="0 0 24 24"><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M9 7V5h6v2M3 13h18" /></svg>Équipe</a>
        <a className="dk" href="Finances.dc.html" aria-label="Finances"><svg viewBox="0 0 24 24"><path d="M3 7h16a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2V7zM3 7l2-3h12M16 14h2" /></svg>Finances</a>
      </nav>
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}><h1 className="h1">Programmer la sortie</h1><span className="tag ti">« Soleil d'Abidjan » · Kozen · qualité 72</span></div>
        <div style={{display: 'flex', gap: 20, marginTop: 16}}>
          <div style={{width: 820}}>
            <div className="lbl">Stratégie</div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 10}}>
              <div className="pn" style={{padding: '14px 16px'}}><b>Locale</b><div className="mut" style={{fontSize: 13, marginTop: 4}}>Un pays, diffusion lente</div><div style={{marginTop: 8}}><span className="tag tg">Risque faible</span></div></div>
              <div className="pn sel" style={{padding: '14px 16px'}}><b>Régionale</b><div className="mut" style={{fontSize: 13, marginTop: 4}}>Un continent ou une zone</div><div style={{marginTop: 8}}><span className="tag te">Risque moyen</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><b>Mondiale</b><div className="mut" style={{fontSize: 13, marginTop: 4}}>Sortie simultanée</div><div style={{marginTop: 8}}><span className="tag tr_">Risque élevé</span></div></div>
              <div className="pn" style={{padding: '14px 16px'}}><b>Crossover</b><div className="mut" style={{fontSize: 13, marginTop: 4}}>Duo avec un autre pays</div><div style={{marginTop: 8}}><span className="tag ti">Incertain</span></div></div>
            </div>
            <div style={{display: 'flex', gap: 20, marginTop: 18}}>
              <div className="pn" style={{flex: 1}}>
                <div className="lbl">Territoires de la sortie</div>
                <div style={{marginTop: 6}}>
                  <div className="row" style={{gridTemplateColumns: '24px 1fr 80px 80px'}}><span style={{color: '#FF7DBB'}}>■</span><b>Côte d'Ivoire</b><span className="mut" style={{fontSize: 13}}>620 k fans</span><span className="tag tg">Affinité 1,4</span></div>
                  <div className="row" style={{gridTemplateColumns: '24px 1fr 80px 80px'}}><span style={{color: '#FF7DBB'}}>■</span><b>Sénégal</b><span className="mut" style={{fontSize: 13}}>180 k fans</span><span className="tag tg">Affinité 1,2</span></div>
                  <div className="row" style={{gridTemplateColumns: '24px 1fr 80px 80px'}}><span style={{color: '#FF7DBB'}}>■</span><b>Ghana</b><span className="mut" style={{fontSize: 13}}>40 k fans</span><span className="tag tc">Affinité 1,0</span></div>
                  <div className="row" style={{gridTemplateColumns: '24px 1fr 80px 80px'}}><span style={{color: '#FF7DBB'}}>■</span><b>Nigeria</b><span className="mut" style={{fontSize: 13}}>70 k fans</span><span className="tag te">Affinité 0,9</span></div>
                  <div className="row" style={{gridTemplateColumns: '24px 1fr 80px 80px'}}><span style={{color: '#9C90CC'}}>□</span><b>France</b><span className="mut" style={{fontSize: 13}}>150 k fans</span><span className="tag tc">Affinité 1,1</span></div>
                </div>
              </div>
              <div className="pn" style={{width: 300}}>
                <div className="lbl">Localisation</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12, fontSize: 14}}>
                  <div><span style={{color: '#FF7DBB'}}>■</span> <b>Version anglaise</b><div className="mut" style={{fontSize: 13, marginLeft: 20}}>$4 000 · 1 semaine · pour le Nigeria et le Ghana</div></div>
                  <div><span style={{color: '#9C90CC'}}>□</span> <b>Remix amapiano</b><div className="mut" style={{fontSize: 13, marginLeft: 20}}>$2 500 · 1 semaine · Afrique australe</div></div>
                  <div><span style={{color: '#9C90CC'}}>□</span> <b>Clip adapté</b><div className="mut" style={{fontSize: 13, marginLeft: 20}}>$9 000 · 3 semaines · image +</div></div>
                </div>
              </div>
            </div>
          </div>
          <div style={{width: 440, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn">
              <div className="lbl">Calendrier</div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 10, textAlign: 'center', fontSize: 13}}>
                <div className="pn" style={{padding: '10px 4px'}}><div className="lbl">S15</div><div style={{marginTop: 4}}>Libre</div></div>
                <div className="pn sel" style={{padding: '10px 4px'}}><div className="lbl">S16</div><div style={{marginTop: 4, fontWeight: 700}}>Sortie</div></div>
                <div className="pn" style={{padding: '10px 4px'}}><div className="lbl">S17</div><div style={{marginTop: 4, color: '#FFC63D'}}>Fête locale</div></div>
                <div className="pn" style={{padding: '10px 4px'}}><div className="lbl">S18</div><div style={{marginTop: 4, color: '#FF5470'}}>Rival à Paris</div></div>
                <div className="pn" style={{padding: '10px 4px'}}><div className="lbl">S19</div><div style={{marginTop: 4}}>Libre</div></div>
              </div>
            </div>
            <div className="pn">
              <div className="lbl">Budget de promotion</div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 100px', gap: 16, alignItems: 'center', marginTop: 14}}><div className="sl"><i style={{width: '40%'}} /><u style={{left: '40%'}} /></div><b style={{textAlign: 'right', color: '#FFC63D', fontSize: 18}}>$12 000</b></div>
              <div className="mut" style={{fontSize: 13, marginTop: 10}}>Radio, réseaux sociaux et presse locale dans les territoires choisis.</div>
            </div>
            <div className="pn cut">
              <div className="lbl">Projection de la première semaine</div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 10}}>
                <div><div className="mut" style={{fontSize: 13}}>Écoutes</div><div className="disp" style={{fontSize: 26}}>420 k – 680 k</div></div>
                <div><div className="mut" style={{fontSize: 13}}>Revenus</div><div className="disp" style={{fontSize: 26, color: '#FFC63D'}}>$5,8 k – $9,2 k</div></div>
                <div><div className="mut" style={{fontSize: 13}}>Nouveaux fans</div><div className="disp" style={{fontSize: 26, color: '#35D3F0'}}>+35 k – 60 k</div></div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 6}}><span className="tag te">Estimé</span><span className="tag ti">Effet viral incertain</span></div>
              </div>
            </div>
            <div className="sp" />
            <div style={{display: 'flex', gap: 12}}><a href="Studio.dc.html" className="btn s">Retour</a><a href="Classements.dc.html" className="btn" style={{flex: 1, height: 60}}>Programmer la sortie</a></div>
          </div>
        </div>
      </div>
    </div>
  )
}
