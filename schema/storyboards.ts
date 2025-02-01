import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  // foreignKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const storyboards = pgTable('storyboards', {
  id: uuid('id').primaryKey().notNull(),
  stepOrder: jsonb('step_order')
    .default(sql`'[]'::jsonb`)
    .notNull(),
  title: text().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const storyboardSteps = pgTable('storyboard_steps', {
  id: uuid('id').primaryKey().notNull(),
  storyboardId: uuid('storyboard_id')
    .notNull()
    .references(() => storyboards.id, { onDelete: 'cascade' }), // Foreign key constraint
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const originalImage = pgTable('original_image', {
  id: uuid('id').primaryKey().notNull(),
  title: text().notNull(),
  storyboardStepId: uuid('storyboard_id')
    .notNull()
    .references(() => storyboardSteps.id, { onDelete: 'cascade' }), // Foreign key constraint
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// No changes needed for imageVariant
export const imageVariant = pgTable('image_variant', {
  id: uuid('id').primaryKey().notNull(),
  originalImageId: uuid('storyboard_id')
    .notNull()
    .references(() => originalImage.id, { onDelete: 'cascade' }), // Foreign key constraint
  aspectRatio: text(),
  url: text().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
