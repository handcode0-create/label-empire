import Artistes from './mock/Artistes'
import Classements from './mock/Classements'
import Concours from './mock/Concours'
import Contrat from './mock/Contrat'
import Decouverte from './mock/Decouverte'
import Ecriture from './mock/Ecriture'
import Equipe from './mock/Equipe'
import Fin from './mock/Fin'
import Finances from './mock/Finances'
import Hub from './mock/Hub'
import Main from './mock/Main'
import Menu from './mock/Menu'
import Mixage from './mock/Mixage'
import NouvellePartie from './mock/NouvellePartie'
import NouvellePartie2 from './mock/NouvellePartie2'
import Pays from './mock/Pays'
import Profil from './mock/Profil'
import Rapport from './mock/Rapport'
import Sortie from './mock/Sortie'
import Studio from './mock/Studio'
import Tournee from './mock/Tournee'

export const SCREENS: Record<string, () => React.JSX.Element> = {
  Artistes,
  Classements,
  Concours,
  Contrat,
  Decouverte,
  Ecriture,
  Equipe,
  Fin,
  Finances,
  Hub,
  Main,
  Menu,
  Mixage,
  NouvellePartie,
  NouvellePartie2,
  Pays,
  Profil,
  Rapport,
  Sortie,
  Studio,
  Tournee,
}
