.# Daily Ledger — Personal Productivity Dashboard

A Next.js (App Router) productivity dashboard with task management, a habit tracker, and an autosaving scratchpad, backed by Neon Postgres. Built to deploy on Vercel.

## Features

- **The Docket** — tasks with priority, due dates, notes, and completion tracking
- **Habits** — a 7-week heatmap; click any cell to toggle a day, with live streak counts
- **Margin Notes** — a scratchpad that autosaves to the database as you type
- **Stat ribbon** — open/completed counts, habit totals, and today's check-ins

The frontend is an editorial "newspaper" aesthetic (Fraunces + Newsreader + JetBrains Mono), not a stock SaaS look.

## Tech stack

- Next.js 15 (App Router, edge API routes)
- React 19
- Neon serverless Postgres (`@neondatabase/serverless`)
- Plain CSS (no framework), TypeScript

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Neon database**
   - Sign up at https://console.neon.tech and create a project.
   - Copy the connection string (it looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`).

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Paste your connection string into `.env` as `DATABASE_URL`.

4. **Initialize the schema**
   ```bash
   npm run db:init
   ```
   This creates the `tasks`, `habits`, `habit_checks`, and `notes` tables and seeds an empty notes row.

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Deploying to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Vercel, click **Add New → Project** and import the repo.
3. Under **Settings → Environment Variables**, add:
   - `DATABASE_URL` = your Neon connection string
4. Deploy.

> **Tip:** You can also add the Neon integration directly from the Vercel Marketplace, which provisions the database and injects `DATABASE_URL` automatically. If you do that, you still need to run the schema once — either run `npm run db:init` locally against the same connection string, or paste the contents of `db/schema.sql` into the Neon SQL Editor.

### Running the schema in production
Because `db:init` is a one-off, the simplest path is to run it locally pointed at your production `DATABASE_URL`, or paste `db/schema.sql` into the Neon console SQL editor. The app does not auto-migrate on boot.

## Project structure

```
app/
  api/
    tasks/route.ts          GET list, POST create
    tasks/[id]/route.ts     PATCH update/toggle, DELETE
    habits/route.ts         GET list (+checks), POST create
    habits/[id]/route.ts    DELETE
    habits/[id]/check/route.ts  POST toggle a date
    notes/route.ts          GET, PUT
    stats/route.ts          GET summary counts
  layout.tsx                fonts + metadata
  page.tsx                  server component, loads initial data
  globals.css               all styling
components/
  Dashboard.tsx             client wrapper + stat ribbon
  Tasks.tsx                 task list and form
  Habits.tsx                habit heatmap
  Scratchpad.tsx            autosaving notes
db/
  schema.sql                table definitions
  init.mjs                  applies schema (npm run db:init)
lib/
  db.ts                     Neon client
  types.ts                  shared types
```

## Notes & next steps

- There's no authentication — this is a single-user dashboard. If you want it private, put it behind Vercel's password protection, or add an auth layer (e.g. Auth.js) and scope rows to a `user_id`.
- The API routes use the edge runtime, which pairs well with Neon's HTTP driver.
- To extend: add tags to tasks, weekly habit targets, or a calendar view of completed items.
