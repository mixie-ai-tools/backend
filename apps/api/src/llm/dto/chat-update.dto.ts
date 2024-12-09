// src/chats/dto/update-chat.dto.ts
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatMessageDto } from './chat-create.dto';

export class UpdateChatDto {
  @IsNotEmpty({ message: 'conversationId is required for updates' })
  conversationId: string; // Ensure the conversationId is provided for updates

  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  chatBlob: ChatMessageDto[]; // Validate the structure of chatBlob
}
