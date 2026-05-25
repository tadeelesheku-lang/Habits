import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

// Toggle a habit check for a date (defaults to today). Returns { checked: boolean }.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const habitId = Number(id);
    if (!Number.isInteger(habitId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    let date: string;
    try {
      const body = await req.json();
      date = body?.date || new Date().toISOString().slice(0, 10);
    } catch {
      date = new Date().toISOString().slice(0, 10);
    }

    const existing = await sql`
      SELECT id FROM habit_checks WHERE habit_id = ${habitId} AND check_date = ${date}
    `;

    if (existing.length > 0) {
      await sql`DELETE FROM habit_checks WHERE habit_id = ${habitId} AND check_date = ${date}`;
      return NextResponse.json({ checked: false, date });
    }

    await sql`
      INSERT INTO habit_checks (habit_id, check_date) VALUES (${habitId}, ${date})
      ON CONFLICT (habit_id, check_date) DO NOTHING
    `;
    return NextResponse.json({ checked: true, date });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to toggle check' }, { status: 500 });
  }
}
