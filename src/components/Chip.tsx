import type { ReactNode } from 'react'
export default function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <span role="button" tabIndex={0} className={'chip' + (on ? ' on' : '')} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick()}>{children}</span>
}
