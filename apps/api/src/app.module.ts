// app.module.ts
import { Module } from '@nestjs/common';
import { LlmModule } from './llm';
import { SseModule } from './sse';
import { ShopifyModule } from './shopify/shopify.module';

@Module({
  imports: [LlmModule, SseModule, ShopifyModule],
  providers: [],
})
export class AppModule {}
