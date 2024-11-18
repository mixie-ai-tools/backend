import { IsString } from '@nestjs/class-validator';

export class LlmQueryDto {
  @IsString()
  query: string;
}
