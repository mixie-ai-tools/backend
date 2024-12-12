import { Module } from '@nestjs/common';
import { LlmController } from '@/api/src/llm/llm.controller';
import { LlmService } from '@/api/src/llm/llm.service';
import { DatabaseModule } from '@app/common/database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LmStudioEmbeddingsService } from '@/api/src/llm/lmstudio.service';
import { ShopifyService } from './shopify.service';
import { ChatsService } from './chats.service';
import { ModelProvider } from './model.provider';
import { LMStudioClient } from '@lmstudio/sdk';

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'embeddings_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [LlmController],
  providers: [
    LMStudioClient,
    {
      provide: 'MODEL_PROVIDER',
      useFactory: async (
        lmStudioClient: LMStudioClient,
      ): Promise<ModelProvider> => {
        const provider = new ModelProvider(lmStudioClient, 'embed-model', 'llm-model');

        await provider.onModuleInit();

        return provider;
      },
      inject: [LMStudioClient, ],
    },
    LlmService,
    LmStudioEmbeddingsService,
    ShopifyService,
    ChatsService,
  ],
})
export class LlmModule { }
