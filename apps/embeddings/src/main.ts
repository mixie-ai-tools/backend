import { NestFactory } from '@nestjs/core';
import { EmbeddingsModule } from './embeddings.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EmbeddingsModule,
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
