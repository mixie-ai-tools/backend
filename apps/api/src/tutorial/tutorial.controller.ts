import { Controller, Get } from '@nestjs/common';
import { TutorialService } from './tutorial.service';

@Controller('tutorial')
export class TutorialController {
  constructor(private tutorialService: TutorialService) {}
  @Get()
  async test() {
    return await this.tutorialService.test();
  }
}
