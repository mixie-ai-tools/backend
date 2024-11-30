// dto/sse-request.dto.ts
import { IsString } from 'class-validator';

export class SseRequestDto {
  @IsString()
  user_id: string;
}
