import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { destinations } from '@/features/observatory/destinations';
import { stressTest } from '@/features/observatory/stress';

export const Route = createFileRoute('/qa')({
  head: () => ({ meta: [
    { title: 'Rift QA Stress Test — Portal Masters' },
    { name: 'description', content: 'Internal tool that plays many simulated Rift sessions and tallies destinations.' },
    { name: 'robots', content: 'noindex' },
    { property: 'og:title', content: 'Rift QA Stress Test — Portal Masters' },
    { property: 'og:description', content: 'Internal destination distribution check for Prototype 1.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: QaPage,
});

function QaPage() {
  const [result, setResult] = useState<{ n: number; counts: number[]; leaks: number } | null>(null);
  const run = (n: number) => setResult({ n, ...stressTest(n) });
  return <div className="observatory-app"><main className="observatory-screen">
    <p className="eyebrow">INTERNAL QA</p><h1>Destination stress test</h1>
    <p>Plays complete simulated sessions through the real game logic, resetting between each.</p>
    <div className="signature-actions">{[100, 1000, 10000].map(n => <Button key={n} variant="rift" size="touch" onClick={() => run(n)}>RUN {n.toLocaleString()} SESSIONS</Button>)}</div>
    {result && <div className="signature-card" role="status">
      <p className="eyebrow">{result.n.toLocaleString()} sessions · reset leaks: {result.leaks}</p>
      <ul className="how-list">{destinations.map((d, i) => <li key={d.title}><span>{result.counts[i]}</span><div><strong>{d.title}</strong><p>{((result.counts[i]! / result.n) * 100).toFixed(1)}%</p></div></li>)}</ul>
      <p>{result.leaks === 0 && result.counts.every(c => c > 0) ? 'PASS — all four destinations reached, no state leaks.' : 'FAIL — check the resolver.'}</p>
    </div>}
  </main></div>;
}
