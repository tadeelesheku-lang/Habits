'use client';

import { useState } from 'react';
import type { Task, Priority } from '@/lib/types';

function formatDue(d: string | null): string {
  if (!d) return '';
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function Tasks({
  initial,
  onChange,
}: {
  initial: Task[];
  onChange: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [due, setDue] = useState('');
  const [open, setOpen] = useState(false);

  async function addTask() {
    if (!title.trim()) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, notes, priority, due_date: due || null }),
    });
    if (res.ok) {
      const created = await res.json();
      setTasks((t) => [created, ...t]);
      setTitle(''); setNotes(''); setPriority('medium'); setDue(''); setOpen(false);
      onChange();
    }
  }

  async function toggle(task: Task) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !task.done }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks((list) => list.map((t) => (t.id === task.id ? updated : t)));
      onChange();
    }
  }

  async function remove(id: number) {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTasks((list) => list.filter((t) => t.id !== id));
      onChange();
    }
  }

  const openCount = tasks.filter((t) => !t.done).length;

  return (
    <div>
      <div className="section-head">
        <h2>The Docket</h2>
        <span className="meta">{openCount} open · {tasks.length} total</span>
      </div>

      <div className="card">
        {!open ? (
          <button className="btn btn-ghost" onClick={() => setOpen(true)} style={{ width: '100%' }}>
            + Enter a new item
          </button>
        ) : (
          <div className="task-form">
            <input
              className="field"
              placeholder="What needs doing?"
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && addTask()}
            />
            <textarea
              className="field"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="row">
              <select className="field" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>
              <input className="field" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
            <div className="row">
              <button className="btn" onClick={addTask}>Add to docket</button>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: open ? 22 : 0 }}>
          {tasks.length === 0 ? (
            <p className="empty">The docket is clear. A rare and beautiful thing.</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className={`task fade ${task.done ? 'done' : ''}`}>
                <button
                  className={`check ${task.done ? 'on' : ''}`}
                  onClick={() => toggle(task)}
                  aria-label="toggle"
                />
                <div className="task-body">
                  <div className="task-title">{task.title}</div>
                  {task.notes && <div className="task-notes">{task.notes}</div>}
                  <div className="task-meta">
                    <span className={`tag ${task.priority}`}>{task.priority}</span>
                    {task.due_date && <span className="due">due {formatDue(task.due_date)}</span>}
                  </div>
                </div>
                <button className="del" onClick={() => remove(task.id)} aria-label="delete">×</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
