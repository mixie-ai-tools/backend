import { Controller, Get } from '@nestjs/common';
import { StoryboardService as StoryboardService } from './storyboard.service';

@Controller('storyboard')
export class StoryboardController {
  constructor(private storyboardService: StoryboardService) {}
  @Get()
  async test() {
    return await this.storyboardService.test();
  }
}
