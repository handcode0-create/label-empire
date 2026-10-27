import { useEffect, useState, type CSSProperties } from 'react'
import { avatarKey } from '../data/avatars'
import { initials } from '../lib'

/** Liste des portraits disponibles (public/avatars/manifest.json) : clé → nom de fichier. */
let manifest: Record<string, string> | null = null
let pending: Promise<void> | null = null
function loadManifest(): Promise<void> {
  pending ??= fetch('/avatars/manifest.json').then((r) => (r.ok ? r.json() : { files: {} })).then((j) => { manifest = j.files ?? {} }).catch(() => { manifest = {} })
  return pending
}
function useAvatarFile(key: string): string | null {
  const [, tick] = useState(0)
  useEffect(() => { if (manifest === null) loadManifest().then(() => tick((n) => n + 1)) }, [])
  const f = manifest?.[key]
  return f ? `/avatars/${f}` : null
}

interface Props {
  artist?: { id: string; stageName: string; realName?: string; originCityId: string; gradient: string }
  /** Pour un personnage hors artiste (histoire) : clé de portrait, nom et dégradé. */
  keyName?: string; name?: string; gradient?: string
  size?: number
  style?: CSSProperties
}

/** Portrait cartoon si l'image existe, sinon monogramme sur dégradé. */
export default function Avatar({ artist, keyName, name, gradient, size = 64, style }: Props) {
  const key = keyName ?? (artist ? avatarKey(artist) : '')
  const src = useAvatarFile(key)
  const label = name ?? artist?.stageName ?? '?'
  const grad = gradient ?? artist?.gradient ?? '#8B5CF6,#FF3D9A'
  return (
    <div className="av" style={{ width: size, height: size, fontSize: Math.round(size * 0.36), background: `linear-gradient(135deg,${grad})`, overflow: 'hidden', ...style }} aria-label={label}>
      {src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(label)}
    </div>
  )
}
