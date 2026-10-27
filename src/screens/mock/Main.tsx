// Fichier généré par scripts/port-mockups.cjs depuis la maquette (Main.dc.html).
export default function Main() {
  return (
    <div className="scr">
      <div className="map" style={{position: 'absolute', left: 120, top: 160, width: 1200, height: 600, opacity: '0.55'}} />
      <svg width={1440} height={900} viewBox="0 0 1440 900" style={{position: 'absolute', left: 0, top: 0}} aria-hidden="true">
        <defs><linearGradient id="arc" x1={0} x2={1}><stop offset={0} stopColor="#FF3D9A" /><stop offset={1} stopColor="#35D3F0" /></linearGradient></defs>
        <g fill="none" stroke="url(#arc)" strokeWidth={2} strokeDasharray="6 8" strokeLinecap="round">
          <path d="M707 443 Q590 330 473 324" /><path d="M707 443 Q717 360 727 297" /><path d="M707 443 Q760 500 814 546" />
          <path d="M727 297 Q940 250 1144 335" /><path d="M707 443 Q640 520 565 539" /><path d="M814 546 Q1020 470 1223 573" />
        </g>
        <g fill="#FFC63D">
          <circle cx={707} cy={443} r={7} /><circle cx={727} cy={297} r={5} /><circle cx={473} cy={324} r={5} /><circle cx={565} cy={539} r={5} /><circle cx={1144} cy={335} r={5} /><circle cx={814} cy={546} r={5} /><circle cx={1223} cy={573} r={5} />
        </g>
      </svg>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(600px 360px at 50% 46%, rgba(18,11,36,0.92), rgba(18,11,36,0.35) 70%, transparent)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div className="lg" style={{width: 84, height: 84, fontSize: 34, margin: 0}}>LE</div>
        <div className="disp" style={{fontSize: 132, lineHeight: '0.95', letterSpacing: '0.08em', textShadow: '0 0 40px rgba(255,61,154,0.55)'}}>LABEL EMPIRE</div>
        <div className="lbl" style={{fontSize: 16, letterSpacing: '0.32em', color: '#B3A6D9'}}>Dirigez un label. Conquérez le monde.</div>
      </div>
      <div style={{position: 'absolute', left: 520, right: 520, top: 640, display: 'flex', flexDirection: 'column', gap: 12}}>
        <div className="mt" style={{height: 10}}><i style={{width: '64%'}} /></div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#B3A6D9'}}><span>Chargement des marchés du monde…</span><span style={{fontWeight: 700, color: '#F4F0FF'}}>64 %</span></div>
      </div>
      <a href="Menu.dc.html" className="btn s sm" style={{position: 'absolute', left: 600, width: 240, top: 736}}>Appuyer pour entrer</a>
      <div style={{position: 'absolute', left: 40, bottom: 32, maxWidth: 560, fontSize: 14, color: '#B3A6D9'}}><span className="lbl" style={{marginRight: 10}}>Astuce</span>Un titre qui perce dans trois pays voisins déclenche un effet de région.</div>
      <div style={{position: 'absolute', right: 40, bottom: 32, fontSize: 13, color: '#9C90CC'}}>Maquette v0.1 · Les artistes et labels sont fictifs</div>
    </div>
  )
}
