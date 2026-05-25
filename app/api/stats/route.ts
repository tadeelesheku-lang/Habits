import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [taskRows] = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE done)::int AS done,
        COUNT(*) FILTER (WHERE NOT done)::int AS open
      FROM tasks
    `;
    const [habitRows] = await sql`SELECT COUNT(*)::int AS total FROM habits`;
    const [checkRows] = await sql`
      SELECT COUNT(*)::int AS today FROM habit_checks WHERE check_date = ${today}
    `;

    return NextResponse.json({
      tasksTotal: taskRows.total,
      tasksDone: taskRows.done,
      tasksOpen: taskRows.open,
      habitsTotal: habitRows.total,
      checksToday: checkRows.today,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
