import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmbeddingsService } from './embeddings.service';
import { LlmQueryDto } from '@app/common/dtos';

@Controller()
export class EmbeddingsController {
  constructor(private readonly embeddingsService: EmbeddingsService) {}

  @UsePipes(new ValidationPipe())
  @EventPattern('embeddings.process_query')
  async SecFilingsFull(@Payload() llmQuery: LlmQueryDto) {
    await this.embeddingsService.createEmbeddings(llmQuery);
  }
}
