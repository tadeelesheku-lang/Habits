'use client';

import { useState } from 'react';
import type { HabitWithChecks } from '@/lib/types';

const DAYS = 49; // 7 weeks

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function streak(checks: Set<string>): number {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (checks.has(key)) count++;
    else if (i > 0) break; // allow today to be unchecked without breaking streak
  }
  return count;
}

function shade(color: string, on: boolean): string {
  return on ? color : 'var(--paper)';
}

export default function Habits({
  initial,
  onChange,
}: {
  initial: HabitWithChecks[];
  onChange: () => void;
}) {
  const [habits, setHabits] = useState<HabitWithChecks[]>(initial);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const dates = lastNDates(DAYS);
  const today = new Date().toISOString().slice(0, 10);

  async function addHabit() {
    if (!name.trim()) return;
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const created = await res.json();
      setHabits((h) => [...h, created]);
      setName(''); setOpen(false);
      onChange();
    }
  }

  async function toggleCheck(habitId: number, date: string) {
    const res = await fetch(`/api/habits/${habitId}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    if (res.ok) {
      const { checked } = await res.json();
      setHabits((list) =>
        list.map((h) => {
          if (h.id !== habitId) return h;
          const set = new Set(h.checks);
          if (checked) set.add(date);
          else set.delete(date);
          return { ...h, checks: [...set] };
        })
      );
      onChange();
    }
  }

  async function remove(id: number) {
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setHabits((list) => list.filter((h) => h.id !== id));
      onChange();
    }
  }

  return (
    <div>
      <div className="section-head">
        <h2>Habits</h2>
        <span className="meta">7 week view</span>
      </div>

      <div className="card">
        {habits.length === 0 && !open && (
          <p className="empty">No habits tracked yet.</p>
        )}

        {habits.map((h) => {
          const set = new Set(h.checks);
          return (
            <div key={h.id} className="habit fade">
              <div className="habit-top">
                <span className="habit-dot" style={{ background: h.color }} />
                <span className="habit-name">{h.name}</span>
                <span className="habit-streak">{streak(set)}d streak</span>
                <button className="del" style={{ opacity: 0.5 }} onClick={() => remove(h.id)}>×</button>
              </div>
              <div className="heatmap">
                {dates.map((d) => {
                  const on = set.has(d);
                  return (
                    <button
                      key={d}
                      className={`cell ${d === today ? 'today' : ''}`}
                      style={{ background: shade(h.color, on) }}
                      title={d}
                      onClick={() => toggleCheck(h.id, d)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {open ? (
          <div className="task-form" style={{ marginTop: 16 }}>
            <input
              className="field"
              placeholder="Habit name, e.g. Morning run"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            />
            <div className="row">
              <button className="btn" onClick={addHabit}>Track it</button>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-ghost"
            onClick={() => setOpen(true)}
            style={{ width: '100%', marginTop: 16 }}
          >
            + Track a new habit
          </button>
        )}
      </div>
    </div>
  );
}
