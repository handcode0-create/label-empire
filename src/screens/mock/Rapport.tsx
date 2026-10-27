// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Rapport.dc.html).
export default function Rapport() {
  return (
    <div className="scr">
      <div className="map" style={{position: 'absolute', left: 120, top: 150, width: 1200, height: 600, opacity: '0.25'}} />
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(12,7,25,0.6)'}} />
      <div className="pn cut" style={{position: 'absolute', left: 180, top: 48, width: 1080, height: 804, padding: '28px 32px', background: 'linear-gradient(180deg,#2A1B4D,#1C1236)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}><h1 className="h1" style={{fontSize: 44}}>Semaine 14 · résultats</h1><span className="tag tg">Trésorerie : +$11 500</span><div className="sp" /><span className="lbl">An 2</span></div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 20}}>
          <div className="pn"><div className="lbl">Écoutes</div><div className="num" style={{marginTop: 6}}>3,8 M</div><span className="up" style={{fontSize: 14}}>+12 %</span></div>
          <div className="pn"><div className="lbl">Revenus</div><div className="num" style={{marginTop: 6, color: '#FFC63D'}}>$41 200</div><span className="up" style={{fontSize: 14}}>+8 %</span></div>
          <div className="pn"><div className="lbl">Dépenses</div><div className="num" style={{marginTop: 6}}>$29 700</div><span className="mut" style={{fontSize: 14}}>salaires, studio, promo</span></div>
          <div className="pn"><div className="lbl">Nouveaux fans</div><div className="num" style={{marginTop: 6, color: '#35D3F0'}}>+96 k</div><span className="up" style={{fontSize: 14}}>+4 pays</span></div>
        </div>
        <div style={{display: 'flex', gap: 20, marginTop: 18}}>
          <div className="pn" style={{width: 500}}>
            <div className="lbl">Revenus par continent</div>
            <div style={{display: 'grid', gridTemplateColumns: '120px 1fr 70px', gap: '11px 12px', alignItems: 'center', marginTop: 14, fontSize: 14}}>
              <span>Afrique</span><div className="mt gd"><i style={{width: '100%'}} /></div><b>$26,4 k</b>
              <span>Europe</span><div className="mt gd"><i style={{width: '40%'}} /></div><b>$10,6 k</b>
              <span>Amérique du Nord</span><div className="mt gd"><i style={{width: '11%'}} /></div><b>$2,9 k</b>
              <span>Asie</span><div className="mt gd"><i style={{width: '5%'}} /></div><b>$1,3 k</b>
            </div>
            <div className="lbl" style={{marginTop: 18}}>Classements</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, fontSize: 14}}>
              <div style={{display: 'flex', gap: 10, alignItems: 'center'}}><span className="tag tg">Entrée</span>« Soleil d'Abidjan » n°3 en Côte d'Ivoire (+5)</div>
              <div style={{display: 'flex', gap: 10, alignItems: 'center'}}><span className="tag tc">Montée</span>Afrique : n°21 au top 50</div>
            </div>
          </div>
          <div className="pn sel" style={{flex: 1}}>
            <div style={{display: 'flex', gap: 10, alignItems: 'center'}}><span className="tag tr_">Événement</span><span className="lbl">Nigeria</span></div>
            <div className="h2" style={{marginTop: 10, fontSize: 28}}>Le naira chute face au dollar</div>
            <p className="mut" style={{margin: '8px 0 14px'}}>Vos revenus du Nigeria perdent <b style={{color: '#F4F0FF'}}>9 %</b> cette semaine. Un partenaire local peut couvrir une partie du risque de change.</p>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              <div className="pn" style={{padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12}}><div style={{flex: 1}}><b>Accepter la perte</b><div className="mut" style={{fontSize: 13}}>Certain : −$1 100 ce mois-ci</div></div><span className="tag tc">Gratuit</span></div>
              <div className="pn" style={{padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12}}><div style={{flex: 1}}><b>Négocier avec un partenaire local</b><div className="mut" style={{fontSize: 13}}>Estimé : économise $600 à $900 · Incertain : dépend du partenaire</div></div><span className="tag te">$1 500</span></div>
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 32, right: 32, bottom: 28, display: 'flex', alignItems: 'center', gap: 14}}><span className="mut" style={{fontSize: 14}}>Prochaine semaine : sortie « Soleil d'Abidjan » le mardi, concert à Lagos jeudi.</span><div className="sp" /><a href="Hub.dc.html" className="btn" style={{height: 60}}>Continuer</a></div>
      </div>
    </div>
  )
}
