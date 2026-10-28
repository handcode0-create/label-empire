import Avatar from '../../components/Avatar'
import { palierFor } from '../../data/world'
import { CAPITALS } from '../../engine/newGame'
import { useEffect, useState } from 'react'
import Chip from '../../components/Chip'
import { useGame } from '../../store/gameStore'

// Fichier généré par scripts/port-mockups.cjs depuis la maquette (NouvellePartie.dc.html).
const readFile = (f: File | undefined, cb: (d: string) => void) => { if (!f) return; if (f.size > 1_500_000) { useGame.getState().say('Image trop lourde (1,5 Mo maximum).', 'err'); return } const r = new FileReader(); r.onload = () => cb(String(r.result)); r.readAsDataURL(f) }
export default function NouvellePartie() {
  const c = useGame((st) => st.config)
  const patch = useGame((st) => st.patch)
  const cash = useGame((st) => st.cash)()
  const [pack, setPack] = useState<{ id: string; icon: string; name: string }[]>([])
  useEffect(() => { fetch('/logos/manifest.json').then((r) => r.json()).then(setPack).catch(() => setPack([])) }, [])
  const isImg = c.logoId.startsWith('data:') || c.logoId.startsWith('/logos/')
  return (
    <div className="scr">
      <div style={{position: 'absolute', left: 56, top: 36, right: 56, display: 'flex', alignItems: 'center', gap: 16}}>
        <a href="Menu.dc.html" className="btn s sm">Retour</a>
        <h1 className="h1">Nouvelle partie</h1>
        <div className="sp" />
        <span className="chip on">1 Identité</span><span className="chip">2 Compétences et siège</span>
      </div>
      <div style={{position: 'absolute', left: 56, top: 112, width: 430, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div className="pn cut">
          <div className="lbl">Votre label</div>
          <label htmlFor="nm" className="mut" style={{fontSize: 13, display: 'block', marginTop: 12}}>Nom du label</label>
          <input id="nm" className="in" style={{marginTop: 6, fontSize: 18, fontWeight: 700}} value={c.labelName} onChange={(e) => patch({ labelName: e.target.value })} />
          <div className="lbl" style={{marginTop: 18}}>Logo</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 10}}>
            <div role="button" tabIndex={0} onClick={() => patch({ logoId: 'diamant' })} className={'pn' + (c.logoId === 'diamant' ? ' sel' : '')} style={{height: 76, display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer'}}><div style={{width: 38, height: 38, background: 'linear-gradient(135deg,#FFC63D,#FF3D9A)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)'}} /></div>
            <div role="button" tabIndex={0} onClick={() => patch({ logoId: 'anneau' })} className={'pn' + (c.logoId === 'anneau' ? ' sel' : '')} style={{height: 76, display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer'}}><div style={{width: 38, height: 38, borderRadius: '50%', border: '7px solid #FF3D9A', boxShadow: '0 0 14px rgba(255,61,154,0.6)'}} /></div>
            <div role="button" tabIndex={0} onClick={() => patch({ logoId: 'hexagone' })} className={'pn' + (c.logoId === 'hexagone' ? ' sel' : '')} style={{height: 76, display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer'}}><div style={{width: 40, height: 40, background: 'linear-gradient(135deg,#35D3F0,#8B5CF6)', clipPath: 'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0 50%)'}} /></div>
            <div role="button" tabIndex={0} onClick={() => patch({ logoId: 'triangle' })} className={'pn' + (c.logoId === 'triangle' ? ' sel' : '')} style={{height: 76, display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer'}}><div style={{width: 38, height: 38, background: 'linear-gradient(135deg,#3DDC97,#35D3F0)', clipPath: 'polygon(50% 0,100% 100%,0 100%)'}} /></div>
            <div role="button" tabIndex={0} onClick={() => patch({ logoId: 'losange' })} className={'pn' + (c.logoId === 'losange' ? ' sel' : '')} style={{height: 76, display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer'}}><div style={{width: 38, height: 38, background: 'linear-gradient(135deg,#FF5470,#FFC63D)', borderRadius: 10, transform: 'rotate(45deg)'}} /></div>
            <div role="button" tabIndex={0} onClick={() => patch({ logoId: 'monogramme' })} className={'pn' + (c.logoId === 'monogramme' ? ' sel' : '')} style={{height: 76, display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer'}}><div className="disp" style={{fontSize: 30, color: '#FFC63D'}}>SR</div></div>
            <div role="button" tabIndex={0} onClick={() => patch({ logoId: 'blason' })} className={'pn' + (c.logoId === 'blason' ? ' sel' : '')} style={{height: 76, display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer'}}><div style={{width: 38, height: 38, background: 'linear-gradient(135deg,#8B5CF6,#FF3D9A)', clipPath: 'polygon(0 0,100% 0,100% 70%,50% 100%,0 70%)'}} /></div>
            <label className={'pn' + (c.logoId.startsWith('data:') ? ' sel' : '')} style={{cursor: 'pointer', height: 76, display: 'grid', placeItems: 'center', padding: 0, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#B3A6D9', boxShadow: 'inset 0 0 0 2px var(--ln)', background: 'transparent'}}>Importer<br />mon logo<input type="file" accept="image/*" hidden onChange={(e) => readFile(e.target.files?.[0], (d) => patch({ logoId: d }))} /></label>
          </div>
          <div className="lbl" style={{marginTop: 14}}>Logos du studio</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginTop: 8, maxHeight: 96, overflow: 'auto'}}>
            {pack.map((l) => <img key={l.id} src={'/logos/' + l.icon} alt={l.name} title={l.name} onClick={() => patch({ logoId: '/logos/' + l.icon })} style={{width: '100%', aspectRatio: '1', borderRadius: 8, cursor: 'pointer', boxShadow: c.logoId === '/logos/' + l.icon ? '0 0 0 2px #FF3D9A' : 'none'}} />)}
          </div>
        </div>
        <div className="pn">
          <div className="lbl">Réglages de la partie</div>
          <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}><Chip on={c.currency === 'USD'} onClick={() => patch({ currency: 'USD' })}>Dollar $</Chip><Chip on={c.currency === 'EUR'} onClick={() => patch({ currency: 'EUR' })}>Euro €</Chip><Chip on={c.currency === 'XOF'} onClick={() => patch({ currency: 'XOF' })}>Franc CFA</Chip></div>
          <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}><Chip on={c.difficulty === 'facile'} onClick={() => patch({ difficulty: 'facile' })}>Facile</Chip><Chip on={c.difficulty === 'normal'} onClick={() => patch({ difficulty: 'normal' })}>Normal</Chip><Chip on={c.difficulty === 'difficile'} onClick={() => patch({ difficulty: 'difficile' })}>Difficile</Chip></div>
        </div>
      </div>
      <div className="pn cut" style={{position: 'absolute', left: 510, top: 112, width: 470, height: 676}}>
        <div className="lbl">Fondateur du label</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14}}>
          <Avatar keyName={c.founderAvatar ?? (c.founderLook === 'm' ? 'story-joueur-m' : 'story-joueur')} src={c.founderPhoto} name={c.founderName} gradient="#FF3D9A,#8B5CF6" size={112} style={{boxShadow: '0 0 0 4px var(--ln), 0 0 30px rgba(255,61,154,0.4)', fontSize: 40}} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}><label className="btn s sm" style={{cursor: 'pointer'}}>Choisir une photo<input type="file" accept="image/*" hidden onChange={(e) => readFile(e.target.files?.[0], (d) => patch({ founderPhoto: d }))} /></label><span className="mut" style={{fontSize: 12}}>Choisissez un avatar dans la liste à droite, ou importez votre photo.</span></div>
        </div>
        <label htmlFor="fn" className="mut" style={{fontSize: 13, display: 'block', marginTop: 18}}>Nom complet</label>
        <input id="fn" className="in" style={{marginTop: 6}} value={c.founderName} onChange={(e) => patch({ founderName: e.target.value })} />
        <label htmlFor="nat" className="mut" style={{fontSize: 13, display: 'block', marginTop: 14}}>Nationalité</label>
        <input id="nat" className="in" style={{marginTop: 6}} value={c.nationality} onChange={(e) => patch({ nationality: e.target.value })} />
        <div className="lbl" style={{marginTop: 18}}>Genre musical principal</div>
        <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}><Chip on={c.mainGenre === 'Afro-pop'} onClick={() => patch({ mainGenre: 'Afro-pop' })}>Afro-pop</Chip><Chip on={c.mainGenre === 'Coupé-décalé'} onClick={() => patch({ mainGenre: 'Coupé-décalé' })}>Coupé-décalé</Chip><Chip on={c.mainGenre === 'Hip-hop'} onClick={() => patch({ mainGenre: 'Hip-hop' })}>Hip-hop</Chip><Chip on={c.mainGenre === 'R&B'} onClick={() => patch({ mainGenre: 'R&B' })}>R&amp;B</Chip><Chip on={c.mainGenre === 'Amapiano'} onClick={() => patch({ mainGenre: 'Amapiano' })}>Amapiano</Chip><Chip on={c.mainGenre === 'Pop'} onClick={() => patch({ mainGenre: 'Pop' })}>Pop</Chip><Chip on={c.mainGenre === 'Électro'} onClick={() => patch({ mainGenre: 'Électro' })}>Électro</Chip><Chip on={c.mainGenre === 'Rock'} onClick={() => patch({ mainGenre: 'Rock' })}>Rock</Chip></div>
        <div className="lbl" style={{marginTop: 18}}>Capital de départ</div>
        <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}>{(Object.keys(CAPITALS) as (keyof typeof CAPITALS)[]).map((k) => <Chip key={k} on={(c.capital ?? 'standard') === k} onClick={() => patch({ capital: k, startReputation: CAPITALS[k].reputation })}>{CAPITALS[k].label} · {compactUsd(CAPITALS[k].cash)}</Chip>)}</div>
        <div className="mut" style={{fontSize: 13, marginTop: 12}}>Réputation de départ : <b style={{color: '#FF7DBB'}}>{c.startReputation}</b> · {palierFor(c.startReputation).name}. Un capital plus élevé place le label plus haut dans le monde de la musique et débloque plus de marchés. Trésorerie de départ : <b style={{color: '#FFC63D'}}>${cash.toLocaleString('fr-FR')}</b>.</div>
      </div>
      <div style={{position: 'absolute', left: 1004, top: 112, width: 380, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div className="pn sel">
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><input id="art" type="checkbox" checked={c.alsoArtist} onChange={(e) => patch({ alsoArtist: e.target.checked })} style={{width: 26, height: 26, accentColor: '#FF3D9A'}} /><label htmlFor="art" className="h2" style={{fontSize: 22}}>Je suis aussi artiste</label></div>
          <div className="mut" style={{fontSize: 14, marginTop: 10}}>Vous serez le premier artiste du label : vous sortez vos titres, montez sur scène et apparaissez dans les classements. Vous recevrez des points de compétence d'artiste à l'étape suivante.</div>
        </div>
        <div className="pn cut">
          <div className="lbl">Aperçu</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 12}}>
            <div style={{width: 60, height: 60, display: 'grid', placeItems: 'center', background: '#2A1B4D', borderRadius: 14, overflow: 'hidden'}}>{isImg ? <img src={c.logoId} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <div style={{width: 30, height: 30, borderRadius: '50%', border: '6px solid #FF3D9A'}} />}</div>
            <div><div className="disp" style={{fontSize: 26, lineHeight: 1}}>{c.labelName}</div><div className="mut" style={{fontSize: 13}}>Fondé par {c.founderName} · {c.nationality} · {c.mainGenre.toLowerCase()}</div></div>
          </div>
          <div style={{display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap'}}><span className="tag ti">Réputation {c.startReputation}</span>{c.alsoArtist && <span className="tag te">Artiste fondateur</span>}<span className="tag tg">Cash {compactUsd(cash)}</span></div>
        </div>
        <div className="pn cut">
          <div className="lbl">Votre avatar</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 12}}>
            {FOUNDER_AVATARS.map((k) => {
              const on = (c.founderAvatar ?? (c.founderLook === 'm' ? 'story-joueur-m' : 'story-joueur')) === k && !c.founderPhoto
              return (
                <button key={k} type="button" aria-label={'Avatar ' + k} aria-pressed={on} onClick={() => patch({ founderAvatar: k, founderLook: k.endsWith('m') || /-m\d$/.test(k) ? 'm' : 'f', founderPhoto: undefined })} style={{padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%', boxShadow: on ? '0 0 0 3px #FF3D9A, 0 0 14px rgba(255,61,154,0.6)' : '0 0 0 2px var(--ln)'}}>
                  <Avatar keyName={k} name={k} gradient="#FF3D9A,#8B5CF6" size={48} />
                </button>
              )
            })}
          </div>
          <div className="mut" style={{fontSize: 12, marginTop: 10}}>Cet avatar vous représente dans les scènes, sur le Hub et dans les classements.</div>
        </div>
        <div className="sp" />
      </div>
      <div style={{position: 'absolute', left: 56, right: 56, bottom: 30, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 20}}>
        <span className="mut" style={{fontSize: 14}}>Étape suivante : répartir vos points et choisir la ville du siège.</span>
        <a href="NouvellePartie2.dc.html" className="btn" style={{height: 60}}>Suivant</a>
      </div>
    </div>
  )
}

const FOUNDER_AVATARS = ['story-joueur', 'story-joueur-m', ...['afrique-ouest', 'europe', 'amerique-nord', 'amerique-latine'].flatMap((r) => ['f1', 'f2', 'm1', 'm2'].map((v) => `${r}-${v}`))]
const compactUsd = (n: number) => n >= 1e9 ? '$1 Md' : n >= 1e6 ? '$' + n / 1e6 + ' M' : '$' + n / 1000 + ' k'
