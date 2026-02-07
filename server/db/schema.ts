import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const cache = pgTable('cache', {
  key: text('key').primaryKey(),
  hash: text('hash').notNull(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
