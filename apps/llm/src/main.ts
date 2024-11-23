import { NestFactory } from '@nestjs/core';
import { LlmModule } from './llm.module';

import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    LlmModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL], // RabbitMQ URL
        queue: 'embeddings_queue', // The queue to listen on
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
