import {
  pgTable,
  serial,
  varchar,
  text,
  jsonb,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { filingsTable } from '@/schema/filings'; // Adjust the import as needed

export const form10QSectionsTable = pgTable('form_10q_sections', {
  id: serial('id').primaryKey(), // Primary key for each section

  // Foreign key reference to filingsTable (maps each section to a filing)
  filingId: integer('filing_id')
    .notNull()
    .references(() => filingsTable.id, { onDelete: 'cascade' }),

  // Section name (e.g., "1 - Financial Statements", "2 - Management’s Discussion")
  sectionName: varchar('section_name', { length: 100 }).notNull(),

  // Original text of the section
  originalText: text('original_text').notNull(),

  // Summary of the section
  summaryText: text('summary_text').notNull(),

  // Word cloud JSON data
  wordCloud: jsonb('word_cloud').notNull(),

  // Timestamp for record creation
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
