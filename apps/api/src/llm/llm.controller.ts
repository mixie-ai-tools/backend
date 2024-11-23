import { Controller, Get, Query } from '@nestjs/common';
import { LlmService } from '@/api/src/llm/llm.service';
import { LlmQueryDto } from '@app/common/dtos';
import { ValidationPipe } from '@nestjs/common';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Get()
  async getLlm(
    @Query(new ValidationPipe({ transform: true })) llmQuery: LlmQueryDto,
  ) {
    try {
      return await this.llmService.queryToEmbedding(llmQuery);
    } catch (error) {
      return { error: 'Failed to reach llm', details: error.message };
    }
  }
  @Get('/hello')
  async hello() {
    return 'hello world';
  }
}
