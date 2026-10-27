import { useGame } from '../store/gameStore'

/** Ligne de répartition de points, même rendu que la maquette. */
export default function SkillRow({ group, k, label }: { group: 'staffSkills' | 'artistSkills'; k: string; label: string }) {
  const v = useGame((s) => s.config[group][k] ?? 0)
  const setSkill = useGame((s) => s.setSkill)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '130px 30px 1fr 30px 40px', gap: 10, alignItems: 'center', padding: '7px 0', fontSize: 15 }}>
      <b>{label}</b>
      <a href="#" className="chip" style={{ height: 28, padding: '0 10px', justifyContent: 'center' }} aria-label={`Retirer ${label}`} onClick={(e) => { e.preventDefault(); setSkill(group, k, -1) }}>−</a>
      <div className="mt"><i style={{ width: `${v * 10}%` }} /></div>
      <a href="#" className="chip on" style={{ height: 28, padding: '0 10px', justifyContent: 'center' }} aria-label={`Ajouter ${label}`} onClick={(e) => { e.preventDefault(); setSkill(group, k, 1) }}>+</a>
      <b className="disp" style={{ fontSize: 20, textAlign: 'right' }}>{v}</b>
    </div>
  )
}
