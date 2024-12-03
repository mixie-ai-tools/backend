import { Controller, Get, Query } from '@nestjs/common';
import { LlmService } from '@/api/src/llm/llm.service';
import { LlmQueryDto } from '@app/common/dtos';
import { ValidationPipe } from '@nestjs/common';
// import { DocumentService } from '@/api/src/llm/document.service';
import { LmStudioEmbeddingsService } from '@/api/src/llm/lmstudio.service';

@Controller('llm')
export class LlmController {
  constructor(
    private readonly llmService: LlmService,
    private readonly lmStudioService: LmStudioEmbeddingsService
  ) {}

  // @Get()
  // async getLlm(
  //   @Query(new ValidationPipe({ transform: true })) llmQuery: LlmQueryDto,
  // ) {
  //   try {
  //     return await this.lmStudioService.queryToEmbedding(llmQuery);
  //   } catch (error) {
  //     return { error: 'Failed to reach llm', details: error.message };
  //   }
  // }


  @Get('/search')
  async search() {
    return await this.lmStudioService.search('who is dr dre', 3);
  }

  @Get('process')
  async processDocs() {
    // return this.lmStudioService.embedText('who was 2pac shakur')
    return await this.lmStudioService.processDocuments();
  }
}
