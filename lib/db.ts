import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it in your Vercel project settings or .env file.');
}

// The neon() tagged-template client works in serverless/edge environments and
// is the recommended approach for Vercel + Neon. Each call is a single HTTP
// round trip, so no connection pooling management is needed.
export const sql = neon(process.env.DATABASE_URL);
