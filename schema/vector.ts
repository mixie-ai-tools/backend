import {
  pgTable,
  // serial,
  jsonb,
  text,
  // varchar,
  // doublePrecision,
  vector,
  uuid,
} from 'drizzle-orm/pg-core';

// Define the table schema
export const vectors = pgTable('vectors', {
  id: uuid('id').primaryKey(), // Primary key column for unique IDs
  vector: vector('vector', { dimensions: 1536 }).notNull(), // Vector column, specify dimensions (e.g., 1536 for OpenAI embeddings)
  content: text('content').notNull(), // Text content column
  metadata: jsonb('metadata').notNull(), // JSONB column for metadata
});

// Infer the TypeScript types for Select and Insert
export type Vector = typeof vectors.$inferSelect;
export type NewVector = typeof vectors.$inferInsert;
