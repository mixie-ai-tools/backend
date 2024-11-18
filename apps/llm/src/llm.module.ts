import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';

@Module({
  imports: [],
  controllers: [LlmController],
  providers: [LlmService],
})
export class LlmModule {}
