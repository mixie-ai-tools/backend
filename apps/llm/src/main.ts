import { NestFactory } from '@nestjs/core';
import { LlmModule } from './llm.module';

async function bootstrap() {
  const app = await NestFactory.create(LlmModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
