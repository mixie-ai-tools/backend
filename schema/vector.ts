import {
  pgTable,
  serial,
  jsonb,
  text,
  varchar,
  doublePrecision,
} from 'drizzle-orm/pg-core';

// Define the table schema
export const vectors = pgTable('vectors', {
  id: serial('id').primaryKey(),
  vector: doublePrecision('vector').array(),
  metadata: jsonb('metadata'),
  pageContent: text('page_content'),
  uniqueLoaderId: varchar('unique_loader_id', { length: 255 }),
  source: text('source'),
});

// Infer the TypeScript types for Select and Insert
export type Vector = typeof vectors.$inferSelect;
export type NewVector = typeof vectors.$inferInsert;
