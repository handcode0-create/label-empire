// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Finances.dc.html).
export default function Finances() {
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
        <a className="dk" href="Equipe.dc.html" aria-label="Équipe"><svg viewBox="0 0 24 24"><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M9 7V5h6v2M3 13h18" /></svg>Équipe</a>
        <a className="dk on" href="Finances.dc.html" aria-label="Finances"><svg viewBox="0 0 24 24"><path d="M3 7h16a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2V7zM3 7l2-3h12M16 14h2" /></svg>Finances</a>
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
        <div style={{width: 790, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}><h1 className="h1">Finances</h1><span className="tag tg">Aucune dette cachée</span></div>
          <div className="pn cut">
            <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Recettes et dépenses, 8 prochaines semaines</span><span className="sp" /><span className="tag te">Projection</span></div>
            <svg viewBox="0 0 700 250" width="100%" height={250} style={{marginTop: 10}} role="img" aria-label="Barres de recettes et de dépenses par semaine, de la semaine 14 à la semaine 21">
              <g stroke="#3F2B73" strokeWidth={1}><line x1={30} x2={690} y1={200} y2={200} /><line x1={30} x2={690} y1={134} y2={134} strokeDasharray="3 5" /><line x1={30} x2={690} y1={68} y2={68} strokeDasharray="3 5" /></g>
              <g fill="#B3A6D9" fontFamily="DM Sans, sans-serif" fontSize={12}><text x={0} y={204}>0</text><text x={0} y={138}>20 k</text><text x={0} y={72}>40 k</text></g>
              <g fill="#FFC63D"><rect x={46} y={65} width={20} height={135} rx={3} /><rect x={112} y={68} width={20} height={132} rx={3} /><rect x={178} y={78} width={20} height={122} rx={3} /><rect x={244} y={55} width={20} height={145} rx={3} /><rect x={310} y={51} width={20} height={149} rx={3} /><rect x={376} y={48} width={20} height={152} rx={3} /><rect x={442} y={42} width={20} height={158} rx={3} /><rect x={508} y={35} width={20} height={165} rx={3} /></g>
              <g fill="#FF3D9A"><rect x={70} y={101} width={20} height={99} rx={3} /><rect x={136} y={9} width={20} height={191} rx={3} /><rect x={202} y={48} width={20} height={152} rx={3} /><rect x={268} y={55} width={20} height={145} rx={3} /><rect x={334} y={55} width={20} height={145} rx={3} /><rect x={400} y={61} width={20} height={139} rx={3} /><rect x={466} y={75} width={20} height={125} rx={3} /><rect x={532} y={84} width={20} height={116} rx={3} /></g>
              <g fill="#B3A6D9" fontFamily="DM Sans, sans-serif" fontSize={12} textAnchor="middle"><text x={68} y={220}>S14</text><text x={134} y={220}>S15</text><text x={200} y={220}>S16</text><text x={266} y={220}>S17</text><text x={332} y={220}>S18</text><text x={398} y={220}>S19</text><text x={464} y={220}>S20</text><text x={530} y={220}>S21</text></g>
              <g fontFamily="DM Sans, sans-serif" fontSize={13} fill="#F4F0FF"><rect x={568} y={30} width={12} height={12} fill="#FFC63D" rx={2} /><text x={586} y={41}>Recettes</text><rect x={568} y={54} width={12} height={12} fill="#FF3D9A" rx={2} /><text x={586} y={65}>Dépenses</text></g>
              <text x={134} y={0} fill="#FF7DBB" fontSize={12} />
            </svg>
            <div className="mut" style={{fontSize: 13}}>Pic de dépenses en semaine 15 : la tournée coûte $48 000. Trésorerie projetée en semaine 21 : <b style={{color: '#FFC63D'}}>$142 400</b>.</div>
          </div>
          <div className="pn">
            <div className="lbl">Cash par devise</div>
            <div className="row th" style={{gridTemplateColumns: '1fr 190px 130px 90px', paddingTop: 10}}><span>Devise</span><span>Montant</span><span>En dollars</span><span>Semaine</span></div>
            <div className="row" style={{gridTemplateColumns: '1fr 190px 130px 90px'}}><b>Dollar</b><span>$62 400</span><b>$62 400</b><span className="mut">=</span></div>
            <div className="row" style={{gridTemplateColumns: '1fr 190px 130px 90px'}}><b>Euro</b><span>€31 000</span><b>$33 600</b><span className="up">+0,6 %</span></div>
            <div className="row" style={{gridTemplateColumns: '1fr 190px 130px 90px'}}><b>Franc CFA</b><span>19 500 000 F</span><b>$32 400</b><span className="dn">−0,4 %</span></div>
          </div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div className="pn">
            <div className="lbl">Retenues par pays (taux de jeu)</div>
            <div style={{marginTop: 6}}>
              <div className="row" style={{gridTemplateColumns: '1fr 70px 100px'}}><span>Côte d'Ivoire</span><b>15 %</b><span className="tag tg">Délai 2 sem.</span></div>
              <div className="row" style={{gridTemplateColumns: '1fr 70px 100px'}}><span>France</span><b>20 %</b><span className="tag tg">Délai 3 sem.</span></div>
              <div className="row" style={{gridTemplateColumns: '1fr 70px 100px'}}><span>Nigeria</span><b>12 %</b><span className="tag te">Délai 6 sem.</span></div>
            </div>
          </div>
          <div className="pn">
            <div className="lbl">Piratage estimé</div>
            <div style={{display: 'grid', gridTemplateColumns: '90px 1fr 50px', gap: 10, alignItems: 'center', marginTop: 12, fontSize: 14}}>
              <span>Nigeria</span><div className="mt rd"><i style={{width: '38%'}} /></div><b>−38 %</b>
              <span>Côte d'Iv.</span><div className="mt gd"><i style={{width: '22%'}} /></div><b>−22 %</b>
              <span>France</span><div className="mt gr"><i style={{width: '8%'}} /></div><b>−8 %</b>
            </div>
          </div>
          <div className="pn cut sel">
            <div className="lbl">Prêt bancaire disponible</div>
            <div className="num" style={{marginTop: 6, color: '#FFC63D'}}>$60 000</div>
            <div className="mut" style={{fontSize: 14, marginTop: 6}}>Taux fixe 9 %, remboursé sur 26 semaines. Plafond selon votre réputation.</div>
            <div style={{display: 'flex', gap: 8, marginTop: 10}}><span className="tag tc">Intérêts : $2 700</span><span className="tag tr_">Risque : trésorerie serrée</span></div>
            <a href="Finances.dc.html" className="btn g" style={{marginTop: 14, width: '100%'}}>Demander le prêt</a>
          </div>
          <div className="sp" />
          <a href="Fin.dc.html" className="btn s">Voir un exemple de fin de partie</a>
        </div>
      </div>
    </div>
  )
}
