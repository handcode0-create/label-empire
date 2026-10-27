import { useRef } from 'react'

/** Curseur de la maquette (.sl) rendu interactif : clic ou glisser. */
export default function Slider({ min, max, step = 1, value, onChange, style }: { min: number; max: number; step?: number; value: number; onChange: (v: number) => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const pct = ((value - min) / (max - min)) * 100
  const set = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width))
    onChange(Math.round((min + ratio * (max - min)) / step) * step)
  }
  return (
    <div ref={ref} className="sl" role="slider" aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} tabIndex={0}
      style={{ cursor: 'pointer', touchAction: 'none', ...style }}
      onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); ref.current!.setPointerCapture(e.pointerId); set(e.clientX) }}
      onPointerMove={(e) => { if (e.buttons) set(e.clientX) }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') onChange(Math.min(max, value + step)); if (e.key === 'ArrowLeft') onChange(Math.max(min, value - step)) }}>
      <i style={{ width: pct + '%' }} /><u style={{ left: pct + '%' }} />
    </div>
  )
}
