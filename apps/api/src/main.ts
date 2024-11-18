import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  // Set up RabbitMQ client options if using microservices

  await app.startAllMicroservices(); // Start the microservice
  app.enableCors({});
  await app.listen(3000);
}
bootstrap();
