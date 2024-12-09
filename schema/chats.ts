import { pgTable, serial, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  conversationId: uuid("conversation_id").notNull(),
  chatBlob: jsonb("chat_blob").notNull(), // JSONB to store the entire chat history
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
