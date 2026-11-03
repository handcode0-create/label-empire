import { useEffect, useState } from 'react'
import { useGame } from '../store/gameStore'
import { speak, stopSpeaking, voiceSupported } from '../voice'

/** Petit bouton « écouter » : lit le texte sur demande, et automatiquement (une fois par `auto`) si la voix est activée. */
export default function SpeakButton({ text, auto, who }: { text: string; auto?: string; who?: string }) {
  const [on, setOn] = useState(false)
  const voice = useGame((s) => s.options.voice)
  useEffect(() => {
    if (!auto || !voice) return
    const t = setTimeout(() => { setOn(true); speak(text, { who, onEnd: () => setOn(false) }) }, 400)
    return () => { clearTimeout(t); stopSpeaking() }
  }, [auto, voice]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!voiceSupported()) return null
  const click = () => { if (on) { stopSpeaking(); setOn(false); return } setOn(true); speak(text, { who, force: true, onEnd: () => setOn(false) }) }
  return <button type="button" className="btn s sm" aria-pressed={on} aria-label={on ? 'Arrêter la lecture' : 'Écouter le texte'} onClick={click} style={{ cursor: 'pointer', flex: 'none', width: 44, padding: 0 }}>{on ? '■' : '🔊'}</button>
}
