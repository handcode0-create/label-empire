"""Branche les planches converties sur le moteur (exécuté une fois ; les .tsx sont ensuite maintenus à la main)."""
import os, re
D="src/screens/mock/"
def rd(f): return open(D+f).read()
def wr(f,s): open(D+f,"w").write(s)

# 1. Hud partout
for f in os.listdir(D):
    s=rd(f)
    if '<header className="hud">' in s:
        s=re.sub(r'<header className="hud">.*?</header>','<Hud />',s,flags=re.S)
        s=s.replace("export default function","import Hud from '../../components/Hud'\n\nexport default function",1) if "import Hud" not in s else s
        wr(f,s)

# 2. Nouvelle partie, étape 1
s=rd("NouvellePartie.tsx")
imp="import Chip from '../../components/Chip'\nimport { useGame } from '../../store/gameStore'\n\n"
s=s.replace("export default function NouvellePartie() {\n","export default function NouvellePartie() {\n  const c = useGame((st) => st.config)\n  const patch = useGame((st) => st.patch)\n  const cash = useGame((st) => st.cash)()\n",1)
s=imp+s
def chip(label,cond,act):
    return f"<Chip on={{{cond}}} onClick={{() => {act}}}>{label}</Chip>"
for lab,v in [("Dollar $","USD"),("Euro €","EUR"),("Franc CFA","XOF")]:
    s=re.sub(rf'<span className="chip( on)?">{re.escape(lab)}</span>',chip(lab,f"c.currency === '{v}'",f"patch({{ currency: '{v}' }})"),s)
for lab in ["Facile","Normal","Difficile"]:
    s=re.sub(rf'<span className="chip( on)?">{lab}</span>',chip(lab,f"c.difficulty === '{lab.lower()}'",f"patch({{ difficulty: '{lab.lower()}' }})"),s)
for g in ["Afro-pop","Coupé-décalé","Hip-hop","R&amp;B","Amapiano","Pop","Électro","Rock"]:
    real=g.replace("&amp;","&")
    s=re.sub(rf'<span className="chip( on)?">{re.escape(g)}</span>',chip(g,f"c.mainGenre === '{real}'",f"patch({{ mainGenre: '{real}' }})"),s)
s=s.replace('defaultValue="Savane Records"','value={c.labelName} onChange={(e) => patch({ labelName: e.target.value })}')
s=s.replace('<input id="fn" className="in" style={{marginTop: 6}} defaultValue="Smith Junior" />','<input id="fn" className="in" style={{marginTop: 6}} value={c.founderName} onChange={(e) => patch({ founderName: e.target.value })} />')
s=s.replace('defaultValue="Ivoirienne ▾"','value={c.nationality} onChange={(e) => patch({ nationality: e.target.value })}')
s=re.sub(r'<input id="art" type="checkbox" defaultChecked','<input id="art" type="checkbox" checked={c.alsoArtist} onChange={(e) => patch({ alsoArtist: e.target.checked })}',s)
s=s.replace('>Savane Records</div><div className="mut"','>{c.labelName}</div><div className="mut"')
s=s.replace('>SJ</div>','>{c.founderName.split(/\\s+/).map((w) => w[0]).join(\'\').slice(0, 2).toUpperCase()}</div>')
s=s.replace('>15</b></div>','>{c.startReputation}</b></div>',1)
s=s.replace('<div className="sl" style={{marginTop: 14}}><i style={{width: \'30%\'}} /><u style={{left: \'30%\'}} /></div>',
 '<div style={{position: \'relative\', marginTop: 14}}><div className="sl"><i style={{width: `${c.startReputation / 0.5}%`}} /><u style={{left: `${c.startReputation / 0.5}%`}} /></div><input type="range" aria-label="Réputation de départ" min={0} max={50} value={c.startReputation} onChange={(e) => patch({ startReputation: +e.target.value })} style={{position: \'absolute\', left: 0, top: -10, width: \'100%\', height: 28, opacity: 0, cursor: \'pointer\'}} /></div>')
s=s.replace("<b style={{color: '#FFC63D'}}>$120 000</b> à 15.","<b style={{color: '#FFC63D'}}>${cash.toLocaleString('fr-FR')}</b> à {c.startReputation}.")
wr("NouvellePartie.tsx",s)

# 3. Étape 2
s=rd("NouvellePartie2.tsx")
labels={"staffSkills":[("Négociation","negociation"),("Repérage","reperage"),("Production","production"),("Marketing","marketing"),("Finance","finance"),("Réseau","reseau")],
        "artistSkills":[("Voix","voix"),("Écriture","ecriture"),("Charisme","charisme"),("Scène","scene"),("Créativité","creativite"),("Endurance","endurance")]}
for g,l in labels.items():
    for lab,k in l:
        pat=rf"<div style=\{{\{{display: 'grid', gridTemplateColumns: '130px 30px 1fr 30px 40px'[^\n]*?<b>{lab}</b>.*?textAlign: 'right'\}}\}}>\d+</b></div>"
        s,n=re.subn(pat,f'<SkillRow group="{g}" k="{k}" label="{lab}" />',s,count=1,flags=re.S)
        assert n==1,(lab)
s=s.replace("export default function NouvellePartie2() {\n","export default function NouvellePartie2() {\n  const c = useGame((st) => st.config)\n  const patch = useGame((st) => st.patch)\n",1)
s="import Chip from '../../components/Chip'\nimport SkillRow from '../../components/SkillRow'\nimport { sum, useGame } from '../../store/gameStore'\n\n"+s
# compteurs
s=s.replace(">10 / 10</b>",">{sum(c.staffSkills)} / 10</b>",1).replace(">10 / 10</b>",">{sum(c.artistSkills)} / 10</b>",1)
for lab,i in [("Abidjan","abidjan"),("Lagos","lagos"),("Paris","paris"),("New York","newyork"),("Johannesburg","johannesburg"),("Séoul","seoul")]:
    s=re.sub(rf'<span className="chip( on)?">{lab}</span>',chip(lab,f"c.hqCityId === '{i}'",f"patch({{ hqCityId: '{i}' }})"),s)
wr("NouvellePartie2.tsx",s)
print("ok")
