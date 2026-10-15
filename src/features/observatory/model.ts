export type Screen = 'intro' | 'observatory' | 'tuning' | 'stabilized' | 'opening' | 'signature';
export type Point = { x: number; y: number };
export const targets: Point[] = [{ x: 50, y: 24 }, { x: 23, y: 74 }, { x: 77, y: 74 }];
export type ObservatoryState = {
  screen: Screen; orbit: number; orbitLocked: boolean; harmonic: number; harmonicLocked: boolean;
  anchors: Point[]; anchorLocked: boolean[]; anchorOrder: number[]; sound: boolean; reducedMotion: boolean;
  destination: number | null; name: string; opening: boolean;
};
export function initialState(): ObservatoryState {
  return { screen: 'intro', orbit: 18, orbitLocked: false, harmonic: 28, harmonicLocked: false,
    anchors: [{ x: 18, y: 28 }, { x: 78, y: 27 }, { x: 50, y: 79 }], anchorLocked: [false, false, false], anchorOrder: [],
    sound: false, reducedMotion: false, destination: null, name: '', opening: false };
}
export const families = ['Violet Echo', 'Azure Current', 'Golden Veil', 'Rose Fracture'];
export function systems(s: ObservatoryState) { return Number(s.orbitLocked) + Number(s.harmonicLocked) + Number(s.anchorLocked.every(Boolean)); }
export function stability(s: ObservatoryState) { const count = systems(s); return count === 3 ? 100 : 18 + count * 27; }
/** Exact Prototype 1 resolver: three final values (0–100) select one of four destinations. */
export function resolveDestination(orbitValue: number, harmonicValue: number, anchorValue: number) {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return (Math.floor(clamp(orbitValue) / 25) + Math.floor(clamp(harmonicValue) / 25) + Math.floor(clamp(anchorValue) / 25)) % 4;
}
const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
/** Final control values: which orbit cycle locked, the resonance position, and the order anchors were secured. */
export function finalValues(orbit: number, harmonic: number, anchorOrder: number[]) {
  const order = Math.max(0, orders.findIndex(o => o.join() === anchorOrder.join()));
  return { orbitValue: Math.round(orbit / 3.6), harmonicValue: Math.round(harmonic), anchorValue: order * 20 };
}
export function signature(orbit: number, harmonic: number, anchorOrder: number[]) {
  const v = finalValues(orbit, harmonic, anchorOrder);
  const destination = resolveDestination(v.orbitValue, v.harmonicValue, v.anchorValue);
  const code = (v.orbitValue * 7 + v.harmonicValue * 3 + v.anchorValue) % 99 + 1;
  return { destination, name: `${families[destination]} ${String(code).padStart(2, '0')}` };
}
export type Action = { type: 'enter' | 'reset' | 'open' | 'finish' | 'return' | 'sound' } | { type: 'motion'; value: boolean } | { type: 'orbit' | 'harmonic'; value: number; release?: boolean } | { type: 'anchor'; index: number; point: Point; release: boolean };
export function reducer(s: ObservatoryState, a: Action): ObservatoryState {
  if (a.type === 'motion') return { ...s, reducedMotion: a.value };
  if (a.type === 'sound') return { ...s, sound: !s.sound };
  if (a.type === 'reset') return { ...initialState(), screen: 'observatory', sound: s.sound, reducedMotion: s.reducedMotion };
  if (a.type === 'enter') return s.screen === 'intro' ? { ...s, screen: 'observatory' } : s;
  if (a.type === 'open') return systems(s) === 3 && ['stabilized', 'observatory'].includes(s.screen) ? { ...s, ...signature(s.orbit, s.harmonic, s.anchorOrder), screen: 'opening', opening: true } : s;
  if (a.type === 'finish') return s.screen === 'opening' ? { ...s, screen: 'signature', opening: false } : s;
  if (a.type === 'return') return s.screen === 'signature' ? { ...s, screen: 'stabilized' } : s;
  if (!['observatory', 'tuning', 'stabilized'].includes(s.screen)) return s;
  let next = s;
  if (a.type === 'orbit' && !s.orbitLocked) {
    const value = Math.max(0, Math.min(360, a.value));
    const target = Math.round((value - 90) / 120) * 120 + 90;
    const locked = a.release !== false && Math.abs(value - target) <= 7 && target >= 0 && target <= 360;
    next = { ...s, orbit: locked ? target : value, orbitLocked: locked };
  }
  if (a.type === 'harmonic' && !s.harmonicLocked) {
    const value = Math.max(0, Math.min(100, a.value));
    next = { ...s, harmonic: value, harmonicLocked: a.release !== false && value >= 64 && value <= 72 };
  }
  if (a.type === 'anchor' && a.index >= 0 && a.index < 3 && !s.anchorLocked[a.index]) {
    const target = targets[a.index]!;
    const point = { x: Math.max(8, Math.min(92, a.point.x)), y: Math.max(12, Math.min(88, a.point.y)) };
    const locked = a.release && Math.hypot(point.x - target.x, point.y - target.y) < 13;
    next = { ...s, anchors: s.anchors.map((p, i) => i === a.index ? locked ? target : point : p), anchorLocked: s.anchorLocked.map((v, i) => i === a.index ? locked : v), anchorOrder: locked ? [...s.anchorOrder, a.index] : s.anchorOrder };
  }
  return { ...next, screen: systems(next) === 3 ? 'stabilized' : 'tuning' };
}