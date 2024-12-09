import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  await app.startAllMicroservices(); // Start the microservice
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,POST,PATCH,DELETE'
  });
  app.enableShutdownHooks();
  await app.listen(3001);
}
bootstrap();
