'use client';

import { useState, useCallback } from 'react';
import type { Task, HabitWithChecks, Note, Stats } from '@/lib/types';
import Tasks from './Tasks';
import Habits from './Habits';
import Scratchpad from './Scratchpad';

export default function Dashboard({
  tasks,
  habits,
  note,
  stats: initialStats,
  dateline,
}: {
  tasks: Task[];
  habits: HabitWithChecks[];
  note: Note;
  stats: Stats;
  dateline: string;
}) {
  const [stats, setStats] = useState<Stats>(initialStats);

  const refreshStats = useCallback(async () => {
    const res = await fetch('/api/stats');
    if (res.ok) setStats(await res.json());
  }, []);

  return (
    <>
      <div className="ribbon">
        <div className="stat">
          <div className="num">{stats.tasksOpen}</div>
          <div className="lbl">Open Items</div>
        </div>
        <div className="stat">
          <div className="num">{stats.tasksDone}</div>
          <div className="lbl">Completed</div>
        </div>
        <div className="stat">
          <div className="num">{stats.habitsTotal}</div>
          <div className="lbl">Habits</div>
        </div>
        <div className="stat">
          <div className="num">{stats.checksToday}</div>
          <div className="lbl">Checked Today</div>
        </div>
      </div>

      <div className="columns">
        <div>
          <Tasks initial={tasks} onChange={refreshStats} />
        </div>
        <div>
          <Habits initial={habits} onChange={refreshStats} />
          <Scratchpad initial={note.body} />
        </div>
      </div>
    </>
  );
}
