import type { CSSProperties } from 'react'
import { LABEL_LOGOS } from '../data/labelLogos'
import { mediaById, mediaLogo } from '../data/media'
import { initials } from '../lib'

const box = (size: number, extra?: CSSProperties): CSSProperties => ({ width: size, height: size, flex: 'none', borderRadius: Math.round(size * 0.24), overflow: 'hidden', display: 'inline-grid', placeItems: 'center', ...extra })

/** Logo d'un média (public/media/<id>.svg). */
export function MediaLogo({ id, size = 40, style }: { id: string; size?: number; style?: CSSProperties }) {
  const m = mediaById(id)
  return <span style={box(size, style)} title={m?.name}><img src={mediaLogo(id)} alt={m?.name ?? ''} style={{ width: '100%', height: '100%' }} /></span>
}

/** Logo d'un label : image si elle existe (logos du studio, import du joueur), sinon monogramme. */
export function LabelLogo({ name, logoId, size = 40, style }: { name: string; logoId?: string; size?: number; style?: CSSProperties }) {
  const src = logoId && (logoId.startsWith('data:') || logoId.startsWith('/logos/')) ? logoId : LABEL_LOGOS[name]
  return (
    <span style={box(size, { background: src ? 'transparent' : 'linear-gradient(135deg,#8B5CF6,#FF3D9A)', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: Math.round(size * 0.4), color: '#fff', ...style })} title={name}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(name)}
    </span>
  )
}
