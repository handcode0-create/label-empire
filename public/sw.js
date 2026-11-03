/* Service worker de Label Empire : permet l'installation et le démarrage hors ligne.
   - pages : réseau d'abord (toujours la dernière version), cache en secours ;
   - fichiers du jeu (js, css, images, polices) : cache d'abord, mis à jour au passage. */
const VERSION = 'le-v2'
const SHELL = ['/', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png']

/** Précharge la page d'accueil et les fichiers qu'elle référence (js, css), pour démarrer hors ligne dès la première visite. */
async function precache() {
  const c = await caches.open(VERSION)
  await c.addAll(SHELL)
  const html = await (await c.match('/')).text()
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
  await Promise.all(assets.map((a) => c.add(a).catch(() => {})))
}
self.addEventListener('install', (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== location.origin) return // polices Google, etc. : laissées au navigateur
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put('/', copy)); return r }).catch(() => caches.match('/', { ignoreVary: true })))
    return
  }
  e.respondWith(caches.match(req, { ignoreVary: true }).then((hit) => {
    const net = fetch(req).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)) } return r }).catch(() => hit)
    return hit || net
  }))
})
