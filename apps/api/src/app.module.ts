// app.module.ts
import { Module } from '@nestjs/common';
import { LlmModule } from './llm';

@Module({
  imports: [LlmModule],
  providers: [],
})
export class AppModule {}
