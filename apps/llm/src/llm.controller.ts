import { Controller, Get } from '@nestjs/common';
import { LlmService } from './llm.service';

@Controller()
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Get()
  getHello(): string {
    return this.llmService.getHello();
  }
}
