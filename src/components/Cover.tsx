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
]
export const COVER_STYLES = ['Soleil', 'Vagues', 'Prisme', 'Anneaux', 'Rayures', 'Skyline', 'Grille', 'Éclat']

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
export const defaultCover = (seed: string): CoverT => { const h = hash(seed); return { style: h % COVER_STYLES.length, palette: (h >>> 8) % COVER_PALETTES.length } }

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
