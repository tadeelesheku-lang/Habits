// Run with: npm run db:init
// Reads DATABASE_URL from .env and applies db/schema.sql to your Neon database.
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL. Add it to .env (see .env.example).');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

// Split on semicolons that end a statement. Simple but works for this schema.
const statements = schema
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

try {
  for (const statement of statements) {
    await sql.query(statement);
    console.log('OK:', statement.split('\n')[0].slice(0, 60));
  }
  // Seed a single notes row if none exists, so the scratchpad always has a target.
  const existing = await sql`SELECT id FROM notes LIMIT 1`;
  if (existing.length === 0) {
    await sql`INSERT INTO notes (body) VALUES ('')`;
    console.log('Seeded initial notes row.');
  }
  console.log('\nDatabase initialized successfully.');
  process.exit(0);
} catch (err) {
  console.error('Failed to initialize database:', err);
  process.exit(1);
}
