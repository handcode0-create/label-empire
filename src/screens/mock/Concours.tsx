// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Concours.dc.html).
export default function Concours() {
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
        <div style={{width: 470, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><a href="Decouverte.dc.html" className="btn s sm">Retour</a><h1 className="h1" style={{fontSize: 36}}>Organiser un concours</h1></div>
          <div className="pn cut">
            <label htmlFor="cn" className="lbl">Nom du concours</label>
            <input id="cn" className="in" style={{marginTop: 8}} defaultValue="Révélation Accra" />
            <div className="lbl" style={{marginTop: 16}}>Pays et ville</div>
            <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}><span className="chip on">Ghana · Accra</span><span className="chip">Nigeria · Lagos</span><span className="chip">Sénégal · Dakar</span><span className="chip">Afrique du Sud</span></div>
            <div className="lbl" style={{marginTop: 16}}>Format</div>
            <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}><span className="chip">Audition en ligne</span><span className="chip on">Audition en salle</span><span className="chip">Show télévisé</span></div>
            <div style={{display: 'flex', alignItems: 'baseline', marginTop: 16}}><span className="lbl">Budget</span><span className="sp" /><b className="disp" style={{fontSize: 24, color: '#FFC63D'}}>$12 000</b></div>
            <div className="sl" style={{marginTop: 14}}><i style={{width: '45%'}} /><u style={{left: '45%'}} /></div>
            <div className="lbl" style={{marginTop: 16}}>Jury</div>
            <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}><span className="chip on">Marc Lefèvre, DA</span><span className="chip on">Adjoua Koffi</span><span className="chip">Invité local</span></div>
          </div>
          <div className="pn">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 6}}>Coût : $12 000 aujourd'hui</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 6}}>86 candidats, 4 finalistes</div></div>
              <div><span className="tag ti">Incertain</span><div style={{marginTop: 6}}>Une vraie pépite ou non</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 6}}>Faible. Rival Atlas Sound présent</div></div>
            </div>
          </div>
          <div className="sp" />
          <a href="Concours.dc.html" className="btn" style={{height: 60}}>Lancer le concours</a>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div style={{position: 'relative', height: 200, borderRadius: 16, overflow: 'hidden', background: 'radial-gradient(420px 220px at 50% 120%, rgba(255,198,61,0.55), transparent), radial-gradient(300px 200px at 15% 0%, rgba(255,61,154,0.5), transparent), radial-gradient(300px 200px at 85% 0%, rgba(53,211,240,0.4), transparent), linear-gradient(180deg,#1C1236,#0C0719)'}}>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, background: 'linear-gradient(0deg,#2A1B4D,transparent)'}} />
            <div style={{position: 'absolute', left: 28, top: 22}}><span className="tag tr_">En direct · Finale</span></div>
            <div style={{position: 'absolute', left: 28, bottom: 20}}><div className="lbl">Accra · Salle de 800 places</div><div className="disp" style={{fontSize: 42, lineHeight: 1}}>Révélation Accra</div></div>
            <div style={{position: 'absolute', right: 24, bottom: 20, textAlign: 'right'}}><div className="num" style={{color: '#FFC63D'}}>86</div><div className="mut" style={{fontSize: 13}}>candidats auditionnés</div></div>
          </div>
          <div className="lbl">Les 4 finalistes</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12}}><div className="pn sel" style={{textAlign: 'center', padding: '16px 12px'}}><div style={{display: 'flex', justifyContent: 'center'}}><div className="av" style={{width: 76, height: 76, fontSize: 27, background: 'linear-gradient(135deg,#8B5CF6,#FF5470)'}}>BK</div></div><div style={{marginTop: 10}}><b style={{fontSize: 17}}>Boa Kwame</b></div><div className="mut" style={{fontSize: 13}}>Accra · Hip-hop</div><div className="num" style={{marginTop: 8, color: '#FFC63D'}}>92</div><div className="mut" style={{fontSize: 12}}>note du jury</div><a href="Profil.dc.html" className="btn  sm" style={{marginTop: 10}}>Voir le profil</a></div><div className="pn" style={{textAlign: 'center', padding: '16px 12px'}}><div style={{display: 'flex', justifyContent: 'center'}}><div className="av" style={{width: 76, height: 76, fontSize: 27, background: 'linear-gradient(135deg,#FF3D9A,#FFC63D)'}}>ES</div></div><div style={{marginTop: 10}}><b style={{fontSize: 17}}>Efua Sun</b></div><div className="mut" style={{fontSize: 13}}>Kumasi · Afro-pop</div><div className="num" style={{marginTop: 8, color: '#FFC63D'}}>88</div><div className="mut" style={{fontSize: 12}}>note du jury</div><a href="Profil.dc.html" className="btn s sm" style={{marginTop: 10}}>Voir le profil</a></div><div className="pn" style={{textAlign: 'center', padding: '16px 12px'}}><div style={{display: 'flex', justifyContent: 'center'}}><div className="av" style={{width: 76, height: 76, fontSize: 27, background: 'linear-gradient(135deg,#35D3F0,#3DDC97)'}}>KF</div></div><div style={{marginTop: 10}}><b style={{fontSize: 17}}>Kojo Flame</b></div><div className="mut" style={{fontSize: 13}}>Accra · Highlife</div><div className="num" style={{marginTop: 8, color: '#FFC63D'}}>81</div><div className="mut" style={{fontSize: 12}}>note du jury</div><a href="Profil.dc.html" className="btn s sm" style={{marginTop: 10}}>Voir le profil</a></div><div className="pn" style={{textAlign: 'center', padding: '16px 12px'}}><div style={{display: 'flex', justifyContent: 'center'}}><div className="av" style={{width: 76, height: 76, fontSize: 27, background: 'linear-gradient(135deg,#FFC63D,#8B5CF6)'}}>SQ</div></div><div style={{marginTop: 10}}><b style={{fontSize: 17}}>Sena Q</b></div><div className="mut" style={{fontSize: 13}}>Tema · R&amp;B</div><div className="num" style={{marginTop: 8, color: '#FFC63D'}}>77</div><div className="mut" style={{fontSize: 12}}>note du jury</div><a href="Profil.dc.html" className="btn s sm" style={{marginTop: 10}}>Voir le profil</a></div></div>
          <div className="bub"><span className="tag tc" style={{marginRight: 8}}>Jury</span>« Kwame a une présence rare. Il vous faudra être rapide : deux labels l'ont déjà contacté. »</div>
          <div className="mut" style={{fontSize: 13}}>Vous pouvez proposer un contrat à un seul finaliste avant la fin de la semaine. Les autres rejoignent la liste de découverte.</div>
        </div>
      </div>
    </div>
  )
}
