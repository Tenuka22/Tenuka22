import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';

const client = new PGlite('./.db');
export const db = drizzle(client, { schema });

// Ensure table exists
await client.exec(`
  CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    hash TEXT NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
`);
