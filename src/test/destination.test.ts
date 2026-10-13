import { describe, expect, it } from 'vitest';
import { resolveDestination } from '@/features/observatory/model';
import { anchorOrders, orbitTargets, playSession, stressTest } from '@/features/observatory/stress';

describe('destination resolver', () => {
  it('uses the exact bucket formula', () => {
    expect(resolveDestination(0, 0, 0)).toBe(0);
    expect(resolveDestination(25, 50, 75)).toBe((1 + 2 + 3) % 4);
    expect(resolveDestination(100, 100, 100)).toBe((4 + 4 + 4) % 4);
  });
  it('reaches all four destinations through normal play', () => {
    const seen = new Set<number>();
    for (const o of orbitTargets) for (const order of anchorOrders) seen.add(playSession(o, 68, order).destination!);
    expect([...seen].sort()).toEqual([0, 1, 2, 3]);
  });
  it('is deterministic for identical inputs', () => {
    expect(playSession(210, 66, [2, 0, 1]).name).toBe(playSession(210, 66, [2, 0, 1]).name);
  });
  it('distributes across destinations and resets cleanly over many runs', () => {
    const { counts, leaks } = stressTest(2000);
    expect(leaks).toBe(0);
    for (const c of counts) expect(c).toBeGreaterThan(200);
  });
});
