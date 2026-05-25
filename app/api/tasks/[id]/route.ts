import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = Number(id);
    if (!Number.isInteger(taskId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const body = await req.json();

    // Toggle done: also stamp/clear completed_at.
    if (typeof body.done === 'boolean') {
      const rows = await sql`
        UPDATE tasks
        SET done = ${body.done},
            completed_at = ${body.done ? new Date().toISOString() : null}
        WHERE id = ${taskId}
        RETURNING *
      `;
      if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(rows[0]);
    }

    // Field updates.
    const title = body.title?.trim();
    const rows = await sql`
      UPDATE tasks SET
        title = COALESCE(${title ?? null}, title),
        notes = COALESCE(${body.notes ?? null}, notes),
        priority = COALESCE(${body.priority ?? null}, priority),
        due_date = COALESCE(${body.due_date ?? null}, due_date)
      WHERE id = ${taskId}
      RETURNING *
    `;
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = Number(id);
    if (!Number.isInteger(taskId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    await sql`DELETE FROM tasks WHERE id = ${taskId}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
