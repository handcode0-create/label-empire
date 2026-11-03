import { useId } from 'react'
import type { AwardCategory } from '../engine/types'

export type Metal = 'or' | 'argent' | 'bronze'
const METALS: Record<Metal, [string, string, string]> = {
  or: ['#FFF1B0', '#FFC63D', '#B8780A'],
  argent: ['#FFFFFF', '#C9D6F2', '#6F7BA0'],
  bronze: ['#FFD9B0', '#D98A4A', '#7A3E14'],
}

/** Trophées dessinés en SVG : coupe (titre), étoile (artiste), disque (album), flamme (révélation). */
export function Trophy({ kind, metal = 'or', size = 120, label }: { kind: AwardCategory; metal?: Metal; size?: number; label?: string }) {
  const id = 'tr' + useId().replace(/:/g, '')
  const [hi, mid, lo] = METALS[metal]
  const g = `url(#${id}g)`
  return (
    <svg viewBox="0 0 120 140" width={size} height={size * 140 / 120} role="img" aria-label={label ?? `Trophée ${kind}`} style={{ display: 'block', flex: 'none', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,.5))' }}>
      <defs>
        <linearGradient id={id + 'g'} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={hi} /><stop offset=".5" stopColor={mid} /><stop offset="1" stopColor={lo} /></linearGradient>
        <linearGradient id={id + 'b'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2570" /><stop offset="1" stopColor="#140C2A" /></linearGradient>
      </defs>
      {/* socle */}
      <rect x={30} y={116} width={60} height={14} rx={3} fill={`url(#${id}b)`} />
      <rect x={30} y={116} width={60} height={3} fill={mid} opacity={0.9} />
      <rect x={52} y={104} width={16} height={14} fill={g} />
      {kind === 'titre' && (<>
        <path d="M34 22 H86 V52 C86 74 74 88 60 90 C46 88 34 74 34 52 Z" fill={g} />
        <path d="M34 30 C14 30 14 58 36 62 M86 30 C106 30 106 58 84 62" fill="none" stroke={g} strokeWidth={6} strokeLinecap="round" />
        <rect x={54} y={88} width={12} height={18} fill={g} />
        <path d="M42 28 V52 C42 66 50 76 58 80" stroke="#fff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.55} />
        <text x={60} y={60} textAnchor="middle" fontSize={20} fontWeight={800} fill={lo} fontFamily="'Rajdhani',sans-serif">♪</text>
      </>)}
      {kind === 'artiste' && (<>
        <polygon fill={g} stroke={lo} strokeWidth={1.5} strokeLinejoin="round" points={Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + (k * Math.PI) / 5; const r = k % 2 ? 22 : 50; return `${60 + Math.cos(a) * r},${58 + Math.sin(a) * r}` }).join(' ')} />
        <polygon fill="#fff" opacity={0.35} points="60,12 68,42 60,58 52,42" />
        <rect x={54} y={88} width={12} height={18} fill={g} />
      </>)}
      {kind === 'album' && (<>
        <circle cx={60} cy={56} r={40} fill="#0B0B12" stroke={g} strokeWidth={5} />
        {[32, 26, 20].map((r) => <circle key={r} cx={60} cy={56} r={r} fill="none" stroke={mid} strokeWidth={0.8} opacity={0.5} />)}
        <circle cx={60} cy={56} r={13} fill={g} /><circle cx={60} cy={56} r={2.5} fill="#0B0B12" />
        <path d="M30 40 A 36 36 0 0 1 56 20" stroke="#fff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.45} />
        <rect x={54} y={94} width={12} height={12} fill={g} />
      </>)}
      {kind === 'revelation' && (<>
        <path d="M60 14 C82 40 92 56 84 74 C78 88 66 92 60 92 C50 92 38 86 36 70 C34 56 46 48 50 32 C54 42 58 36 60 14 Z" fill={g} />
        <path d="M60 52 C72 66 76 72 72 80 C69 86 63 88 60 88 C54 88 48 84 48 77 C48 70 56 66 60 52 Z" fill="#fff" opacity={0.7} />
        <rect x={54} y={90} width={12} height={16} fill={g} />
      </>)}
    </svg>
  )
}

export type DiscLevel = 'or' | 'platine' | 'platine2' | 'platine3' | 'diamant'
const DISCS: Record<DiscLevel, { c: [string, string, string]; n: number; label: string }> = {
  or: { c: ['#FFF1B0', '#FFC63D', '#B8780A'], n: 1, label: 'Or' },
  platine: { c: ['#FFFFFF', '#C9D6F2', '#6F7BA0'], n: 1, label: 'Platine' },
  platine2: { c: ['#FFFFFF', '#DCE6FF', '#7F8FC0'], n: 2, label: 'Double platine' },
  platine3: { c: ['#FFFFFF', '#EAF0FF', '#8F9FD0'], n: 3, label: 'Triple platine' },
  diamant: { c: ['#E6FFFF', '#35D3F0', '#0E7C99'], n: 1, label: 'Diamant' },
}
/** Disque certifié encadré (or, platine, double/triple platine, diamant). */
export function CertDisc({ level, size = 110, title }: { level: DiscLevel; size?: number; title?: string }) {
  const id = 'cd' + useId().replace(/:/g, '')
  const d = DISCS[level]
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`Disque ${d.label}${title ? ' · ' + title : ''}`} style={{ display: 'block', flex: 'none', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,.5))' }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={d.c[0]} /><stop offset=".5" stopColor={d.c[1]} /><stop offset="1" stopColor={d.c[2]} /></linearGradient></defs>
      <rect x={6} y={6} width={108} height={108} rx={10} fill="#140C2A" stroke={`url(#${id})`} strokeWidth={4} />
      <circle cx={60} cy={58} r={36} fill="#0B0B12" stroke={`url(#${id})`} strokeWidth={3} />
      {level === 'diamant'
        ? <polygon points="42,48 78,48 90,60 60,88 30,60" fill={`url(#${id})`} transform="translate(0,-4) scale(1)" transform-origin="60 60" />
        : <><circle cx={60} cy={58} r={26} fill={`url(#${id})`} />{[18, 12].map((r) => <circle key={r} cx={60} cy={58} r={r} fill="none" stroke="#0B0B12" strokeWidth={1} opacity={0.35} />)}<circle cx={60} cy={58} r={5} fill="#0B0B12" /></>}
      <path d="M30 40 A 36 36 0 0 1 56 24" stroke="#fff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.4} />
      {Array.from({ length: d.n }, (_, i) => <polygon key={i} fill={`url(#${id})`} points={Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + (k * Math.PI) / 5; const r = k % 2 ? 3.2 : 7; return `${60 + (i - (d.n - 1) / 2) * 17 + Math.cos(a) * r},${102 + Math.sin(a) * r}` }).join(' ')} />)}
    </svg>
  )
}
export const discLabel = (l: DiscLevel) => DISCS[l].label
