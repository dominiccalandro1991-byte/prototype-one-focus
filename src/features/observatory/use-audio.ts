import { useEffect, useRef, useState } from 'react';

export function useObservatoryAudio(enabled: boolean, active: boolean, completed: number, opening: boolean) {
  const [available, setAvailable] = useState(true);
  const context = useRef<AudioContext | null>(null);
  const drone = useRef<GainNode | null>(null);
  const last = useRef(completed);
  useEffect(() => {
    setAvailable('AudioContext' in window || 'webkitAudioContext' in window);
    return () => { void context.current?.close(); };
  }, []);
  function enable() {
    try {
      const Constructor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Constructor) { setAvailable(false); return false; }
      if (!context.current) {
        const ctx = new Constructor(); context.current = ctx;
        const gain = ctx.createGain(); gain.gain.value = 0; gain.connect(ctx.destination); drone.current = gain;
        [55, 82.4].forEach(frequency => { const osc = ctx.createOscillator(); osc.frequency.value = frequency; osc.connect(gain); osc.start(); });
      }
      void context.current.resume().catch(() => setAvailable(false));
      return true;
    } catch { setAvailable(false); return false; }
  }
  useEffect(() => {
    const ctx = context.current;
    if (!ctx) return;
    if (!enabled) { if (drone.current) drone.current.gain.value = 0; void ctx.suspend(); return; }
    if (drone.current) drone.current.gain.setTargetAtTime(active ? 0.018 : 0, ctx.currentTime, 0.2);
  }, [enabled, active]);
  useEffect(() => {
    const ctx = context.current;
    if (ctx && enabled && (completed > last.current || opening)) {
      try {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination); const t = ctx.currentTime;
        osc.frequency.setValueAtTime(opening ? 110 : 220 + completed * 55, t);
        osc.frequency.exponentialRampToValueAtTime(opening ? 440 : 440 + completed * 55, t + (opening ? 3.5 : 0.6));
        gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.035, t + 0.1); gain.gain.exponentialRampToValueAtTime(0.0001, t + (opening ? 4 : 1));
        osc.start(); osc.stop(t + (opening ? 4.1 : 1.1));
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
      } catch { setAvailable(false); }
    }
    last.current = completed;
  }, [completed, opening, enabled]);
  return { available, enable };
}