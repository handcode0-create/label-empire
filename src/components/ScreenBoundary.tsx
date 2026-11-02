import { Component, type ReactNode } from 'react'

/** Évite l'écran noir : si une page plante, on affiche l'erreur et un retour au Hub (la partie n'est pas perdue). */
export default class ScreenBoundary extends Component<{ resetKey: string; onHome: () => void; children: ReactNode }, { error: Error | null; key: string }> {
  state = { error: null as Error | null, key: this.props.resetKey }
  static getDerivedStateFromError(error: Error) { return { error } }
  static getDerivedStateFromProps(p: { resetKey: string }, s: { error: Error | null; key: string }) { return p.resetKey !== s.key ? { error: null, key: p.resetKey } : null }
  componentDidCatch(error: Error) { console.error('Écran en erreur :', error) }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#F4F0FF', fontFamily: 'inherit' }}>
        <div style={{ maxWidth: 560, textAlign: 'center', padding: 28, borderRadius: 16, background: 'rgba(28,18,54,.92)', boxShadow: 'inset 0 0 0 1px #3F2B73' }}>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Cet écran a rencontré un problème</div>
          <div style={{ opacity: 0.75, fontSize: 14, marginBottom: 18 }}>Votre partie est intacte. {String(this.state.error.message).slice(0, 160)}</div>
          <button type="button" onClick={() => { this.setState({ error: null }); this.props.onHome() }} style={{ height: 48, padding: '0 28px', borderRadius: 24, border: 0, cursor: 'pointer', fontWeight: 800, fontSize: 16, color: '#1A0B2E', background: '#FF3D9A' }}>Retour au Hub</button>
        </div>
      </div>
    )
  }
}
