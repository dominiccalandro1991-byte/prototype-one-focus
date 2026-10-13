import { useEffect, useReducer, useState } from 'react';
import { ArrowDown, ArrowRight, Check, ChevronRight, Copy, Info, LockKeyhole, RotateCcw, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { destinations } from './destinations';
import { Instruments } from './instruments';
import { initialState, reducer, stability, systems } from './model';
import { Portal } from './portal';
import { useObservatoryAudio } from './use-audio';

function Mark() { return <span className="brand-mark" aria-hidden="true"><Sparkles size={17} /></span>; }
export function Experience() {
  const [s, dispatch] = useReducer(reducer, undefined, initialState);
  const [science, setScience] = useState(false), [how, setHow] = useState(false), [reset, setReset] = useState(false);
  const [copy, setCopy] = useState<'idle' | 'copied' | 'fallback'>('idle');
  const count = systems(s), score = stability(s), intro = s.screen === 'intro', result = s.screen === 'signature';
  const audio = useObservatoryAudio(s.sound, !intro, count, s.opening);
  const destination = destinations[s.destination ?? 0] ?? destinations[0]!;
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => dispatch({ type: 'motion', value: query.matches }); change(); query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!s.opening) return;
    const chamber = document.querySelector('.chamber-section');
    if (chamber) window.scrollTo({ top: chamber.getBoundingClientRect().top + window.scrollY - 12, behavior: 'instant' });
    const timer = window.setTimeout(() => dispatch({ type: 'finish' }), s.reducedMotion ? 1200 : 4800);
    return () => window.clearTimeout(timer);
  }, [s.opening, s.reducedMotion]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); setCopy('idle'); }, [s.screen === 'signature', intro]);
  const details = `Portal Masters Rift Signature: ${s.name} — ${destination.title} — Stability 100%`;
  async function copyDetails() { try { if (!navigator.clipboard?.writeText) throw new Error('unavailable'); await navigator.clipboard.writeText(details); setCopy('copied'); } catch { setCopy('fallback'); } }
  return <div className={`observatory-app ${s.reducedMotion ? 'reduced-motion' : ''}`}>
    <div className="starfield" aria-hidden="true" />
    <header className="observatory-header"><div className="brand"><Mark /><span>PORTAL MASTERS<small>WEB OBSERVATORY</small></span></div>
      <div className="header-tools"><Button variant="quiet" size="touch" className="science-button" aria-label="Science & Fiction" onClick={() => setScience(true)}><Info size={16} /><span>Science & Fiction</span></Button><span className="header-divider" />
        <Button variant="quiet" size="tool" aria-label={s.sound ? 'Mute sound' : 'Enable sound'} title={audio.available ? s.sound ? 'Mute sound' : 'Enable sound' : 'Sound unavailable'} disabled={!audio.available} aria-pressed={s.sound} onClick={() => { if (s.sound || audio.enable()) dispatch({ type: 'sound' }); }}>{s.sound ? <Volume2 /> : <VolumeX />}</Button>
      </div>
    </header>
    <main>
    {intro ? <section className="intro-screen"><div className="intro-topline"><span className="live-dot" /> AN ORIGINAL FICTIONAL EXPERIENCE <span className="intro-index">PROTOTYPE 01</span></div>
      <div className="intro-scene"><Portal state={s} intro /><div className="intro-title"><p className="eyebrow">WEB OBSERVATORY</p><h1>THE FIRST<br /><span>RIFT</span></h1><p className="intro-subtitle">A fictional interactive portal experiment.<br />Tune the anomaly. Find its destination.</p></div></div>
      <div className="intro-actions"><Button variant="rift" size="touch" onClick={() => dispatch({ type: 'enter' })}>ENTER THE OBSERVATORY <ArrowRight size={18} /></Button><Button variant="quiet" size="touch" onClick={() => setHow(true)}>How this works <ArrowDown size={15} /></Button></div>
      <div className="intro-bottom"><span>ONE ANOMALY. THREE SYSTEMS. YOUR DISCOVERY.</span><span className="fiction-tag"><Sparkles size={12} /> SCIENCE-INSPIRED. ENTIRELY FICTIONAL.</span></div>
    </section> : result ? <section className={`signature-screen ${destination.className}`}>
      <p className="eyebrow"><Check size={16} /> RIFT SIGNATURE ACQUIRED</p><h1>{s.name}</h1><p className="signature-destination">{destination.title}</p>
      <div className="signature-card"><div className="signature-card-top"><Mark /><span>PORTAL MASTERS<span>PERSONAL RIFT SIGNATURE</span></span><span className="signature-seal">100%<small>STABILITY</small></span></div><Portal state={s} result /><div className="signature-card-bottom"><span>{destination.theme}</span><div className="signature-symbols"><OrbitGlyph /><Sparkles size={20} /><span>⌖</span></div></div></div>
      <p className="signature-lore">{destination.lore}</p><div className="system-badges">{['Orbit Locked', 'Harmonic Matched', 'Anchors Secured'].map(text => <span key={text}><Check size={14} />{text}</span>)}</div>
      <div className="signature-actions"><Button variant="rift" size="touch" onClick={() => dispatch({ type: 'return' })}>RETURN TO OBSERVATORY <ArrowRight /></Button><Button variant="outline" size="touch" onClick={() => dispatch({ type: 'reset' })}><RotateCcw /> CREATE ANOTHER RIFT</Button><Button variant="quiet" size="touch" onClick={copyDetails}>{copy === 'copied' ? <Check /> : <Copy />}{copy === 'copied' ? 'DETAILS COPIED' : 'COPY RIFT DETAILS'}</Button></div>
      {copy === 'fallback' && <div className="copy-fallback" role="status"><p>Copy is not available in this browser.</p><textarea aria-label="Rift details to copy" readOnly value={details} onFocus={e => e.target.select()} /></div>}
    </section> : <section className="observatory-screen"><div className="mission-row"><div className="min-w-0"><p className="eyebrow">WEB OBSERVATORY <ChevronRight size={12} /> EXPERIMENT 001</p><h1>The First Rift</h1></div><div className={`mission-status ${score === 100 ? 'stable' : ''}`}><span className="live-dot" />{score === 100 ? 'STABLE' : score >= 80 ? 'NEARLY STABLE' : score >= 45 ? 'CALIBRATING' : 'UNSTABLE'}</div></div>
      <div className="chamber-section"><div className="chamber-label"><span className="eyebrow">ANOMALY CHAMBER</span><span>⌖ &nbsp; LOCAL FIELD</span></div><Portal state={s} />
        <div className="chamber-caption"><span className="caption-line" /><Sparkles size={14} /><span>{s.opening ? 'CROSSING THE THRESHOLD' : count === 3 ? 'A DESTINATION AWAITS' : 'AN UNKNOWN WORLD IS WITHIN REACH'}</span><span className="caption-line" /></div>
      </div>
      <div className="calibration-heading"><div><h2>STABILIZE THE RIFT</h2><p>Align the three field controls. As the Rift becomes stable, its destination will begin to reveal itself.</p></div><div className="aligned-count" aria-live="polite"><strong>{count}<span> / 3</span></strong><span>systems aligned</span></div></div>
      <Instruments state={s} dispatch={dispatch} disabled={s.opening} />
      <div className="stability-bar"><div className="stability-info"><span>RIFT STABILITY</span><strong aria-live="polite">{score}<span>%</span></strong><span className="stability-state">{score === 100 ? 'STABLE' : score >= 80 ? 'NEARLY STABLE' : score >= 45 ? 'CALIBRATING' : 'UNSTABLE'}</span></div><div className="stability-track" role="progressbar" aria-label="Rift stability" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}><span style={{ width: `${score}%` }} /></div>
        <div className="stability-action"><p>{count === 3 ? 'All fields aligned. Your Rift is ready to open.' : 'Complete all three calibrations to open a safe fictional Rift.'}</p><Button variant="rift" size="touch" disabled={count !== 3 || s.opening} onClick={() => dispatch({ type: 'open' })}>{count === 3 ? <Sparkles /> : <LockKeyhole />}{s.opening ? 'OPENING THE RIFT' : count === 3 ? 'OPEN THE RIFT' : 'ALIGN ALL SYSTEMS'}<ArrowRight /></Button></div>
      </div>
      <footer className="observatory-footer"><span>PROTOTYPE 01 <span> / </span> THE FIRST RIFT</span><Button variant="quiet" size="touch" onClick={() => setReset(true)}><RotateCcw size={14} /> Start over</Button><span className="fiction-tag">FICTIONAL SCIENCE-INSPIRED SIMULATION</span></footer>
    </section>}
    </main>
    {s.opening && <div className="opening-overlay" role="status" aria-live="polite"><span className="eyebrow">THRESHOLD SEQUENCE INITIATED</span><h2>A world beyond the signal.</h2><p>Three anchors holding. Rift opening.</p><Button variant="quiet" size="touch" onClick={() => dispatch({ type: 'finish' })}>SKIP ANIMATION <ArrowRight /></Button></div>}
    <Dialog open={science} onOpenChange={setScience}><DialogContent className="science-dialog"><p className="eyebrow"><Info size={16} /> THE SCIENCE BEHIND THE FICTION</p><DialogTitle>SCIENCE & FICTION</DialogTitle><DialogDescription>Portal Masters is fictional science-inspired entertainment.</DialogDescription><p>Real physics studies spacetime, gravity, and the possibility of theoretical structures such as wormholes. However, no real wormhole has been observed or engineered, and dark energy is not a known controllable material.</p><p>The Rifts, stabilization controls, destinations, and travel in this experience are original fictional ideas. This prototype does not create, simulate, or explain how to build a real wormhole or portal.</p><div className="honesty-note">Portal Masters is a fictional interactive experience inspired by spacetime physics. It does not simulate or create real wormholes, dark energy, or interdimensional travel.</div><Button variant="rift" size="touch" onClick={() => setScience(false)}>RETURN TO OBSERVATORY <ArrowRight /></Button></DialogContent></Dialog>
    <Dialog open={how} onOpenChange={setHow}><DialogContent className="science-dialog"><p className="eyebrow">YOUR FIRST EXPERIMENT</p><DialogTitle>Three systems. One threshold.</DialogTitle><DialogDescription>Discover a fictional destination through your own touch and choices.</DialogDescription><ol className="how-list"><li><span>01</span><div><strong>Align the orbit</strong><p>Drag the dial until its three marks meet the luminous targets. Use arrow keys on desktop.</p></div></li><li><span>02</span><div><strong>Find the resonance</strong><p>Move the frequency slider until the waveforms match in the luminous range.</p></div></li><li><span>03</span><div><strong>Secure the anchors</strong><p>Drag each numbered node to its matching symbol. Arrow keys also move a focused node.</p></div></li></ol><Button variant="rift" size="touch" onClick={() => { setHow(false); dispatch({ type: 'enter' }); }}>ENTER THE OBSERVATORY <ArrowRight /></Button></DialogContent></Dialog>
    <Dialog open={reset} onOpenChange={setReset}><DialogContent className="science-dialog"><DialogTitle>Start a new experiment?</DialogTitle><DialogDescription>Your current calibration and Rift signature will be cleared.</DialogDescription><Button variant="rift" size="touch" onClick={() => { dispatch({ type: 'reset' }); setReset(false); }}>START OVER <RotateCcw /></Button><Button variant="quiet" size="touch" onClick={() => setReset(false)}>KEEP EXPLORING <X /></Button></DialogContent></Dialog>
  </div>;
}
function OrbitGlyph() { return <span className="orbit-glyph">◎</span>; }