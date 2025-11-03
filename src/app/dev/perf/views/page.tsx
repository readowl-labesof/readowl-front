"use client";
import React from 'react';

export default function PerfViewsPage() {
  const [slug, setSlug] = React.useState('a-eternidade-de-ana');
  const [chapter, setChapter] = React.useState('capitulo-0-prologo');
  const [result, setResult] = React.useState<string>('');
  async function run() {
    setResult('Running...');
    const logs: string[] = [];
    try {
      const t0 = performance.now();
      const rb = await fetch(`/api/books/${slug}/views`, { cache: 'no-store' });
      const tb = performance.now();
      const jb = await rb.json().catch(() => ({}));
      logs.push(`Book views: ${((tb - t0).toFixed(1))}ms -> ${JSON.stringify(jb)}`);
    } catch (e) {
      logs.push(`Book views error: ${String(e)}`);
    }
    try {
      const tc0 = performance.now();
      const rc = await fetch(`/api/books/${slug}/chapters/${chapter}/views`, { cache: 'no-store' });
      const tc1 = performance.now();
      const jc = await rc.json().catch(() => ({}));
      logs.push(`Chapter views: ${((tc1 - tc0).toFixed(1))}ms -> status ${rc.status} ${JSON.stringify(jc)}`);
    } catch (e) {
      logs.push(`Chapter views error: ${String(e)}`);
    }
    setResult(logs.join('\n'));
    if (process.env.NODE_ENV !== 'production') {
      console.log('[PerfViewsPage]', logs);
    }
  }
  return (
    <div className="p-4">
      <h1 className="font-bold text-lg">Perf: Views endpoints</h1>
      <div className="mt-2 flex gap-2">
        <input className="border px-2 py-1" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="book slug" />
        <input className="border px-2 py-1" value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="chapter slug" />
        <button className="border px-3 py-1 bg-black text-white" onClick={run}>Run</button>
      </div>
      <pre className="mt-3 bg-gray-100 p-2 text-sm whitespace-pre-wrap">{result}</pre>
      <p className="mt-2 text-sm text-gray-600">Note: chapter views endpoint requires author/admin; otherwise returns 403.</p>
    </div>
  );
}
