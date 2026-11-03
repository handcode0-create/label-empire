import type { Cover as CoverT } from '../engine/types'

/** Palettes de pochettes : [fond haut, fond bas, accent, accent 2]. */
export const COVER_PALETTES: [string, string, string, string][] = [
  ['#2A0B4D', '#F43F9D', '#FFC63D', '#FFFFFF'],
  ['#07203F', '#1AA6B7', '#FFE29A', '#FFFFFF'],
  ['#3B0A0A', '#E4572E', '#FFD166', '#FFF3D6'],
  ['#0B2B1A', '#3DDC97', '#F2F7A1', '#FFFFFF'],
  ['#1A1033', '#8B5CF6', '#35D3F0', '#FFFFFF'],
  ['#2B1B00', '#E0A100', '#FFF1B8', '#2B1B00'],
  ['#101010', '#C8C8D4', '#F43F9D', '#FFFFFF'],
  ['#2B0B1F', '#FF7A8A', '#FFD9C2', '#FFFFFF'],
  ['#0A1F3D', '#3D6DF0', '#9CF0FF', '#FFFFFF'],
  ['#1F0A2B', '#B53DF0', '#FFC6F0', '#FFFFFF'],
  ['#0A2B2B', '#2FD6A6', '#E8FFB0', '#06241F'],
  ['#2B1A0A', '#F07A3D', '#FFE0B0', '#FFFFFF'],
  ['#141414', '#FF3D54', '#FFE14D', '#FFFFFF'],
  ['#0B0B2B', '#5A5AF0', '#FF9CF0', '#FFFFFF'],
]
/** Les 8 premiers styles et palettes servent aux pochettes par défaut (stables pour les sauvegardes existantes) ; les autres se choisissent dans le sélecteur. */
const BASE_STYLES = 8
const BASE_PALETTES = 8
export const COVER_STYLES = ['Soleil', 'Vagues', 'Prisme', 'Anneaux', 'Rayures', 'Skyline', 'Grille', 'Éclat', 'Vinyle', 'Étoiles', 'Montagnes', 'Palmiers', 'Égaliseur', 'Damier', 'Hexagones', 'Lune', 'Flamme', 'Couronne', 'Micro', 'Casque', 'Diamant', 'Éclair', 'Spirale', 'Confettis']

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
export const defaultCover = (seed: string): CoverT => { const h = hash(seed); return { style: h % BASE_STYLES, palette: (h >>> 8) % BASE_PALETTES } }

function wrap(text: string, max = 14): string[] {
  const out: string[] = []; let cur = ''
  for (const w of text.split(' ')) { if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w } else cur = (cur + ' ' + w).trim() }
  if (cur) out.push(cur)
  return out.slice(0, 3)
}

function Art({ style, c, id }: { style: number; c: [string, string, string, string]; id: string }) {
  const [, , a, w] = c
  switch (style) {
    case 0: return <><circle cx={100} cy={96} r={46} fill={a} /><rect x={0} y={118} width={200} height={82} fill="#000" opacity={0.22} />{[126, 140, 156].map((y, i) => <rect key={y} x={30 + i * 12} y={y} width={140 - i * 24} height={4} fill={w} opacity={0.35} />)}</>
    case 1: return <>{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-10 ${95 + i * 20} Q 25 ${75 + i * 20} 60 ${95 + i * 20} T 130 ${95 + i * 20} T 210 ${95 + i * 20}`} fill="none" stroke={i % 2 ? w : a} strokeWidth={5} opacity={0.75 - i * 0.1} />)}</>
    case 2: return <><polygon points="100,34 164,150 36,150" fill="none" stroke={w} strokeWidth={4} /><polygon points="100,34 164,150 100,150" fill={a} opacity={0.7} /><polygon points="100,34 36,150 100,150" fill="#000" opacity={0.25} /></>
    case 3: return <>{[58, 42, 26, 12].map((r, i) => <circle key={r} cx={100} cy={96} r={r} fill={i % 2 ? 'none' : a} stroke={w} strokeWidth={3} opacity={0.85} />)}</>
    case 4: return <>{Array.from({ length: 10 }, (_, i) => <rect key={i} x={-10 + i * 24} y={-10} width={10} height={220} fill={i % 2 ? a : w} opacity={0.35} transform={`rotate(18 100 100)`} />)}</>
    case 5: return <><rect x={0} y={150} width={200} height={50} fill="#000" opacity={0.35} />{[[16, 40], [44, 66], [76, 52], [108, 80], [140, 46], [168, 70]].map(([x, h], i) => <rect key={i} x={x} y={150 - h} width={24} height={h} fill={i % 2 ? '#000' : a} opacity={i % 2 ? 0.4 : 0.8} />)}<circle cx={150} cy={52} r={16} fill={w} opacity={0.85} /></>
    case 6: return <>{Array.from({ length: 8 }, (_, i) => <line key={'h' + i} x1={0} x2={200} y1={50 + i * 14} y2={50 + i * 14} stroke={a} strokeWidth={1.5} opacity={0.6} />)}{Array.from({ length: 9 }, (_, i) => <line key={'v' + i} x1={100 + (i - 4) * 4} x2={(i - 4) * 55 + 100} y1={50} y2={160} stroke={a} strokeWidth={1.5} opacity={0.6} />)}<circle cx={100} cy={50} r={22} fill={w} opacity={0.9} /></>
    case 8: return <><circle cx={100} cy={92} r={56} fill="#0B0B12" />{[48, 40, 32, 24].map((r) => <circle key={r} cx={100} cy={92} r={r} fill="none" stroke={w} strokeWidth={1} opacity={0.3} />)}<circle cx={100} cy={92} r={17} fill={a} /><circle cx={100} cy={92} r={3} fill="#0B0B12" /><path d="M60 60 A 56 56 0 0 1 100 36" stroke={w} strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round" /></>
    case 9: return <>{[[40, 40, 12], [150, 34, 9], [100, 70, 22], [60, 112, 9], [160, 100, 13], [30, 80, 6], [126, 124, 8], [90, 20, 6]].map(([x, y, r], i) => <polygon key={i} fill={i % 2 ? w : a} opacity={0.9} points={Array.from({ length: 10 }, (_, k) => { const ang = -Math.PI / 2 + (k * Math.PI) / 5; const rr = k % 2 ? r * 0.45 : r; return `${x + Math.cos(ang) * rr},${y + Math.sin(ang) * rr}` }).join(' ')} />)}</>
    case 10: return <><circle cx={140} cy={52} r={22} fill={a} /><polygon points="0,150 50,70 96,150" fill="#000" opacity={0.35} /><polygon points="50,150 112,56 190,150" fill={w} opacity={0.5} /><polygon points="112,56 128,82 112,74 98,86" fill="#fff" opacity={0.85} /><polygon points="110,150 160,96 210,150" fill="#000" opacity={0.4} /></>
    case 11: return <><circle cx={100} cy={92} r={40} fill={a} opacity={0.9} /><path d="M104 150 Q 98 110 104 70" stroke="#000" strokeWidth={6} fill="none" opacity={0.7} />{[[-70, -20], [-45, -45], [-10, -55], [30, -40], [55, -12]].map(([dx, dy], i) => <path key={i} d={`M104 70 Q ${104 + dx / 2} ${70 + dy - 14} ${104 + dx} ${70 + dy + 22}`} stroke={w} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85} />)}<rect x={0} y={138} width={200} height={12} fill="#000" opacity={0.3} /></>
    case 12: return <>{Array.from({ length: 17 }, (_, i) => { const h = 20 + Math.abs(Math.sin(i * 1.3) * 80) + (i % 3) * 8; return <rect key={i} x={14 + i * 10.5} y={100 - h / 2} width={6} height={h} rx={3} fill={i % 2 ? w : a} opacity={0.9} /> })}</>
    case 13: return <>{Array.from({ length: 6 }, (_, r) => Array.from({ length: 8 }, (_, q) => (r + q) % 2 ? <rect key={r + '-' + q} x={q * 25} y={r * 25} width={25} height={25} fill={(r + q) % 4 === 1 ? a : w} opacity={0.5} /> : null))}</>
    case 14: return <>{Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, q) => { const cx = 20 + q * 40 + (r % 2) * 20, cy = 30 + r * 34; return <polygon key={r + '-' + q} points={Array.from({ length: 6 }, (_, k) => `${cx + Math.cos((k * Math.PI) / 3) * 19},${cy + Math.sin((k * Math.PI) / 3) * 19}`).join(' ')} fill={(r + q) % 3 === 0 ? a : 'none'} stroke={w} strokeWidth={2} opacity={0.75} /> }))}</>
    case 15: return <><defs><mask id={id + 'm'}><rect width={200} height={200} fill="#fff" /><circle cx={118} cy={80} r={46} fill="#000" /></mask></defs><circle cx={92} cy={92} r={52} fill={a} mask={`url(#${id}m)`} />{[[150, 40, 3], [40, 40, 2], [160, 118, 2.5], [60, 128, 2]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={w} />)}</>
    case 16: return <><path d="M100 24 C 132 60 148 80 140 108 C 134 132 112 142 100 142 C 84 142 62 130 60 104 C 58 84 76 74 82 52 C 90 66 94 54 100 24 Z" fill={a} /><path d="M100 70 C 118 92 126 104 120 120 C 116 132 104 136 100 136 C 90 136 80 128 80 116 C 80 104 94 98 100 70 Z" fill={w} opacity={0.85} /></>
    case 17: return <><path d="M34 128 L 24 62 L 68 94 L 100 40 L 132 94 L 176 62 L 166 128 Z" fill={a} /><rect x={34} y={128} width={132} height={12} fill={w} opacity={0.8} />{[[24, 62], [100, 40], [176, 62]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={8} fill={w} />)}</>
    case 18: return <><rect x={82} y={36} width={36} height={66} rx={18} fill={a} /><rect x={82} y={36} width={36} height={66} rx={18} fill="none" stroke={w} strokeWidth={3} />{[52, 62, 72, 82].map((y) => <line key={y} x1={86} x2={114} y1={y} y2={y} stroke={w} strokeWidth={2} opacity={0.6} />)}<path d="M66 84 Q 66 120 100 120 Q 134 120 134 84" fill="none" stroke={w} strokeWidth={4} /><line x1={100} x2={100} y1={120} y2={140} stroke={w} strokeWidth={4} /><line x1={80} x2={120} y1={140} y2={140} stroke={w} strokeWidth={5} strokeLinecap="round" /></>
    case 19: return <><path d="M44 110 L 44 90 A 56 56 0 0 1 156 90 L 156 110" fill="none" stroke={w} strokeWidth={9} strokeLinecap="round" /><rect x={30} y={96} width={28} height={44} rx={10} fill={a} /><rect x={142} y={96} width={28} height={44} rx={10} fill={a} /><rect x={36} y={104} width={8} height={28} rx={4} fill="#000" opacity={0.3} /><rect x={156} y={104} width={8} height={28} rx={4} fill="#000" opacity={0.3} /></>
    case 20: return <><polygon points="60,52 140,52 172,88 100,150 28,88" fill={a} opacity={0.9} /><polygon points="60,52 100,88 28,88" fill={w} opacity={0.5} /><polygon points="140,52 172,88 100,88" fill="#000" opacity={0.2} /><polygon points="28,88 100,88 100,150" fill="#000" opacity={0.3} /><polygon points="100,88 172,88 100,150" fill={w} opacity={0.25} /></>
    case 21: return <><circle cx={100} cy={92} r={58} fill={a} opacity={0.35} /><polygon points="112,24 62,98 96,98 84,150 142,70 106,70" fill={w} /><polygon points="112,24 62,98 96,98 84,150 142,70 106,70" fill="none" stroke={a} strokeWidth={3} strokeLinejoin="round" /></>
    case 22: return <><path d={Array.from({ length: 90 }, (_, i) => { const t = i / 6; const r = 4 + t * 4.4; return `${i ? 'L' : 'M'}${100 + Math.cos(t) * r},${92 + Math.sin(t) * r}` }).join(' ')} fill="none" stroke={a} strokeWidth={5} strokeLinecap="round" /><circle cx={100} cy={92} r={5} fill={w} /></>
    case 23: return <>{Array.from({ length: 28 }, (_, i) => { const x = (i * 53) % 190 + 6, y = (i * 37) % 130 + 8; const sz = 5 + (i % 4) * 3; return i % 3 === 0 ? <circle key={i} cx={x} cy={y} r={sz / 2} fill={i % 2 ? w : a} /> : i % 3 === 1 ? <rect key={i} x={x} y={y} width={sz} height={sz} fill={i % 2 ? a : w} transform={`rotate(${i * 25} ${x} ${y})`} /> : <polygon key={i} points={`${x},${y - sz} ${x + sz},${y + sz} ${x - sz},${y + sz}`} fill={i % 2 ? w : a} opacity={0.9} /> })}</>
    default: return <>{Array.from({ length: 14 }, (_, i) => { const ang = (i / 14) * Math.PI * 2; return <line key={i} x1={100} y1={96} x2={100 + Math.cos(ang) * 78} y2={96 + Math.sin(ang) * 78} stroke={i % 2 ? w : a} strokeWidth={4} strokeLinecap="round" opacity={0.8} /> })}<circle cx={100} cy={96} r={14} fill={a} /><clipPath id={id} /></>
  }
}

/** Pochette dessinée (SVG) : style et palette choisis, sinon déduits du titre. */
export default function Cover({ title, artist, kind, cover, size = 120, radius = 14 }: { title: string; artist?: string; kind?: 'Single' | 'EP' | 'Album'; cover?: CoverT; size?: number; radius?: number }) {
  const cv = cover ?? defaultCover(title + (artist ?? ''))
  const c = COVER_PALETTES[cv.palette % COVER_PALETTES.length]
  const id = 'cv' + hash(title + cv.style + cv.palette)
  const lines = wrap(title.toUpperCase())
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={`Pochette de ${title}`} style={{ borderRadius: radius, flex: 'none', display: 'block', boxShadow: '0 6px 18px rgba(0,0,0,.4)' }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c[0]} /><stop offset="1" stopColor={c[1]} /></linearGradient></defs>
      <rect width={200} height={200} fill={`url(#${id})`} />
      <Art style={cv.style % COVER_STYLES.length} c={c} id={id + 'x'} />
      <rect x={0} y={150} width={200} height={50} fill="#000" opacity={0.28} />
      {lines.map((l, i) => <text key={i} x={10} y={168 + i * 12 - (lines.length - 1) * 4} fill={c[3]} fontSize={lines.length > 2 ? 11 : 14} fontWeight={800} fontFamily="'DM Sans',system-ui,sans-serif" letterSpacing={0.5}>{l}</text>)}
      {artist && <text x={10} y={16} fill={c[3]} opacity={0.9} fontSize={9} fontWeight={700} fontFamily="'DM Sans',system-ui,sans-serif" letterSpacing={1.5}>{artist.toUpperCase().slice(0, 22)}</text>}
      {kind && <text x={190} y={16} fill={c[2]} textAnchor="end" fontSize={9} fontWeight={800} fontFamily="'DM Sans',system-ui,sans-serif" letterSpacing={1.5}>{kind.toUpperCase()}</text>}
    </svg>
  )
}

/** Sélecteur de style et de palette (pastilles cliquables, pas de liste déroulante). */
export function CoverPicker({ title, artist, kind, value, onChange }: { title: string; artist?: string; kind?: 'Single' | 'EP' | 'Album'; value: CoverT; onChange: (c: CoverT) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {COVER_STYLES.map((s, i) => <span key={s} className={'chip' + (value.style === i ? ' on' : '')} role="button" onClick={() => onChange({ ...value, style: i })}>{s}</span>)}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {COVER_PALETTES.map((p, i) => <span key={i} role="button" aria-label={`Palette ${i + 1}`} onClick={() => onChange({ ...value, palette: i })} style={{ width: 26, height: 26, borderRadius: 13, cursor: 'pointer', background: `linear-gradient(135deg,${p[0]},${p[1]})`, boxShadow: value.palette === i ? '0 0 0 3px #fff' : 'inset 0 0 0 2px rgba(255,255,255,.25)' }} />)}
      </div>
      <Cover title={title} artist={artist} kind={kind} cover={value} size={64} radius={8} />
    </div>
  )
}
