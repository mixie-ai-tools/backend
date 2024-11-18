import { Test, TestingModule } from '@nestjs/testing';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';

describe('LlmController', () => {
  let llmController: LlmController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LlmController],
      providers: [LlmService],
    }).compile();

    llmController = app.get<LlmController>(LlmController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(llmController.getHello()).toBe('Hello World!');
    });
  });
});
