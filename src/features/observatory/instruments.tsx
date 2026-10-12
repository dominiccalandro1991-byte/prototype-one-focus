import { useRef, type Dispatch, type PointerEvent } from 'react';
import { Check, CircleDot, Orbit, Radio, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { targets, type Action, type ObservatoryState } from './model';

function InstrumentHeading({ number, title, locked }: { number: string; title: string; locked: boolean }) {
  return <div className="instrument-heading"><span className="instrument-number">{number}</span><h3>{title}</h3>{locked ? <Check className="status-check" size={17} /> : <span className="status-dot" />}</div>;
}
export function Instruments({ state: s, dispatch, disabled }: { state: ObservatoryState; dispatch: Dispatch<Action>; disabled: boolean }) {
  const drag = useRef<{ x: number; value: number } | null>(null);
  const field = useRef<HTMLDivElement>(null);
  const activeAnchor = useRef<number | null>(null);
  const lockedAnchors = s.anchorLocked.every(Boolean);
  function orbitMove(e: PointerEvent) {
    if (drag.current && !s.orbitLocked && !disabled) dispatch({ type: 'orbit', value: drag.current.value + (e.clientX - drag.current.x) * 1.25 });
  }
  function anchorMove(e: PointerEvent, release: boolean) {
    const rect = field.current?.getBoundingClientRect(), index = activeAnchor.current;
    if (!rect || index === null) return;
    dispatch({ type: 'anchor', index, point: { x: (e.clientX - rect.left) / rect.width * 100, y: (e.clientY - rect.top) / rect.height * 100 }, release });
    if (release) activeAnchor.current = null;
  }
  const wave = (value: number) => Array.from({ length: 121 }, (_, i) => `${i * 2},${43 + Math.sin(i / 120 * Math.PI * (3 + value / 10)) * 24}`).join(' ');
  return <div className="instruments">
    <section className={`instrument ${s.orbitLocked ? 'complete' : ''}`} aria-label="Orbital alignment instrument">
      <InstrumentHeading number="01" title="ORBITAL ALIGNMENT" locked={s.orbitLocked} />
      <div className="dial-area">
        <div className="orbital-dial" role="slider" tabIndex={disabled || s.orbitLocked ? -1 : 0} aria-label="Orbital alignment" aria-valuemin={0} aria-valuemax={360} aria-valuenow={Math.round(s.orbit)} aria-valuetext={s.orbitLocked ? 'Orbit locked' : `${Math.round(s.orbit)} degrees; align with 90, 210, or 330 degrees`} aria-disabled={disabled || s.orbitLocked}
          onPointerDown={e => { if (disabled || s.orbitLocked) return; e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, value: s.orbit }; }}
          onPointerMove={orbitMove} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
          onKeyDown={e => { if (disabled || s.orbitLocked) return; if (['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown'].includes(e.key)) { e.preventDefault(); dispatch({ type: 'orbit', value: s.orbit + (['ArrowRight', 'ArrowUp'].includes(e.key) ? 3 : -3) }); } }}>
          <svg viewBox="0 0 180 180" aria-hidden="true"><circle className="dial-outer" cx="90" cy="90" r="77" />
            {Array.from({ length: 48 }, (_, i) => <line key={i} className="dial-tick" x1="90" y1={i % 4 === 0 ? 16 : 20} x2="90" y2="25" transform={`rotate(${i * 7.5} 90 90)`} />)}
            <circle className="dial-inner" cx="90" cy="90" r="53" />
            {[90, 210, 330].map(angle => <g key={angle} transform={`rotate(${angle} 90 90)`}><circle className="target-halo" cx="90" cy="30" r="11" /><circle className="target-core" cx="90" cy="30" r="3" /></g>)}
            <g transform={`rotate(${s.orbit} 90 90)`}>{[0, 120, 240].map(angle => <path key={angle} className="orbit-mark" d="M90 23 L96 32 L90 41 L84 32 Z" transform={`rotate(${angle} 90 90)`} />)}</g>
          </svg><div className="dial-center"><Orbit size={24} /><strong>{Math.round(s.orbit)}<small>°</small></strong></div>
        </div>
        <span className="instrument-hint">{s.orbitLocked ? 'THREE ORBITS IN PHASE' : 'ROTATE TO ALIGN THE MARKS'}</span>
      </div>
      <div className="instrument-footer"><Orbit size={15} /><span>{s.orbitLocked ? 'ORBIT LOCKED' : 'AWAITING ALIGNMENT'}</span><span>{s.orbitLocked ? '✓' : '↔'}</span></div>
    </section>
    <section className={`instrument ${s.harmonicLocked ? 'complete' : ''}`} aria-label="Harmonic resonance instrument">
      <InstrumentHeading number="02" title="HARMONIC RESONANCE" locked={s.harmonicLocked} />
      <div className="resonance-area"><div className="frequency-readout"><Radio size={19} /><span>{(s.harmonic * 3.14 + 110).toFixed(1)}<small> Hz</small></span><span className={Math.abs(s.harmonic - 68) < 15 ? 'resonance-near' : ''}>◈</span></div>
        <svg className="waveform" viewBox="0 0 240 86" aria-label="Live waveform and target waveform"><line className="wave-baseline" x1="0" y1="43" x2="240" y2="43" /><polyline className="wave-target" points={wave(68)} /><polyline className="wave-live" points={wave(s.harmonic)} /></svg>
        <div className="slider-track"><span className="slider-target" /><input aria-label="Harmonic resonance" type="range" min="0" max="100" step="1" value={s.harmonic} disabled={disabled || s.harmonicLocked} onChange={e => dispatch({ type: 'harmonic', value: Number(e.target.value) })} /></div>
        <div className="range-labels"><span>LOW FREQUENCY</span><span>HIGH FREQUENCY</span></div>
        <span className="instrument-hint">{s.harmonicLocked ? 'SIGNALS IN PERFECT RESONANCE' : 'MATCH THE LUMINOUS WAVE'}</span>
      </div>
      <div className="instrument-footer"><Radio size={15} /><span>{s.harmonicLocked ? 'HARMONIC MATCHED' : 'SEEKING RESONANCE'}</span><span>{s.harmonicLocked ? '✓' : '∿'}</span></div>
    </section>
    <section className={`instrument ${lockedAnchors ? 'complete' : ''}`} aria-label="Anchor calibration instrument">
      <InstrumentHeading number="03" title="ANCHOR CALIBRATION" locked={lockedAnchors} />
      <div className="anchor-area"><div className="anchor-field" ref={field}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="anchor-triangle" d="M50 24L23 74L77 74Z" /><circle className="coordinate-ring" cx="50" cy="50" r="37" /></svg>
        {targets.map((p, i) => <span key={i} className={`anchor-target ${s.anchorLocked[i] ? 'secured' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-hidden="true">{['Ⅰ', 'Ⅱ', 'Ⅲ'][i]}</span>)}
        {s.anchors.map((p, i) => <Button key={i} variant="instrument" size="tool" className={`anchor-node ${s.anchorLocked[i] ? 'secured' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-label={`Anchor ${i + 1}${s.anchorLocked[i] ? ' secured' : ''}`} disabled={disabled || s.anchorLocked[i]}
          onPointerDown={e => { activeAnchor.current = i; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => anchorMove(e, false)} onPointerUp={e => anchorMove(e, true)} onPointerCancel={() => { activeAnchor.current = null; }}
          onKeyDown={e => { const offsets: Record<string, [number, number]> = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -4], ArrowDown: [0, 4] }; const offset = offsets[e.key]; if (offset) { e.preventDefault(); dispatch({ type: 'anchor', index: i, point: { x: p.x + offset[0], y: p.y + offset[1] }, release: true }); } }}>
          {s.anchorLocked[i] ? <Check size={17} /> : <><CircleDot size={22} /><span>{['Ⅰ', 'Ⅱ', 'Ⅲ'][i]}</span></>}
        </Button>)}
      </div><span className="instrument-hint">{lockedAnchors ? 'ALL ANCHORS HOLDING' : 'DRAG EACH ANCHOR TO ITS SYMBOL'}</span></div>
      <div className="instrument-footer"><Sparkles size={15} /><span>{lockedAnchors ? 'ANCHORS SECURED' : `${s.anchorLocked.filter(Boolean).length} / 3 ANCHORS IN PLACE`}</span><span>{lockedAnchors ? '✓' : '⌖'}</span></div>
    </section>
  </div>;
}