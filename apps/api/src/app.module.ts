// app.module.ts
import { Module } from '@nestjs/common';
import { LlmModule } from './llm';
import { SseModule } from './sse';
import { ShopifyModule } from './shopify/shopify.module';
import { ShopController } from './shop/shop.controller';
import { RezController } from './rez/rez.controller';
import { TutorialController } from './tutorial/tutorial.controller';
import { TutorialService } from './tutorial/tutorial.service';

@Module({
  imports: [LlmModule, SseModule, ShopifyModule],
  providers: [TutorialService],
  controllers: [ShopController, RezController, TutorialController],
})
export class AppModule {}
