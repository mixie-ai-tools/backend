// src/chats/dto/chat.dto.ts
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @IsNotEmpty({ message: 'Each message must have either a system, assistant or user field' })
  system?: string;
  @IsNotEmpty({ message: 'Each message must have either a system, assistant or user field' })
  assistant?: string;

  @IsNotEmpty({ message: 'Each message must have either a system, assistant or user field' })
  user?: string;
}

export class CreateChatDto {
  conversationId?: string; // Optional, can be generated in the service
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  chatBlob: ChatMessageDto[];
}
