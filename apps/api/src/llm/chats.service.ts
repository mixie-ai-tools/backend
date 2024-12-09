import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { chats } from '@/schema';
import { v7 as uuid } from 'uuid';
import { CreateChatDto } from './dto/chat-create.dto';
import { UpdateChatDto } from './dto/chat-update.dto';
import { sql } from 'drizzle-orm';

@Injectable()
export class ChatsService {
  constructor(@Inject('POSTGRES_DB') private readonly db: PostgresJsDatabase) {}

  // Fetch all chats
  async getAllChats() {
    const allChats = await this.db.select().from(chats).execute();
    return allChats;
  }

  // Create a new chat
  async createChat(chatBlob: CreateChatDto): Promise<any> {
    const now = new Date();

    const insertedChat = await this.db
      .insert(chats)
      .values({
        conversationId: uuid(), // Generates a random UUID for the conversation ID
        chatBlob: chatBlob.chatBlob,
      })
      .returning();

    return insertedChat;
  }

  // Update an existing chat by conversationId
  async updateChatById(updateChatDto: UpdateChatDto): Promise<any> {
    const { conversationId, chatBlob } = updateChatDto;

    const updatedChat = await this.db
      .update(chats)
      .set({ chatBlob })
      .where(sql`${chats.conversationId} = ${updateChatDto.conversationId}`)
      .returning();

    if (updatedChat.length === 0) {
      throw new Error(`Chat with conversationId ${conversationId} not found.`);
    }

    return updatedChat;
  }
}
