// dto/sse-message.dto.ts
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Metadata {
  @IsString()
  userId: string;

  @IsString()
  type: string;
}

export class SseMessageDto {
  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => Metadata)
  metadata: Metadata;
}
