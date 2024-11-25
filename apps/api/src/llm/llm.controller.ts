import { Controller, Get, Query } from '@nestjs/common';
import { LlmService } from '@/api/src/llm/llm.service';
import { LlmQueryDto } from '@app/common/dtos';
import { ValidationPipe } from '@nestjs/common';
import { DocumentService } from './document.service';

@Controller('llm')
export class LlmController {
  constructor(
    private readonly llmService: LlmService,
    private readonly documentService: DocumentService,
  ) {}

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
    return await this.documentService.generateResponse('who is dr dre');
  }

  @Get('process')
  async processDocs() {
    return await this.documentService.processDocuments();
  }
}
