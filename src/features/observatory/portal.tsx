import { useEffect, useRef } from 'react';
import { destinations } from './destinations';
import { systems, type ObservatoryState } from './model';

export function Portal({ state, intro = false, result = false }: { state: ObservatoryState; intro?: boolean; result?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const values = useRef(state); values.current = state;
  useEffect(() => {
    const el = canvas.current, ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    let frame = 0, previous = 0, slowFrames = 0;
    let lowPower = false;
    const palette = ['--primary', '--energy', '--gold', '--rose'].map(token => getComputedStyle(el).getPropertyValue(token).trim());
    function draw(t: number) {
      if (!el || !ctx) return;
      if (previous && t - previous > 65) slowFrames++;
      if (slowFrames > 15) lowPower = true;
      previous = t;
      const rect = el.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (el.width !== Math.round(rect.width * dpr) || el.height !== Math.round(rect.height * dpr)) { el.width = Math.round(rect.width * dpr); el.height = Math.round(rect.height * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, rect.width, rect.height);
      const s = values.current, count = systems(s), time = s.reducedMotion || lowPower ? 0 : t * 0.0003;
      const cx = rect.width / 2, cy = rect.height / 2, rx = rect.width * 0.255, ry = rect.height * 0.36;
      ctx.globalCompositeOperation = 'lighter';
      const layers = lowPower ? 8 : 18;
      for (let layer = 0; layer < layers; layer++) {
        ctx.beginPath();
        for (let i = 0; i <= 180; i++) {
          const a = i / 180 * Math.PI * 2;
          const distortion = (s.orbitLocked ? 0.014 : 0.055) * Math.sin(a * 5 + time + layer * 0.4 + s.orbit / 40);
          const harmonic = Math.sin(a * 9 - time * 2 + s.harmonic / 16) * (s.harmonicLocked ? 0.006 : 0.018);
          const spread = (layer - layers / 2) * 0.0025;
          const x = cx + Math.cos(a) * rx * (1 + distortion + harmonic + spread), y = cy + Math.sin(a) * ry * (1 + distortion + spread);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.globalAlpha = (intro ? 0.13 : 0.28) + count * 0.04; ctx.strokeStyle = palette[layer % 3 === 0 ? 1 : 0]; ctx.lineWidth = layer % 4 === 0 ? 1.5 : 0.55; ctx.stroke();
      }
      for (let i = 0; i < (lowPower ? 18 : 50); i++) {
        const a = i * 2.399 + time * 0.1, spread = 1.08 + (i % 9) * 0.035;
        ctx.globalAlpha = 0.25 + Math.sin(i + time) * 0.15; ctx.fillStyle = palette[i % 3 === 0 ? 2 : 1];
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rx * spread, cy + Math.sin(a) * ry * spread, i % 7 === 0 ? 1.8 : 0.7, 0, Math.PI * 2); ctx.fill();
      }
      if (!s.reducedMotion && !lowPower) frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    const resize = () => { if (values.current.reducedMotion || lowPower) draw(0); };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [state.reducedMotion, state.orbit, state.harmonic, state.anchorLocked, intro]);
  const count = systems(state), destination = destinations[state.destination ?? 0] ?? destinations[0]!;
  return <div className={`portal-chamber stage-${count} ${intro ? 'intro-portal' : ''} ${state.opening ? 'portal-opening' : ''} ${result ? 'result-portal' : ''}`} aria-label={`Fictional Rift, ${intro ? 'dormant' : `${count} systems aligned`}`}>
    <div className="astronomical-ring ring-one" /><div className="astronomical-ring ring-two" />
    <div className="portal-image"><img src={destinations[0].image} alt="An original luminous violet and cyan Rift" width={1024} height={1024} fetchPriority={intro ? 'high' : 'auto'} /></div>
    {(state.opening || result || count > 1) && <div className={`destination-aperture ${destination.className}`}><img src={destination.image} width={1024} height={1024} alt={destination.title} /></div>}
    <canvas ref={canvas} className="portal-canvas" aria-hidden="true" />
    <div className="portal-crosshair crosshair-top" /><div className="portal-crosshair crosshair-bottom" />
    {state.anchorLocked.map((locked, i) => <span key={i} className={`portal-anchor portal-anchor-${i} ${locked || result ? 'lit' : ''}`} />)}
    {!intro && !result && <><span className="chamber-coordinate coordinate-left">FIELD / 0{count + 1}</span><span className="chamber-coordinate coordinate-right">RIFT / 001</span></>}
  </div>;
}