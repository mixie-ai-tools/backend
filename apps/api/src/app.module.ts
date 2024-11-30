// app.module.ts
import { Module } from '@nestjs/common';
import { LlmModule } from './llm';
import { SseModule } from './sse';

@Module({
  imports: [LlmModule, SseModule],
  providers: [],
})
export class AppModule {}
