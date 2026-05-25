import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    let rows = await sql`SELECT * FROM notes ORDER BY id ASC LIMIT 1`;
    if (rows.length === 0) {
      rows = await sql`INSERT INTO notes (body) VALUES ('') RETURNING *`;
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { body } = await req.json();
    const existing = await sql`SELECT id FROM notes ORDER BY id ASC LIMIT 1`;
    if (existing.length === 0) {
      const rows = await sql`INSERT INTO notes (body) VALUES (${body ?? ''}) RETURNING *`;
      return NextResponse.json(rows[0]);
    }
    const rows = await sql`
      UPDATE notes SET body = ${body ?? ''}, updated_at = NOW()
      WHERE id = ${existing[0].id} RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 });
  }
}
