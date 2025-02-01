import { Module } from '@nestjs/common';
import { StoryboardController } from './storyboard/storyboard.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [StoryboardController],
})
export class AppModule {}
