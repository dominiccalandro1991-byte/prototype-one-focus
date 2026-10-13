import { initialState, reducer, targets, type ObservatoryState } from './model';

export const orbitTargets = [90, 210, 330];
export const anchorOrders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];

/** Plays one complete session through the real reducer, exactly as a player's actions would. */
export function playSession(orbit: number, harmonic: number, order: number[], start: ObservatoryState = initialState()) {
  let s = reducer(start, { type: 'enter' });
  s = reducer(s, { type: 'orbit', value: orbit });
  s = reducer(s, { type: 'harmonic', value: harmonic });
  for (const i of order) s = reducer(s, { type: 'anchor', index: i, point: targets[i]!, release: true });
  s = reducer(s, { type: 'open' });
  return reducer(s, { type: 'finish' });
}

/** Runs n randomized valid sessions, resetting between each, and tallies destinations. */
export function stressTest(n: number, rand: () => number = Math.random) {
  const counts = [0, 0, 0, 0];
  let state = initialState(), leaks = 0;
  for (let k = 0; k < n; k++) {
    const orbit = orbitTargets[Math.floor(rand() * 3)]! + Math.round(rand() * 12 - 6);
    const harmonic = 64 + rand() * 8;
    const order = anchorOrders[Math.floor(rand() * 6)]!;
    const done = playSession(orbit, harmonic, order, state);
    if (done.screen !== 'signature' || done.destination === null) { leaks++; continue; }
    counts[done.destination]!++;
    state = reducer(done, { type: 'reset' });
    if (state.destination !== null || state.anchorOrder.length || state.orbitLocked || state.harmonicLocked) leaks++;
    state = { ...state, screen: 'intro' };
  }
  return { counts, leaks };
}
