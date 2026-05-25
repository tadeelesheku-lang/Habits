'use client';

import { useEffect, useRef, useState } from 'react';

export default function Scratchpad({ initial }: { initial: string }) {
  const [body, setBody] = useState(initial);
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setState('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      setState(res.ok ? 'saved' : 'idle');
      if (res.ok) setTimeout(() => setState('idle'), 1500);
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [body]);

  return (
    <div>
      <div className="section-head">
        <h2>Margin Notes</h2>
        <span className="save-state">
          {state === 'saving' ? 'saving…' : state === 'saved' ? 'saved ✓' : 'autosaves'}
        </span>
      </div>
      <textarea
        className="scratch"
        value={body}
        placeholder="A place for loose thoughts, half-formed plans, things to remember…"
        onChange={(e) => setBody(e.target.value)}
      />
    </div>
  );
}
