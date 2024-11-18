// app.module.ts
import { Module } from '@nestjs/common';
import { FilingsModule } from './filings';

@Module({
  imports: [FilingsModule],
  providers: [],
})
export class AppModule {}
