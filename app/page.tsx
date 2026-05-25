import { sql } from '@/lib/db';
import Dashboard from '@/components/Dashboard';
import type { Task, HabitWithChecks, Note, Stats } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getData() {
  const today = new Date().toISOString().slice(0, 10);

  const tasks = (await sql`
    SELECT * FROM tasks
    ORDER BY done ASC,
      CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      due_date NULLS LAST,
      created_at DESC
  `) as Task[];

  const habitRows = (await sql`SELECT * FROM habits ORDER BY created_at ASC`) as Omit<HabitWithChecks, 'checks'>[];
  const checks = await sql`
    SELECT habit_id, to_char(check_date, 'YYYY-MM-DD') AS check_date
    FROM habit_checks WHERE check_date >= CURRENT_DATE - INTERVAL '49 days'
  `;
  const byHabit: Record<number, string[]> = {};
  for (const c of checks) (byHabit[c.habit_id] ??= []).push(c.check_date);
  const habits: HabitWithChecks[] = habitRows.map((h) => ({ ...h, checks: byHabit[h.id] ?? [] }));

  let noteRows = (await sql`SELECT * FROM notes ORDER BY id ASC LIMIT 1`) as Note[];
  if (noteRows.length === 0) {
    noteRows = (await sql`INSERT INTO notes (body) VALUES ('') RETURNING *`) as Note[];
  }
  const note = noteRows[0];

  const [taskAgg] = await sql`
    SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE done)::int AS done,
      COUNT(*) FILTER (WHERE NOT done)::int AS open
    FROM tasks
  `;
  const [checkAgg] = await sql`
    SELECT COUNT(*)::int AS today FROM habit_checks WHERE check_date = ${today}
  `;
  const stats: Stats = {
    tasksTotal: taskAgg.total,
    tasksDone: taskAgg.done,
    tasksOpen: taskAgg.open,
    habitsTotal: habits.length,
    checksToday: checkAgg.today,
  };

  return { tasks, habits, note, stats };
}

export default async function Home() {
  const { tasks, habits, note, stats } = await getData();
  const now = new Date();
  const dateline = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const issue = `No. ${Math.floor((now.getTime() / 86400000) % 1000)}`;

  return (
    <div className="wrap">
      <header className="masthead">
        <div className="masthead-top">
          <span>{dateline}</span>
          <span>Personal Edition</span>
          <span>{issue}</span>
        </div>
        <h1>Daily Ledger</h1>
        <p className="tagline">A faithful account of tasks kept, habits held, and thoughts set down</p>
      </header>

      <Dashboard tasks={tasks} habits={habits} note={note} stats={stats} dateline={dateline} />
    </div>
  );
}
