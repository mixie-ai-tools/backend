import { Controller, Get, Logger, Query } from '@nestjs/common';
import { LlmService } from '@/api/src/llm/llm.service';
import { LlmQueryDto } from '@app/common/dtos';
// import { ValidationPipe } from '@nestjs/common';
// import { DocumentService } from '@/api/src/llm/document.service';
import { LmStudioEmbeddingsService } from '@/api/src/llm/lmstudio.service';
import { ShopifyService } from './shopify.service';

@Controller('llm')
export class LlmController {
  constructor(
    private readonly llmService: LlmService,
    private readonly lmStudioService: LmStudioEmbeddingsService,
    private readonly shopifyService: ShopifyService
  ) {}


  @Get('/search')
  async search() {
    // return await this.lmStudioService.similaritySearch('who is dr dre', 3);
  }

  @Get('process')
  async processDocs() {
    try {
      const products  = await this.shopifyService.fetchProducts();

      return await this.lmStudioService.processDocuments();
    }catch(e){
      Logger.log(e)
    }

  }
}
