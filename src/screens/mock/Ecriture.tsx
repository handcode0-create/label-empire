// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Ecriture.dc.html).
import Hud from '../../components/Hud'

export default function Ecriture() {
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
        <div style={{width: 330, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}><span className="chip on">1 Écrire</span><span className="chip">2 Enregistrer</span><span className="chip">3 Mixer</span><span className="chip">4 Sortir</span></div>
          <div className="pn cut">
            <label htmlFor="tt" className="lbl">Titre</label><input id="tt" className="in" style={{marginTop: 8, fontWeight: 700}} defaultValue="Soleil d'Abidjan" />
            <div className="lbl" style={{marginTop: 14}}>Genre</div><div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8}}><span className="chip on">Afro-pop</span><span className="chip">Coupé-décalé</span><span className="chip">R&amp;B</span></div>
            <div className="lbl" style={{marginTop: 14}}>Thème</div><div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8}}><span className="chip on">Amour</span><span className="chip">Fête</span><span className="chip">Ambition</span><span className="chip">Société</span></div>
            <div className="lbl" style={{marginTop: 14}}>Langue</div><div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8}}><span className="chip on">Français</span><span className="chip">Nouchi</span><span className="chip">Anglais</span></div>
            <div className="lbl" style={{marginTop: 14}}>Ambiance</div><div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8}}><span className="chip">Mélancolique</span><span className="chip on">Solaire</span><span className="chip">Intense</span></div>
          </div>
          <div className="pn">
            <div className="lbl">Qui écrit ?</div>
            <div className="row" style={{gridTemplateColumns: '1fr 70px'}}><div><b>Kozen</b><div className="mut" style={{fontSize: 13}}>Écriture 74</div></div><span className="tag tg">Choisi</span></div>
            <div className="row" style={{gridTemplateColumns: '1fr 70px'}}><div><b>Auteur externe</b><div className="mut" style={{fontSize: 13}}>+8 qualité · $2 000</div></div><span className="tag te">Option</span></div>
          </div>
        </div>
        <div className="pn cut" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Paroles</span><span className="sp" /><span className="tag ti">Brouillon enregistré</span></div>
          <div style={{flex: 1, marginTop: 12, padding: 16, borderRadius: 12, background: '#150C2A', boxShadow: 'inset 0 0 0 1px var(--ln)', overflow: 'hidden'}}><div style={{display: 'flex', gap: 14, padding: '3px 0'}}><span className="mut" style={{width: 22, textAlign: 'right', fontSize: 13}}>1</span><span style={{fontSize: 17}}>Sous le ciel d'Abidjan, le soir se lève doux</span></div><div style={{display: 'flex', gap: 14, padding: '3px 0'}}><span className="mut" style={{width: 22, textAlign: 'right', fontSize: 13}}>2</span><span style={{fontSize: 17}}>Mes rêves dans mes poches, des étoiles à genoux</span></div><div style={{display: 'flex', gap: 14, padding: '3px 0'}}><span className="mut" style={{width: 22, textAlign: 'right', fontSize: 13}}>3</span><span style={{fontSize: 17}}>Ce refrain, c'est pour toi, qui n'as jamais cédé</span></div><div style={{display: 'flex', gap: 14, padding: '3px 0'}}><span className="mut" style={{width: 22, textAlign: 'right', fontSize: 13}}>4</span><span style={{fontSize: 17}}>Chante avec moi, chante, le monde va danser</span></div><div style={{display: 'flex', gap: 14, padding: '3px 0'}}><span className="mut" style={{width: 22, textAlign: 'right', fontSize: 13}}>5</span><span style={{fontSize: 17}}>&nbsp;</span></div><div style={{display: 'flex', gap: 14, padding: '3px 0'}}><span className="mut" style={{width: 22, textAlign: 'right', fontSize: 13}}>6</span><span style={{fontSize: 17, color: '#FF7DBB', fontWeight: 700}}>[Refrain]</span></div><div style={{display: 'flex', gap: 14, padding: '3px 0'}}><span className="mut" style={{width: 22, textAlign: 'right', fontSize: 13}}>7</span><span style={{fontSize: 17}}>Soleil d'Abidjan, éclaire mon chemin</span></div><div style={{display: 'flex', gap: 14, padding: '3px 0'}}><span className="mut" style={{width: 22, textAlign: 'right', fontSize: 13}}>8</span><span style={{width: 2, height: 22, background: '#FF3D9A'}} /></div></div>
          <div style={{display: 'flex', gap: 10, marginTop: 12}}><a href="Ecriture.dc.html" className="btn s sm">Générer une idée</a><a href="Ecriture.dc.html" className="btn s sm">Ajouter un refrain</a><a href="Ecriture.dc.html" className="btn s sm">Ajouter un couplet</a><div className="sp" /><span className="mut" style={{fontSize: 13, alignSelf: 'center'}}>128 mots · 7 lignes</span></div>
        </div>
        <div style={{width: 330, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div className="pn"><div className="lbl">Qualité du texte</div><div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12}}><div style={{display: 'grid', gridTemplateColumns: '120px 1fr 34px', gap: 10, alignItems: 'center', fontSize: 14}}><span>Écriture</span><div className="mt gd"><i style={{width: '74%'}} /></div><b>74</b></div><div style={{display: 'grid', gridTemplateColumns: '120px 1fr 34px', gap: 10, alignItems: 'center', fontSize: 14}}><span>Originalité</span><div className="mt "><i style={{width: '58%'}} /></div><b>58</b></div><div style={{display: 'grid', gridTemplateColumns: '120px 1fr 34px', gap: 10, alignItems: 'center', fontSize: 14}}><span>Cohérence</span><div className="mt gr"><i style={{width: '81%'}} /></div><b>81</b></div><div style={{display: 'grid', gridTemplateColumns: '120px 1fr 34px', gap: 10, alignItems: 'center', fontSize: 14}}><span>Potentiel refrain</span><div className="mt cy"><i style={{width: '69%'}} /></div><b>69</b></div></div></div>
          <div className="pn"><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 6}}>Durée : 1 semaine</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 6}}>Qualité du texte 72</div></div>
              <div><span className="tag ti">Incertain</span><div style={{marginTop: 6}}>Effet sur le public</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 6}}>Thème déjà saturé</div></div></div></div>
          <div className="sp" />
          <a href="Studio.dc.html" className="btn" style={{height: 60}}>Passer à l'enregistrement</a>
        </div>
      </div>
    </div>
  )
}
