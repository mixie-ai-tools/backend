import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { chats } from '@/schema';
import { v7 as uuid } from 'uuid';
import { CreateChatDto } from './dto/chat-create.dto';
import { UpdateChatDto } from './dto/chat-update.dto';
import { sql } from 'drizzle-orm';

@Injectable()
export class ChatsService {
  constructor(@Inject('POSTGRES_DB') private readonly db: PostgresJsDatabase) { }

  // Fetch all chats
  async getAllChats() {
    const allChats = await this.db.select().from(chats).execute();
    return allChats;
  }


  async getAllChatById(conversationId: string) {
    const chat = await this.db.select().from(chats)
      .where(sql`${chats.conversationId} = ${conversationId}`)
      .execute();
    return chat;
  }

  async createChat(chatBlob: CreateChatDto): Promise<any> {
    const insertedChat = await this.db
      .insert(chats)
      .values({
        conversationId: uuid(),
        chatBlob: chatBlob.chatBlob,
      })
      .returning();

    return insertedChat;
  }

  async updateChatById(conversationId: string, updateChatDto: UpdateChatDto): Promise<any> {
    const updatedChat = await this.db
      .update(chats)
      .set({ chatBlob: updateChatDto })
      .where(sql`${chats.conversationId} = ${conversationId}`)
      .returning();

    if (updatedChat.length === 0) {
      throw new Error(`Chat with conversationId ${conversationId} not found.`);
    }

    return updatedChat;
  }
}
