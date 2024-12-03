import { Module } from '@nestjs/common';
import { LlmController } from '@/api/src/llm/llm.controller';
import { LlmService } from '@/api/src/llm/llm.service';
// import { DocumentService } from './document.service';
import { DatabaseModule } from '@app/common/database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LmStudioEmbeddingsService } from '@/api/src/llm/lmstudio.service';


@Module({
  imports: [
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL], // RabbitMQ URL
          queue: 'embeddings_queue', // The queue to communicate with
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [LlmController],
  providers: [LlmService, LmStudioEmbeddingsService],// DocumentService,
})
export class LlmModule {}
