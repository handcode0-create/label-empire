import Avatar from '../../components/Avatar'
import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { TITLE_THEMES, generateTitle } from '../../data/titles'
import { rivalTitles } from '../../engine/rivals'
import { GENRES, cityById } from '../../data/world'
import { createRng } from '../../engine/rng'
import { featBonus, featFee } from '../../engine/production'
import { visibleCandidates } from '../../engine/scouting'
import { EXTERNAL_WRITER_COST, lyricsEstimate, words, writeSong } from '../../engine/production'
import { useGame } from '../../store/gameStore'
import {usd} from '../../lib'

const IDEAS = ["Sous le ciel d'Abidjan, le soir se lève doux", 'Mes rêves dans mes poches, des étoiles à genoux', 'On danse jusqu’au matin, la ville nous appartient', 'Même quand tout s’éteint, ta voix reste allumée', 'Le rythme dans mes veines, la rue sous mes pieds', 'Je porte mes racines comme une couronne', 'Un jour ils chanteront ce refrain avec nous', 'La route est longue mais le cœur est lourd d’espoir']
const STEPS = [['Ecriture', '1 Écrire'], ['Studio', '2 Enregistrer'], ['Mixage', '3 Mixer'], ['Sortie', '4 Sortir']]
const cityLabel = (id: string) => cityById(id).name
const col = (v: number) => (v >= 75 ? 'gr' : v >= 60 ? 'cy' : v >= 45 ? 'gd' : 'rd')

export default function Ecriture() {
  const g = useGame((s) => s.game)!
  const { sel, run, select, go } = useGame()
  const first = g.artists.find((a) => a.id === sel.artistId) ?? g.artists[0]
  const [artistId, setArtistId] = useState(first?.id ?? '')
  const artist = g.artists.find((a) => a.id === artistId) ?? first
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState(artist?.genre ?? 'Afro-pop')
  const [theme, setTheme] = useState('Amour')
  const [lang, setLang] = useState('français')
  const [mood, setMood] = useState('Solaire')
  const [writer, setWriter] = useState<'artiste' | 'externe'>('artiste')
  const [lyrics, setLyrics] = useState('')
  const [feat, setFeat] = useState<{ kind: 'label' | 'externe'; id: string } | null>(null)
  const [featOpen, setFeatOpen] = useState(false)
  const genres = [...new Set([artist?.genre ?? 'Afro-pop', ...GENRES.slice(0, 5)])].slice(0, 4)
  const est = lyricsEstimate(g, { artistId, lyrics, writer, theme })
  const lines = lyrics.split('\n')
  const add = (t: string) => setLyrics((l) => (l.trim() ? l.replace(/\n*$/, '\n') : '') + t)
  const idea = () => add(IDEAS[Math.floor(Math.random() * IDEAS.length)])
  const partners = g.artists.filter((a) => a.id !== artistId)
  const externals = visibleCandidates(g).filter((a) => a.id !== artistId).slice(0, 8)
  const featArtist = feat ? (feat.kind === 'label' ? g.artists : g.pool).find((a) => a.id === feat.id) : undefined
  const featCost = featArtist && feat?.kind === 'externe' ? featFee(featArtist) : 0
  const autoTitle = () => setTitle(generateTitle(createRng((Date.now() ^ (title.length * 7919)) >>> 0), { theme, mood, lang, genre }, [...g.songs.map((x) => x.title), ...rivalTitles()]))
  const saturated = g.songs.slice(-4).filter((s) => s.theme === theme).length >= 2
  const submit = () => {
    const ok = run((s) => writeSong(s, { title, artistId, genre, theme, lang, mood, lyrics, writer, feat: feat ?? undefined }))
    if (ok) { const id = useGame.getState().game!.songs.slice(-1)[0].id; select({ songId: id, artistId }); go('Studio') }
  }
  const Chips = ({ list, v, set }: { list: string[]; v: string; set: (x: string) => void }) => <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8}}>{list.map((x) => <span key={x} className={'chip' + (x === v ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => set(x)}>{x}</span>)}</div>
  return (
    <div className="scr">
      <Dock active="studio" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 330, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>{STEPS.map(([s, l], i) => <a key={s} href={s + '.dc.html'} className={'chip' + (i === 0 ? ' on' : '')}>{l}</a>)}<a href="Projets.dc.html" className="chip">EP & albums</a></div>
          <div className="pn cut">
            <label htmlFor="tt" className="lbl">Titre</label>
            <div style={{display: 'flex', gap: 8, marginTop: 8}}>
              <input id="tt" className="in" style={{fontWeight: 700}} value={title} placeholder="Titre de la chanson" onChange={(e) => setTitle(e.target.value)} />
              <button type="button" className="btn g sm" aria-label="Générer un titre automatiquement" title="Générer un titre selon le thème, la langue et l'ambiance" style={{height: 48, padding: '0 14px', flex: 'none'}} onClick={autoTitle}>✦ Auto</button>
            </div>
            <div className="lbl" style={{marginTop: 14}}>Genre</div><Chips list={genres} v={genre} set={setGenre} />
            <div className="lbl" style={{marginTop: 14}}>Thème</div><Chips list={TITLE_THEMES} v={theme} set={setTheme} />
            <div className="lbl" style={{marginTop: 14}}>Langue</div><Chips list={['français', 'nouchi', 'anglais']} v={lang} set={setLang} />
            <div className="lbl" style={{marginTop: 14}}>Ambiance</div><Chips list={['Mélancolique', 'Solaire', 'Intense']} v={mood} set={setMood} />
          </div>
          <div className="pn">
            <div className="lbl">Qui écrit ?</div>
            {g.artists.map((a) => (
              <div key={a.id} className="row" onClick={() => { setArtistId(a.id); setWriter('artiste') }} style={{gridTemplateColumns: '1fr 70px', cursor: 'pointer'}}><div><b>{a.stageName}</b><div className="mut" style={{fontSize: 13}}>Écriture {Math.round(a.skills.ecriture)}</div></div><span className={'tag ' + (a.id === artistId && writer === 'artiste' ? 'tg' : 'te')}>{a.id === artistId && writer === 'artiste' ? 'Choisi' : 'Option'}</span></div>
            ))}
            <div className="row" onClick={() => setWriter('externe')} style={{gridTemplateColumns: '1fr 70px', cursor: 'pointer'}}><div><b>Auteur externe</b><div className="mut" style={{fontSize: 13}}>+8 qualité · {usd(EXTERNAL_WRITER_COST)}</div></div><span className={'tag ' + (writer === 'externe' ? 'tg' : 'te')}>{writer === 'externe' ? 'Choisi' : 'Option'}</span></div>
          </div>
        </div>
        <div className="pn cut" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Paroles</span><span className="sp" /><span className="tag ti">{artist ? `Pour ${artist.stageName}` : 'Aucun artiste'}</span></div>
          <div style={{flex: 1, marginTop: 12, padding: 16, borderRadius: 12, background: '#150C2A', boxShadow: 'inset 0 0 0 1px var(--ln)', overflow: 'auto', display: 'flex', gap: 14}}>
            <div className="mut" style={{width: 22, textAlign: 'right', fontSize: 13, lineHeight: '25px'}}>{lines.map((_, i) => <div key={i}>{i + 1}</div>)}</div>
            <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder={'Écrivez vos paroles ici, une ligne par vers.\nAstuce : « [refrain] » améliore le potentiel du refrain.'} spellCheck={false} style={{flex: 1, resize: 'none', background: 'transparent', border: 0, outline: 0, color: 'inherit', font: 'inherit', fontSize: 17, lineHeight: '25px', minHeight: '100%'}} />
          </div>
          <div style={{display: 'flex', gap: 10, marginTop: 12}}><a href="Ecriture.dc.html" className="btn s sm" onClick={(e) => { e.preventDefault(); idea() }}>Générer une idée</a><a href="Ecriture.dc.html" className="btn s sm" onClick={(e) => { e.preventDefault(); add('[refrain]\n' + IDEAS[Math.floor(Math.random() * IDEAS.length)]) }}>Ajouter un refrain</a><a href="Ecriture.dc.html" className="btn s sm" onClick={(e) => { e.preventDefault(); add(IDEAS[Math.floor(Math.random() * IDEAS.length)] + '\n' + IDEAS[Math.floor(Math.random() * IDEAS.length)]) }}>Ajouter un couplet</a><div className="sp" /><span className="mut" style={{fontSize: 13, alignSelf: 'center'}}>{words(lyrics)} mots · {lyrics.split('\n').filter((l) => l.trim()).length} lignes</span></div>
        </div>
        <div style={{width: 330, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div className="pn"><div className="lbl">Qualité du texte</div><div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12}}>
            {([['Écriture', est.ecriture], ['Originalité', est.originalite], ['Cohérence', est.coherence], ['Potentiel refrain', est.refrain]] as const).map(([l, v]) => <div key={l} style={{display: 'grid', gridTemplateColumns: '120px 1fr 34px', gap: 10, alignItems: 'center', fontSize: 14}}><span>{l}</span><div className={'mt ' + col(v)}><i style={{width: v + '%'}} /></div><b>{v}</b></div>)}
          </div></div>
          <div className="pn">
            <div style={{display: 'flex', alignItems: 'center'}}><span className="lbl">Featuring</span><span className="sp" />{feat ? <span className="chip on" onClick={() => setFeat(null)}>Retirer</span> : <span className="chip" onClick={() => setFeatOpen(!featOpen)}>{featOpen ? 'Fermer' : 'Ajouter un feat'}</span>}</div>
            {featArtist && <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 10}}><Avatar artist={featArtist} size={40} /><div style={{flex: 1}}><b>{featArtist.stageName}</b><div className="mut" style={{fontSize: 12}}>{cityLabel(featArtist.originCityId)} · +{featBonus(featArtist)} qualité · {feat?.kind === 'externe' ? `${usd(featCost)} + 12 % des revenus` : 'artiste du label'}</div></div></div>}
            {!featArtist && !featOpen && <div className="mut" style={{fontSize: 13, marginTop: 8}}>Un duo apporte de la qualité et l'audience du partenaire dans sa ville.</div>}
            {featOpen && !feat && (
              <div style={{marginTop: 8, maxHeight: 190, overflow: 'auto'}}>
                {partners.map((a) => <div key={a.id} className="row" style={{gridTemplateColumns: '1fr auto', cursor: 'pointer'}} onClick={() => { setFeat({ kind: 'label', id: a.id }); setFeatOpen(false) }}><div><b>{a.stageName}</b><div className="mut" style={{fontSize: 12}}>Label · +{featBonus(a)} qualité · gratuit</div></div><span className="tag tg">Choisir</span></div>)}
                {externals.map((a) => <div key={a.id} className="row" style={{gridTemplateColumns: '1fr auto', cursor: 'pointer'}} onClick={() => { setFeat({ kind: 'externe', id: a.id }); setFeatOpen(false) }}><div><b>{a.stageName}</b><div className="mut" style={{fontSize: 12}}>{cityLabel(a.originCityId)} · +{featBonus(a)} qualité · {usd(featFee(a))}</div></div><span className="tag te">Inviter</span></div>)}
                {partners.length + externals.length === 0 && <div className="mut" style={{fontSize: 13}}>Aucun partenaire disponible : découvrez des artistes.</div>}
              </div>
            )}
          </div>
          <div className="pn"><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 6}}>Durée : 1 semaine{writer === 'externe' || featCost ? ' · ' + usd((writer === 'externe' ? EXTERNAL_WRITER_COST : 0) + featCost) : ''}</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 6}}>Qualité du texte {est.ecriture}</div></div>
              <div><span className="tag ti">Incertain</span><div style={{marginTop: 6}}>Effet sur le public</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 6}}>{saturated ? 'Thème déjà saturé' : 'Faible'}</div></div></div></div>
          <div className="sp" />
          <a href="Studio.dc.html" className="btn" style={{height: 60}} onClick={(e) => { e.preventDefault(); submit() }}>Passer à l'enregistrement</a>
          {g.songs.some((s) => s.stage === 'written') && <a href="Studio.dc.html" className="btn s" style={{height: 44}}>Reprendre un titre déjà écrit</a>}
        </div>
      </div>
    </div>
  )
}
