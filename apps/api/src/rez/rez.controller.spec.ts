import { Test, TestingModule } from '@nestjs/testing';
import { RezController } from './rez.controller';

describe('RezController', () => {
  let controller: RezController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RezController],
    }).compile();

    controller = module.get<RezController>(RezController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
