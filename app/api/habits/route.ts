import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    // Pull habits and their checks from the last 49 days (7 weeks) for the heatmap.
    const habits = await sql`SELECT * FROM habits ORDER BY created_at ASC`;
    const checks = await sql`
      SELECT habit_id, to_char(check_date, 'YYYY-MM-DD') AS check_date
      FROM habit_checks
      WHERE check_date >= CURRENT_DATE - INTERVAL '49 days'
    `;
    const byHabit: Record<number, string[]> = {};
    for (const c of checks) {
      (byHabit[c.habit_id] ??= []).push(c.check_date);
    }
    const result = habits.map((h) => ({ ...h, checks: byHabit[h.id] ?? [] }));
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, color } = await req.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const rows = await sql`
      INSERT INTO habits (name, color)
      VALUES (${name.trim()}, ${color || '#7c9070'})
      RETURNING *
    `;
    return NextResponse.json({ ...rows[0], checks: [] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}
