import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const tasks = await sql`
      SELECT * FROM tasks
      ORDER BY done ASC,
        CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        due_date NULLS LAST,
        created_at DESC
    `;
    return NextResponse.json(tasks);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, notes, priority, due_date } = await req.json();
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const p = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
    const rows = await sql`
      INSERT INTO tasks (title, notes, priority, due_date)
      VALUES (${title.trim()}, ${notes ?? null}, ${p}, ${due_date || null})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
