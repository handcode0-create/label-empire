const ITEMS: { key: string; href: string; label: string; short?: string; d: React.JSX.Element }[] = [
  { key: 'monde', href: 'Hub.dc.html', label: 'Monde', d: <><circle cx={12} cy={12} r={9} /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></> },
  { key: 'artistes', href: 'Artistes.dc.html', label: 'Artistes', d: <><circle cx={9} cy={8} r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17.5" cy={9} r="2.5" /><path d="M17 14.2c2.4.3 4 2.2 4 5.3" /></> },
  { key: 'studio', href: 'Ecriture.dc.html', label: 'Studio', d: <><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></> },
  { key: 'sorties', href: 'Sortie.dc.html', label: 'Sorties', d: <><circle cx={12} cy={12} r={9} /><circle cx={12} cy={12} r={3} /></> },
  { key: 'classements', href: 'Classements.dc.html', label: 'Classements', short: 'Classem.', d: <path d="M5 20v-6M12 20V5M19 20v-10" /> },
  { key: 'tournees', href: 'Tournee.dc.html', label: 'Tournées', d: <path d="M3 13l18-9-6 17-3-7-9-1z" /> },
  { key: 'equipe', href: 'Equipe.dc.html', label: 'Équipe', d: <><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M9 7V5h6v2M3 13h18" /></> },
  { key: 'finances', href: 'Finances.dc.html', label: 'Finances', d: <path d="M3 7h16a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2V7zM3 7l2-3h12M16 14h2" /> },
]

/** Barre de navigation latérale commune à tous les écrans de jeu. */
export default function Dock({ active }: { active: string }) {
  return (
    <nav className="dock" aria-label="Navigation du jeu">
      <a className="lg" href="Menu.dc.html" aria-label="Menu principal">LE</a>
      {ITEMS.map((i) => (
        <a key={i.key} className={'dk' + (i.key === active ? ' on' : '')} href={i.href} aria-label={i.label}>
          <svg viewBox="0 0 24 24">{i.d}</svg>{i.short ?? i.label}
        </a>
      ))}
    </nav>
  )
}
