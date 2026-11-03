import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './anim.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Installation sur ordinateur : le service worker n'est actif qu'en production (pas pendant le développement).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* hors ligne indisponible */ }) })
}
