import Chip from '../../components/Chip'
import SkillRow from '../../components/SkillRow'
import { sum, useGame } from '../../store/gameStore'

// Fichier généré par scripts/port-mockups.cjs depuis la maquette (NouvellePartie2.dc.html).
export default function NouvellePartie2() {
  const c = useGame((st) => st.config)
  const patch = useGame((st) => st.patch)
  return (
    <div className="scr">
      <div style={{position: 'absolute', left: 56, top: 36, right: 56, display: 'flex', alignItems: 'center', gap: 16}}>
        <a href="NouvellePartie.dc.html" className="btn s sm">Retour</a>
        <h1 className="h1">Nouvelle partie</h1>
        <div className="sp" />
        <span className="chip">1 Identité</span><span className="chip on">2 Compétences et siège</span>
      </div>
      <div className="pn cut" style={{position: 'absolute', left: 56, top: 112, width: 400, height: 676}}>
        <div style={{display: 'flex', alignItems: 'baseline'}}><span className="lbl">Compétences du staff</span><span className="sp" /><b className="disp" style={{fontSize: 24, color: '#FFC63D'}}>{sum(c.staffSkills)} / 10</b></div>
        <div className="mut" style={{fontSize: 13, marginTop: 4}}>Votre équipe de départ : 3 personnes. Chaque point améliore une activité du label.</div>
        <div style={{marginTop: 12}}><SkillRow group="staffSkills" k="negociation" label="Négociation" /><SkillRow group="staffSkills" k="reperage" label="Repérage" /><SkillRow group="staffSkills" k="production" label="Production" /><SkillRow group="staffSkills" k="marketing" label="Marketing" /><SkillRow group="staffSkills" k="finance" label="Finance" /><SkillRow group="staffSkills" k="reseau" label="Réseau" /></div>
        <div className="bub" style={{marginTop: 14}}><span className="tag ti" style={{marginRight: 8}}>Conseil</span>Le repérage agrandit la liste d'artistes que vous voyez dans chaque pays.</div>
      </div>
      <div className="pn cut sel" style={{position: 'absolute', left: 480, top: 112, width: 400, height: 676}}>
        <div style={{display: 'flex', alignItems: 'baseline'}}><span className="lbl">Compétences d'artiste</span><span className="sp" /><b className="disp" style={{fontSize: 24, color: '#FFC63D'}}>{sum(c.artistSkills)} / 10</b></div>
        <div className="mut" style={{fontSize: 13, marginTop: 4}}>Actif car vous êtes aussi artiste. Elles décident de la qualité de vos titres et de vos concerts.</div>
        <div style={{marginTop: 12}}><SkillRow group="artistSkills" k="voix" label="Voix" /><SkillRow group="artistSkills" k="ecriture" label="Écriture" /><SkillRow group="artistSkills" k="charisme" label="Charisme" /><SkillRow group="artistSkills" k="scene" label="Scène" /><SkillRow group="artistSkills" k="creativite" label="Créativité" /><SkillRow group="artistSkills" k="endurance" label="Endurance" /></div>
        <div style={{display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap'}}><span className="tag tg">Profil : chanteur</span><span className="tag te">Qualité estimée 41</span><span className="tag ti">Fans de départ 1 200</span></div>
      </div>
      <div style={{position: 'absolute', left: 904, top: 112, width: 480, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div className="pn cut" style={{padding: '18px 20px'}}>
          <div className="lbl">Ville du siège</div>
          <div className="map" style={{height: 230, marginTop: 10, position: 'relative'}}><div className="mk g" style={{left: '50.9%', top: '46.4%'}} /><div className="mk g" style={{left: '50.6%', top: '22.8%'}} /><div className="mk g" style={{left: '29.4%', top: '27.4%'}} /><div className="mk g" style={{left: '57.8%', top: '64.4%'}} /><div className="mk g" style={{left: '37.1%', top: '63.1%'}} /><div className="mk g" style={{left: '85.3%', top: '29.2%'}} /><div className="mk c" style={{left: '48.9%', top: '47.1%'}} /><div className="mn" style={{left: '48.9%', top: '47.1%'}}>Abidjan</div></div>
          <div style={{display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap'}}><Chip on={c.hqCityId === 'abidjan'} onClick={() => patch({ hqCityId: 'abidjan' })}>Abidjan</Chip><Chip on={c.hqCityId === 'lagos'} onClick={() => patch({ hqCityId: 'lagos' })}>Lagos</Chip><Chip on={c.hqCityId === 'paris'} onClick={() => patch({ hqCityId: 'paris' })}>Paris</Chip><Chip on={c.hqCityId === 'newyork'} onClick={() => patch({ hqCityId: 'newyork' })}>New York</Chip><Chip on={c.hqCityId === 'johannesburg'} onClick={() => patch({ hqCityId: 'johannesburg' })}>Johannesburg</Chip><Chip on={c.hqCityId === 'seoul'} onClick={() => patch({ hqCityId: 'seoul' })}>Séoul</Chip></div>
        </div>
        <div className="pn">
          <div className="lbl">Abidjan, Côte d'Ivoire</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10, fontSize: 14}}>
            <div><span className="tag tc">Certain</span><div style={{marginTop: 6}}>Loyer du siège : $2 600 / mois</div></div>
            <div><span className="tag te">Estimé</span><div style={{marginTop: 6}}>Marché local : tier B</div></div>
            <div><span className="tag ti">Avantage</span><div style={{marginTop: 6}}>Coupé-décalé et afro-pop +10 %</div></div>
            <div><span className="tag tr_">Risque</span><div style={{marginTop: 6}}>Piratage élevé</div></div>
          </div>
        </div>
        <div className="sp" />
      </div>
      <div style={{position: 'absolute', left: 56, right: 56, bottom: 30, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 20}}>
        <span className="mut" style={{fontSize: 14}}>Tout est modifiable plus tard dans Équipe, sauf la ville du siège.</span>
        <a href="Hub.dc.html" className="btn" style={{height: 60}}>Commencer l'aventure</a>
      </div>
    </div>
  )
}
